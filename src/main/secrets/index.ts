import type { SecretsProvider } from "./provider";
import { EnvSecretsProvider } from "./envProvider";
import { CommandSecretsProvider } from "./commandProvider";
import { getConfigValue } from "../config";

export type { SecretsProvider } from "./provider";

const envProvider = new EnvSecretsProvider();
const commandProvider = new CommandSecretsProvider();

/** Unknown `secrets.provider` ids already warned about — one log line per id. */
const warnedUnknownProviderIds = new Set<string>();

/**
 * Select the configured secrets provider for a profile. Reads
 * `secrets.provider` from config.yaml; anything other than "command" (including
 * unset) falls back to the default `env` provider — so a zero-config install is
 * unchanged. An unrecognized NON-EMPTY id still falls back to `env`, but warns
 * once so a typo (e.g. "comand") doesn't silently mask a vault-backed setup.
 */
export function getSecretsProvider(profile?: string): SecretsProvider {
  const id = (getConfigValue("secrets.provider", profile) || "").trim();
  if (id === "command") return commandProvider;
  if (id && id !== "env" && !warnedUnknownProviderIds.has(id)) {
    warnedUnknownProviderIds.add(id);
    console.warn(
      `[secrets] unknown secrets.provider "${id}"; falling back to env`,
    );
  }
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

/**
 * The configured provider's enumerable secrets only (no process.env overlay),
 * resolved at most once. Intended for the gateway-spawn broadcast loop, which
 * already layers process.env separately and wants to fill ONLY the keys the
 * provider can positively enumerate — a bare-value `command` helper returns {}
 * here, so its single value is never sprayed across every known key name. Never
 * throws.
 */
export function providerListSafe(profile?: string): Record<string, string> {
  try {
    return getSecretsProvider(profile).list(profile);
  } catch {
    return {};
  }
}

/**
 * Audit-facing view: the same fully-resolved map as `resolvedSecrets()`, but
 * ALSO overlays the parsed `.env` file beneath the provider. This mirrors
 * getApiServerKey()'s order (process.env > .env > provider) and is the
 * authoritative "do I have this key, anywhere?" view for checks that need to
 * reason about whether a secret is configured at all, not about which layer it
 * came from.
 *
 * The default `env` provider returns the .env map unchanged, so env-provider
 * users see no behavior change. For a `command` provider pointing at a vault
 * dump, this is what lets the config-health audit avoid false
 * "API_SERVER_KEY is not set" warnings for vault-only users.
 *
 * Never throws.
 */
export function resolvedSecretMap(profile?: string): Record<string, string> {
  // Start with the provider (lowest precedence). .env then process.env
  // REPLACE any keys they have, in order — so the final precedence is
  // process.env > .env > provider, matching getSecret() and getApiServerKey().
  const merged: Record<string, string> = { ...providerListSafe(profile) };
  // Overlay the .env file above the provider — explicit .env entries win
  // over vault values, matching the gateway's own resolution policy. The
  // .env reader is a shared cached object, so copy before mutating.
  try {
    // Lazy require to avoid a circular import (config -> secrets -> config).
    const { readEnv } = require("../config") as typeof import("../config");
    const env = readEnv(profile);
    for (const [k, v] of Object.entries(env)) {
      if (v != null && v !== "") merged[k] = v;
    }
  } catch {
    // config not loadable — provider-only view is fine for the audit
  }
  // Overlay process.env above .env (top of the precedence chain).
  for (const [k, v] of Object.entries(process.env)) {
    if (v != null && v !== "") merged[k] = v;
  }
  return merged;
}
