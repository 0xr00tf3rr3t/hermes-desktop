import type { SecretsProvider } from "./provider";
import { EnvSecretsProvider } from "./envProvider";
import { CommandSecretsProvider } from "./commandProvider";
import { getConfigValue } from "../config";

export type { SecretsProvider } from "./provider";

const envProvider = new EnvSecretsProvider();
const commandProvider = new CommandSecretsProvider();

/**
 * Select the configured secrets provider for a profile. Reads
 * `secrets.provider` from config.yaml; anything other than "command" (including
 * unset) falls back to the default `env` provider — so a zero-config install is
 * unchanged.
 */
export function getSecretsProvider(profile?: string): SecretsProvider {
  const id = (getConfigValue("secrets.provider", profile) || "").trim();
  if (id === "command") return commandProvider;
  return envProvider;
}

/**
 * Resolve a single secret by its env-var name, applying the resolution order:
 *   1. process.env[key]     — runtime-injected secrets (e.g. a vault that
 *      unseals into the process environment) take precedence.
 *   2. configured provider  — env (.env file) or command (a helper).
 *   3. null.
 *
 * Never throws. This is the entry point secret consumers should call instead of
 * reaching into `readEnv()` directly when they want the FULLY-resolved value.
 */
export function getSecret(key: string, profile?: string): string | null {
  const fromEnv = process.env[key];
  if (fromEnv != null && fromEnv !== "") return fromEnv;
  return getSecretsProvider(profile).get(key, profile);
}

/**
 * The fully-resolved secret map: the configured provider's enumerable secrets
 * with the current process environment overlaid (process.env wins, mirroring
 * `getSecret`'s precedence). Use when a caller needs the whole set rather than
 * one key. Callers that specifically want the on-disk `.env` file view should
 * keep using `readEnv()`.
 */
export function resolvedSecrets(profile?: string): Record<string, string> {
  const base = getSecretsProvider(profile).list(profile);
  const merged: Record<string, string> = { ...base };
  for (const [k, v] of Object.entries(process.env)) {
    if (v != null && v !== "") merged[k] = v;
  }
  return merged;
}
