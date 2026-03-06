"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";

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
    if (!value) continue;

    lines.push(`${field.label}:`);
    lines.push(value);
    lines.push("");
  }

  lines.push("Please review this submission for the HighlandXR directory.");
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
    if (copyState !== "idle") {
      setCopyState("idle");
    }
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
    <div className="shell-container pb-20 pt-8 md:pt-10">
      <section className="surface-glass grid gap-6 p-6 md:p-8">
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-subtle">{eyebrow}</p>
          <h1 className="text-4xl md:text-5xl">{title}</h1>
          <p className="max-w-3xl">{description}</p>
        </div>

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
                <label key={field.name} className={`form-field ${field.wide ? "md:col-span-2" : ""}`}>
                  <span className="form-label">
                    {field.label}
                    {field.required ? <span className="text-brand-aurora"> *</span> : null}
                  </span>

                  {fieldType === "textarea" ? (
                    <textarea {...sharedProps} rows={field.rows ?? 5} className="form-input min-h-36 resize-y rounded-panel px-4 py-3" />
                  ) : (
                    <input {...sharedProps} type={fieldType} className="form-input" />
                  )}

                  {field.helpText ? <span className="form-hint">{field.helpText}</span> : null}
                </label>
              );
            })}
          </div>

          <div className="surface-card grid gap-3 p-4">
            <h2 className="text-xl">How this works</h2>
            <p className="text-sm text-text-muted">
              Submitting opens your default email app with this form prefilled to <strong className="text-text-base">{SUBMISSION_EMAIL}</strong>.
              If no mail app opens, copy the prepared text and send it manually.
            </p>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary">
                {submitLabel}
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleCopy}>
                Copy submission text
              </button>
              <a href={`mailto:${SUBMISSION_EMAIL}`} className="btn btn-secondary">
                Email directly
              </a>
            </div>

            <p className="text-xs text-text-subtle">
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
