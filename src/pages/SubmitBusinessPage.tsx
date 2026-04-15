import EmailSubmissionForm from "@/components/legacy/EmailSubmissionForm";

export default function SubmitBusinessPage() {
  return (
    <EmailSubmissionForm
      eyebrow="Archive intake"
      title="Add a business"
      description="The legacy business submission flow remains available while HighlandXR shifts toward a company-led spatial studio site."
      submissionLabel="Business"
      subjectPrefix="HighlandXR Business Submission"
      submitLabel="Open email draft"
      fields={[
        {
          name: "businessName",
          label: "Business or organisation name",
          placeholder: "Example Immersive Studio",
          required: true,
          autoComplete: "organization"
        },
        {
          name: "contactName",
          label: "Your name",
          placeholder: "Jane Smith",
          required: true,
          autoComplete: "name"
        },
        {
          name: "contactEmail",
          label: "Contact email",
          type: "email",
          placeholder: "jane@example.com",
          required: true,
          autoComplete: "email"
        },
        {
          name: "phone",
          label: "Phone",
          placeholder: "+44...",
          autoComplete: "tel"
        },
        {
          name: "location",
          label: "Town or base",
          placeholder: "Inverness",
          required: true,
          autoComplete: "address-level2"
        },
        {
          name: "website",
          label: "Website URL",
          type: "url",
          placeholder: "https://example.com",
          required: true,
          wide: true
        },
        {
          name: "tags",
          label: "Tags",
          placeholder: "XR, AR, VR, training, tourism",
          helpText: "Separate tags with commas.",
          wide: true
        },
        {
          name: "services",
          label: "Services or offer",
          type: "textarea",
          placeholder: "What the business does and who it serves.",
          required: true,
          rows: 4,
          wide: true
        },
        {
          name: "summary",
          label: "Short description",
          type: "textarea",
          placeholder: "A short public summary suitable for the listing.",
          required: true,
          rows: 5,
          wide: true
        },
        {
          name: "notes",
          label: "Additional notes",
          type: "textarea",
          placeholder: "Anything else the HighlandXR team should know.",
          rows: 4,
          wide: true
        }
      ]}
    />
  );
}
