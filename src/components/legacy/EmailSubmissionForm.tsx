import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import SectionHeading from "@/components/SectionHeading";

type SubmissionFieldType = "text" | "email" | "url" | "date" | "textarea";

interface SubmissionField {
  name: string;
  label: string;
  type?: SubmissionFieldType;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  autoComplete?: string;
  rows?: number;
  wide?: boolean;
}

interface EmailSubmissionFormProps {
  eyebrow: string;
  title: string;
  description: string;
  submissionLabel: string;
  subjectPrefix: string;
  submitLabel: string;
  fields: SubmissionField[];
}

const SUBMISSION_EMAIL = "info@highlandxr.com";

function buildInitialValues(fields: SubmissionField[]) {
  return Object.fromEntries(fields.map((field) => [field.name, ""]));
}

function buildEmailBody(submissionLabel: string, fields: SubmissionField[], values: Record<string, string>) {
  const lines = [`HighlandXR ${submissionLabel} submission`, ""];

  for (const field of fields) {
    const value = values[field.name]?.trim();
    if (!value) {
      continue;
    }

    lines.push(`${field.label}:`);
    lines.push(value);
    lines.push("");
  }

  lines.push("Please review this submission for the HighlandXR archive.");
  return lines.join("\n");
}

export default function EmailSubmissionForm({
  eyebrow,
  title,
  description,
  submissionLabel,
  subjectPrefix,
  submitLabel,
  fields
}: EmailSubmissionFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => buildInitialValues(fields));
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const primaryField = fields[0];

  const subject = useMemo(() => {
    const primaryValue = values[primaryField.name]?.trim();
    return primaryValue ? `${subjectPrefix}: ${primaryValue}` : subjectPrefix;
  }, [primaryField.name, subjectPrefix, values]);

  const emailBody = useMemo(() => buildEmailBody(submissionLabel, fields, values), [fields, submissionLabel, values]);
  const mailtoHref = useMemo(
    () => `mailto:${SUBMISSION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`,
    [emailBody, subject]
  );

  const handleFieldChange = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setCopyState("idle");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    window.location.href = mailtoHref;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${emailBody}`);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <div className="shell-container pb-24 pt-24 md:pt-28">
      <section className="legacy-shell">
        <SectionHeading eyebrow={eyebrow} title={title} body={description} />

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => {
              const fieldType = field.type ?? "text";
              const sharedProps = {
                id: field.name,
                name: field.name,
                required: field.required ?? false,
                placeholder: field.placeholder,
                autoComplete: field.autoComplete,
                value: values[field.name] ?? "",
                onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  handleFieldChange(field.name, event.target.value)
              };

              return (
                <label key={field.name} className={`legacy-field ${field.wide ? "md:col-span-2" : ""}`}>
                  <span className="legacy-field__label">
                    {field.label}
                    {field.required ? <span className="text-brand-aurora"> *</span> : null}
                  </span>

                  {fieldType === "textarea" ? (
                    <textarea {...sharedProps} rows={field.rows ?? 5} className="legacy-field__input legacy-field__textarea" />
                  ) : (
                    <input {...sharedProps} type={fieldType} className="legacy-field__input" />
                  )}

                  {field.helpText ? <span className="legacy-field__help">{field.helpText}</span> : null}
                </label>
              );
            })}
          </div>

          <div className="legacy-card">
            <h2 className="text-2xl font-semibold text-text-base">How this works</h2>
            <p>
              The form opens your email client with a draft addressed to <strong className="text-text-base">{SUBMISSION_EMAIL}</strong>.
              If no mail app opens, copy the prepared text and send it manually.
            </p>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="button button-primary">
                {submitLabel}
              </button>
              <button type="button" className="button button-ghost" onClick={handleCopy}>
                Copy submission text
              </button>
              <a href={`mailto:${SUBMISSION_EMAIL}`} className="button button-secondary">
                Email directly
              </a>
            </div>

            <p className="text-sm text-text-subtle">
              {copyState === "copied"
                ? "Submission subject and body copied."
                : copyState === "error"
                  ? "Copy failed. Send manually to info@highlandxr.com."
                  : "Required fields are marked with *."}
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
