import type { Metadata } from "next";
import EmailSubmissionForm from "@/components/EmailSubmissionForm";

export const metadata: Metadata = {
  title: "Submit Event | HighlandXR",
  description: "Submit a Highlands XR event for review."
};

export default function SubmitEventPage() {
  return (
    <EmailSubmissionForm
      eyebrow="Contribute"
      title="Submit an event"
      description="Share a Highlands XR event for review. Include the key public details below and the page will prepare the email for you."
      submissionLabel="Event"
      subjectPrefix="HighlandXR Event Submission"
      submitLabel="Open email draft"
      fields={[
        {
          name: "eventTitle",
          label: "Event title",
          placeholder: "Inverness XR Open Studio",
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
          name: "organiser",
          label: "Organiser",
          placeholder: "Highland XR Collective",
          autoComplete: "organization"
        },
        {
          name: "location",
          label: "Town or venue",
          placeholder: "Inverness Campus",
          required: true,
          autoComplete: "address-level2"
        },
        {
          name: "eventDate",
          label: "Event date",
          type: "date",
          required: true
        },
        {
          name: "website",
          label: "Event URL",
          type: "url",
          placeholder: "https://example.com/event",
          helpText: "Add the public event page if one exists.",
          wide: true
        },
        {
          name: "tags",
          label: "Tags",
          placeholder: "XR, VR, AR, workshop",
          helpText: "Separate tags with commas.",
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
