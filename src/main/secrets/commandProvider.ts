import { execFileSync } from "child_process";
import type { SecretsProvider } from "./provider";
import { getConfigValue } from "../config";

/** Hard cap so a hung helper can never wedge a turn. */
const COMMAND_TIMEOUT_MS = 10_000;
/** Defensive cap on helper output (1 MiB) — a misbehaving command can't OOM us. */
const MAX_OUTPUT_BYTES = 1024 * 1024;

/**
 * Parse a `secret-fetch` command's stdout. Supports BOTH shapes (design (c)):
 *   - a bare value (single secret): the whole trimmed stdout is the value.
 *   - a dotenv blob (KEY=VALUE lines): when stdout has '=' lines, parse them and
 *     return the entry for `wantedKey`. This maps directly onto a vault that
 *     dumps an env file (mumbo's tmpfs workflow) as well as a per-key helper.
 *
 * A line is treated as a KEY=VALUE pair only when it matches an env-key shape
 * before the '='; otherwise the output is taken as a bare value.
 */
export function parseSecretOutput(
  stdout: string,
  wantedKey: string,
): string | null {
  const text = stdout.replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const ENV_LINE = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/;

  const unquote = (v: string): string => {
    const t = v.trim();
    if (
      (t.startsWith('"') && t.endsWith('"')) ||
      (t.startsWith("'") && t.endsWith("'"))
    ) {
      return t.slice(1, -1);
    }
    return t;
  };

  // 1. Exact dotenv match wins: scan for a `wantedKey=...` line. This is
  //    deterministic and never returns another key's value.
  const dotenvLines = lines
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && ENV_LINE.test(l));
  for (const line of dotenvLines) {
    const m = line.match(ENV_LINE)!;
    if (m[1] === wantedKey) {
      const value = unquote(m[2]);
      return value !== "" ? value : null;
    }
  }

  // 2. The output is a multi-key dotenv dump that does NOT contain the wanted
  //    key → null, rather than mis-returning an unrelated line as a bare value.
  if (dotenvLines.length > 0) return null;

  // 3. Otherwise treat the whole output as a single bare value (a per-key
  //    helper that printed just the secret).
  const value = text.trim();
  return value !== "" ? value : null;
}

/**
 * `command` secrets provider — resolves a secret by running a user-configured
 * helper command (e.g. `keepassxc-cli`, `secret-tool`, or a script that cats a
 * tmpfs env file). The command comes from `secrets.command` in config.yaml.
 *
 * Security model:
 *   - The command string is the USER'S OWN configuration (same trust level as
 *     the `.env` file they control), so it is run via `sh -c <command>`.
 *   - The requested key is passed to the child ONLY via the `HERMES_SECRET_KEY`
 *     environment variable — it is NEVER interpolated into the shell string, so
 *     a hostile key name (e.g. `"; rm -rf ~`) is inert data, not code.
 *   - Hard timeout + output cap; any failure (non-zero exit, timeout, empty)
 *     resolves to null rather than throwing.
 *   - Resolved values are never logged or written to disk.
 *   - The helper inherits the current process environment (so it can find PATH,
 *     HOME, DISPLAY, etc.) plus `HERMES_SECRET_KEY`. That means a helper can see
 *     secrets already present in the environment — acceptable because the helper
 *     is the user's own configured binary, but noted so the trust scope is explicit.
 *   - Used only for targeted single-key resolution and `list()` (which runs the
 *     helper at most once); it is NEVER called per-key in a loop, so a helper
 *     that blocks (e.g. on a vault unlock prompt) can't be spawned dozens of
 *     times for one message.
 */
export class CommandSecretsProvider implements SecretsProvider {
  readonly id = "command";

  private command(profile?: string): string | null {
    const cmd = getConfigValue("secrets.command", profile);
    return cmd && cmd.trim() !== "" ? cmd : null;
  }

  get(key: string, profile?: string): string | null {
    const command = this.command(profile);
    if (!command) return null;
    try {
      const stdout = execFileSync("/bin/sh", ["-c", command], {
        // Key passed as DATA via env — never interpolated into the command.
        env: { ...process.env, HERMES_SECRET_KEY: key },
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT_BYTES,
        encoding: "utf-8",
        windowsHide: true,
      });
      return parseSecretOutput(stdout, key);
    } catch {
      // Non-zero exit, timeout, spawn failure — degrade to "no value".
      return null;
    }
  }

  /**
   * Enumeration is not generally possible for a per-key helper, so this returns
   * the dotenv map ONLY when the helper (run once with no specific key) emits a
   * KEY=VALUE blob. A bare-value helper returns `{}` — `get()` still resolves
   * individual keys.
   */
  list(profile?: string): Record<string, string> {
    const command = this.command(profile);
    if (!command) return {};
    try {
      const stdout = execFileSync("/bin/sh", ["-c", command], {
        env: { ...process.env, HERMES_SECRET_KEY: "" },
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT_BYTES,
        encoding: "utf-8",
        windowsHide: true,
      });
      const out: Record<string, string> = {};
      const ENV_LINE = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/;
      for (const raw of stdout.replace(/\r\n/g, "\n").split("\n")) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const m = line.match(ENV_LINE);
        if (!m) continue;
        let value = m[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        out[m[1]] = value;
      }
      return out;
    } catch {
      return {};
    }
  }
}
