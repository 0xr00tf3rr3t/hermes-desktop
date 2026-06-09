import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the config module the secrets layer depends on.
vi.mock("../config", () => ({
  getConfigValue: vi.fn(),
  readEnv: vi.fn(),
}));
import { getConfigValue, readEnv } from "../config";
import { getSecret, getSecretsProvider, resolvedSecrets } from "./index";

const mockedGetConfigValue = vi.mocked(getConfigValue);
const mockedReadEnv = vi.mocked(readEnv);

describe("secrets resolution", () => {
  beforeEach(() => {
    mockedGetConfigValue.mockReset();
    mockedReadEnv.mockReset();
    mockedReadEnv.mockReturnValue({});
    delete process.env.SECRETS_TEST_KEY;
  });
  afterEach(() => {
    delete process.env.SECRETS_TEST_KEY;
  });

  it("defaults to the env provider when secrets.provider is unset", () => {
    mockedGetConfigValue.mockReturnValue(null);
    expect(getSecretsProvider().id).toBe("env");
  });

  it("selects the command provider when configured", () => {
    mockedGetConfigValue.mockImplementation((key: string) =>
      key === "secrets.provider" ? "command" : null,
    );
    expect(getSecretsProvider().id).toBe("command");
  });

  it("backwards-compat: with no provider configured, getSecret matches readEnv", () => {
    mockedGetConfigValue.mockReturnValue(null);
    mockedReadEnv.mockReturnValue({ DEEPSEEK_API_KEY: "from-dotenv" });
    expect(getSecret("DEEPSEEK_API_KEY")).toBe("from-dotenv");
  });

  it("resolution order: process.env wins over the provider", () => {
    mockedGetConfigValue.mockReturnValue(null);
    mockedReadEnv.mockReturnValue({ SECRETS_TEST_KEY: "from-dotenv" });
    process.env.SECRETS_TEST_KEY = "from-process-env";
    expect(getSecret("SECRETS_TEST_KEY")).toBe("from-process-env");
  });

  it("resolution order: provider used when process.env lacks the key", () => {
    mockedGetConfigValue.mockReturnValue(null);
    mockedReadEnv.mockReturnValue({ SECRETS_TEST_KEY: "from-dotenv" });
    expect(getSecret("SECRETS_TEST_KEY")).toBe("from-dotenv");
  });

  it("returns null when nothing has the key", () => {
    mockedGetConfigValue.mockReturnValue(null);
    mockedReadEnv.mockReturnValue({});
    expect(getSecret("NOPE_KEY")).toBeNull();
  });

  it("treats an empty-string value as absent (falls through)", () => {
    mockedGetConfigValue.mockReturnValue(null);
    mockedReadEnv.mockReturnValue({ SECRETS_TEST_KEY: "" });
    expect(getSecret("SECRETS_TEST_KEY")).toBeNull();
  });

  it("resolvedSecrets overlays process.env on top of the provider map", () => {
    mockedGetConfigValue.mockReturnValue(null);
    mockedReadEnv.mockReturnValue({
      SECRETS_TEST_KEY: "from-dotenv",
      OTHER_KEY: "keep",
    });
    process.env.SECRETS_TEST_KEY = "from-process-env";
    const merged = resolvedSecrets();
    expect(merged.SECRETS_TEST_KEY).toBe("from-process-env");
    expect(merged.OTHER_KEY).toBe("keep");
  });
});
