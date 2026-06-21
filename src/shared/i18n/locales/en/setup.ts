export default {
  title: "Set Up Your AI Provider",
  subtitle: "Choose a provider and configure it to get started",
  providerCards: {
    openrouter: { name: "OpenRouter", desc: "200+ models", tag: "Recommended" },
    anthropic: { name: "Anthropic", desc: "Claude models", tag: "" },
    openai: { name: "OpenAI", desc: "GPT models", tag: "" },
    local: {
      name: "Local / OpenAI-Compatible",
      desc: "LM Studio, Ollama, Groq, DeepSeek, Together…",
      tag: "",
    },
  },
  localPresets: {
    lmstudio: "LM Studio",
    atomicchat: "Atomic Chat",
    ollama: "Ollama",
    vllm: "vLLM",
    llamacpp: "llama.cpp",
    groq: "Groq",
    deepseek: "DeepSeek",
    together: "Together AI",
    fireworks: "Fireworks",
    cerebras: "Cerebras",
    atlascloud: "AtlasCloud",
    mistral: "Mistral",
    aimlapi: "AIML API",
  },
  serverPreset: "Server Preset",
  localGroupLabel: "Local Servers",
  remoteGroupLabel: "Remote OpenAI-Compatible APIs",
  serverUrl: "Base URL",
  modelName: "Model Name",
  localServerHint: "Make sure your local server is running before continuing",
  customServerHint: "Pick a preset or paste any OpenAI-compatible base URL",
  customApiKeyLabel: "API Key",
  customApiKeyHint: "Required for remote APIs. Leave blank for localhost.",
  defaultModelHint: "Leave blank to use the server's default model",
  missingApiKey: "Please enter an API key",
  missingServerUrl: "Please enter the server URL",
  saveFailed: "Failed to save configuration",
  noKeyHint: "Don't have a key? Get one here",
  continue: "Continue",
  saving: "Saving...",
  apiKeyLabel: "{{provider}} API Key",
  noApiKeyRequired:
    "{{provider}} does not require an API key. Hermes will use your local CLI/OAuth configuration.",
  localNoKeyNeeded: "No API key needed",
  localLlm: "Local LLM",
  modelBaseUrlPlaceholder: "http://localhost:1234/v1",
  modelNamePlaceholder: "e.g. llama-3.1-8b",

  // Secrets onboarding step (stage 2 of setup)
  back: "Back",
  finish: "Finish setup",
  secretsStepTitle: "Where should your keys live?",
  secretsTitle: "Set Up Your Security Provider",
  secretsSubtitle: "Choose where Hermes reads your API keys from",
  secretsHelpLabel: "Open the secrets & vault setup guide",
  secretsHelpTitle: "Secrets & Vault Setup",
  secretsHelpLead:
    "Hermes can read your AI provider API key from a vault instead of a plaintext file. The key never sits on disk in the clear, and the app only ever sees credential names — never the values.",
  secretsHelpBackendsH: "Pick a backend",
  secretsHelpEnv:
    "Reads a plaintext .env. Simplest, but the key sits on disk unencrypted — fine for a throwaway box, migrate when ready.",
  secretsHelpCommand:
    "Runs any command that prints KEY=value lines (KeePassXC, pass, secret-tool, gpg, or your own script). Fully offline, most flexible.",
  secretsHelpBitwarden:
    "Bitwarden Secrets Manager via bws. Lowest maintenance if you're OK with a cloud backend.",
  secretsHelpCreateH: "Create a vault from zero",
  secretsHelpCreate1:
    "Install a vault CLI — KeePassXC ships keepassxc-cli (apt install keepassxc), or use pass / secret-tool / gpg.",
  secretsHelpCreate2:
    "Create the database (use --set-password instead for a passphrase):",
  secretsHelpCreate3:
    "Add one entry per credential — entry title must equal the env-var name (or an accepted alias). The value is read from stdin, never the command line:",
  secretsHelpCreate4:
    "Wire the read command: point secrets.command at whatever prints the resolved KEY=value lines. Keep the vault unlocked when the app starts.",
  secretsHelpCreate5:
    "Test (names only): the test button lists which key names resolved and a count — never the values.",
  secretsHelpCustomH: "Custom command",
  secretsHelpCustom:
    'The Vault command backend accepts ANY command — that\'s your custom security provider. Pick "Vault command" and, if no KeePassXC vault is auto-detected, enter your own read command:',
  secretsHelpTpmH: "TPM-sealing the key-file (optional)",
  secretsHelpTpm:
    "A key-file-only vault unlocks with no passphrase, so the key-file itself must be protected. TPM-sealing binds it to THIS machine — copied elsewhere, the sealed blob is useless. The Setup screen's \"Seal to TPM\" button does this when it can; if it reports a privilege fallback, run the one-time command below yourself (it needs polkit/root, which a GUI app can't request):",
  secretsHelpTpm1:
    "Seal it (writes a TPM-bound <keyfile>.tpm blob; needs systemd-creds + a TPM 2.0 chip):",
  secretsHelpTpm2:
    "If you have no TPM or systemd-creds, the key-file falls back to 0600 (owner-only) permissions — still protected at rest, just not hardware-bound. The app reports honestly which of these happened; it never pretends a key is sealed when it isn't.",
  secretsHelpAliasH: "Aliases just work.",
  secretsHelpAlias:
    "A vault that stores your Anthropic credential under a gateway or OAuth-token name still satisfies the ANTHROPIC_API_KEY check — accepted aliases are mapped automatically. Don't copy an OAuth token into the literal ANTHROPIC_API_KEY slot; that breaks the OAuth auth path.",
  secretsHelpMultiH: "Using multiple profiles?",
  secretsHelpMulti:
    "Secrets resolution is per-profile. If a profile reports a key missing after you switch to it, that profile's config has no secrets block — add the same secrets: command block to every profile that should resolve from the vault.",
  secretsHelpGoldenH: "Golden rule.",
  secretsHelpGolden:
    "No reversible secret on disk in plaintext. If a value ever appears on screen, in a log, or in a transcript, treat it as exposed and rotate it at the provider's console.",
  secretsStepSubtitle:
    "Hermes can read API keys from a vault instead of a plaintext file. You can change this anytime in Settings → Security Providers.",
  secrets_envTitle: "Plain file (.env)",
  secrets_envTag: "Recommended to start",
  secrets_commandTitle: "Vault command",
  secrets_commandTag: "Offline / KeePassXC, pass…",
  secrets_bitwardenTitle: "Bitwarden",
  secrets_bitwardenTag: "Cloud secrets manager",
  secretsCommandLabel: "Custom helper command",
  secretsCommandSetupHint:
    "You'll need a vault first. For KeePassXC: install keepassxc (provides keepassxc-cli), then create a vault — `keepassxc-cli db-create ~/secrets/h.kdbx --set-password` — and add an entry per key (entry title = the key name, e.g. OPENROUTER_API_KEY). The helper below reads from it. Keep the vault unlocked when Hermes starts. Full guide: hermes secrets — `configuring-secret-providers` skill.",
  secretsCommandHint:
    "Use ANY backend here — KeePassXC, pass, secret-tool, gpg, or your own script. Runs a helper that prints the secret; the key name arrives in $HERMES_SECRET_KEY. This is your custom security provider. Leave blank to fill it in later in Settings.",
  secretsBitwardenHint:
    "Finish Bitwarden setup from the terminal after this: hermes secrets bitwarden setup",
  secretsKeyStillSavedHint:
    "The key you just entered is saved either way — this only changes where Hermes looks for keys going forward.",
  secretsTestVault: "Test vault",
  secretsTesting: "Testing…",
  secretsVaultResolved: "✓ Vault unlocked — resolves {{count}} key(s).",
  secretsVaultEmpty:
    "No keys resolved. Check the helper command, or that the vault is unlocked.",
  keyFromVault:
    "✓ {{key}} is resolved from your vault — no need to enter it. ({{provider}})",
  // Toggle shown when the vault already provides the model credential: the user
  // can use it, or override by entering their own API key.
  keySourceLabel: "API key source",
  keyUseVault: "Use vault credential",
  keyEnterManual: "Enter an API key",

  // ── First-run vault onboarding ──────────────────────────────────────────
  vaultChecking: "Checking for an existing vault…",
  vaultDetected: "Detected existing vault ({{count}} key(s))",
  vaultKeysLabel: "Keys this vault can resolve",
  vaultNoneFoundCanCreate:
    "No vault found yet. Create an encrypted KeePassXC vault and Hermes will wire it up for you — no manual command needed.",
  vaultCreateBtn: "Create a new encrypted vault",
  vaultCreating: "Creating vault…",
  vaultCreatedTitle: "Encrypted vault created",
  vaultCreatedHint:
    "Hermes set up the helper command for you. Add your API keys as entries (entry title = the key name) and they'll be resolved automatically.",
  vaultKeepassxcMissingTitle: "KeePassXC isn't installed",
  vaultKeepassxcMissingHint:
    "Install keepassxc (provides keepassxc-cli), then reopen this step to create a vault. You can also paste your own helper command below.",
  vaultCreateErr_notInstalled:
    "keepassxc-cli isn't installed. Install the keepassxc package, then try again — or enter a helper command below.",
  vaultCreateErr_exists:
    "A vault already exists at that location. Reopen this step to detect it, or point the helper command below at it.",
  vaultCreateErr_dbFailed:
    "Couldn't create the vault database. Check that the target folder is writable, then try again.",
  vaultCreateErr_exception:
    "Something went wrong creating the vault. Try again, or enter a helper command below.",
  vaultCreateErr_unknown:
    "Couldn't create the vault. Try again, or enter a helper command below.",
  vaultTpmOfferTitle: "Seal to TPM for auto-unlock at boot",
  vaultTpmOfferHint:
    "Optional: protect the vault key with this machine's TPM so Hermes can unlock it automatically at startup. You can skip this and unlock manually instead.",
  vaultTpmSealBtn: "Seal to TPM",
  vaultTpmSealing: "Sealing…",
  vaultTpmSkip: "Skip for now",
  vaultTpmSealed: "✓ Key sealed to the TPM — Hermes can auto-unlock at boot.",
  vaultTpmFallback:
    "TPM unavailable — key protected with file permissions (0600) instead.",
  vaultSealFailed:
    "Couldn't seal to the TPM. Your key is still protected with file permissions — you can continue.",
  secretsCommandPrefilledHint:
    "Pre-filled from the detected vault. Leave it as-is, or edit if your setup differs.",
} as const;
