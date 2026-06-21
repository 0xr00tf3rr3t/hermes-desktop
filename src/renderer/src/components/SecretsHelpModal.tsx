import { X } from "lucide-react";
import { useI18n } from "./useI18n";

/**
 * In-app help for the secrets/vault stage. Renders the guide content natively
 * (no external URL — works fully offline, no remote dependency), so the help
 * icon never 404s and respects an offline-first posture. The same content is
 * mirrored as a shareable HTML doc in docs/secrets-vault-guide.html for GitHub.
 */
function SecretsHelpModal({
  onClose,
}: {
  onClose: () => void;
}): React.JSX.Element {
  const { t } = useI18n();
  return (
    <div className="models-modal-overlay" onClick={onClose}>
      <div
        className="secrets-help-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("setup.secretsHelpLabel")}
      >
        <div className="models-modal-header">
          <h2 className="models-modal-title">{t("setup.secretsHelpTitle")}</h2>
          <button
            className="btn-ghost"
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="secrets-help-body">
          <p className="secrets-help-lead">{t("setup.secretsHelpLead")}</p>

          <h3>{t("setup.secretsHelpBackendsH")}</h3>
          <ul>
            <li>
              <strong>{t("setup.secrets_envTitle")}</strong> —{" "}
              {t("setup.secretsHelpEnv")}
            </li>
            <li>
              <strong>{t("setup.secrets_commandTitle")}</strong> —{" "}
              {t("setup.secretsHelpCommand")}
            </li>
            <li>
              <strong>{t("setup.secrets_bitwardenTitle")}</strong> —{" "}
              {t("setup.secretsHelpBitwarden")}
            </li>
          </ul>

          <h3>{t("setup.secretsHelpCreateH")}</h3>
          <ol className="secrets-help-steps">
            <li>{t("setup.secretsHelpCreate1")}</li>
            <li>
              {t("setup.secretsHelpCreate2")}
              <pre>
                <code>
                  keepassxc-cli db-create --set-key-file &lt;keyfile&gt;
                  &lt;db&gt;.kdbx
                </code>
              </pre>
            </li>
            <li>
              {t("setup.secretsHelpCreate3")}
              <pre>
                <code>
                  keepassxc-cli add --username svc --password-prompt
                  &lt;db&gt;.kdbx ANTHROPIC_API_KEY
                </code>
              </pre>
            </li>
            <li>{t("setup.secretsHelpCreate4")}</li>
            <li>{t("setup.secretsHelpCreate5")}</li>
          </ol>

          <h3>{t("setup.secretsHelpCustomH")}</h3>
          <p>{t("setup.secretsHelpCustom")}</p>
          <pre>
            <code>
              secrets:{"\n"} provider: command{"\n"} command: &lt;any command
              that prints KEY=value lines&gt;
            </code>
          </pre>

          <h3>{t("setup.secretsHelpTpmH")}</h3>
          <p>{t("setup.secretsHelpTpm")}</p>
          <p className="secrets-help-substep">{t("setup.secretsHelpTpm1")}</p>
          <pre>
            <code>
              sudo systemd-creds encrypt --with-key=tpm2 &lt;keyfile&gt;
              &lt;keyfile&gt;.tpm
            </code>
          </pre>
          <p className="secrets-help-substep">{t("setup.secretsHelpTpm2")}</p>

          <div className="secrets-help-callout secrets-help-warn">
            <strong>{t("setup.secretsHelpAliasH")}</strong>{" "}
            {t("setup.secretsHelpAlias")}
          </div>

          <h3>{t("setup.secretsHelpMultiH")}</h3>
          <p>{t("setup.secretsHelpMulti")}</p>

          <div className="secrets-help-callout secrets-help-danger">
            <strong>{t("setup.secretsHelpGoldenH")}</strong>{" "}
            {t("setup.secretsHelpGolden")}
          </div>
        </div>

        <div className="models-modal-footer">
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecretsHelpModal;
