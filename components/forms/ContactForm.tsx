import { PexpacksEnquiryForm } from "./PexpacksEnquiryForm";

type ContactFormProps = {
  initialEnquiryType?: string;
  initialMessage?: string;
  initialBusinessName?: string;
};

export function ContactForm({
  initialEnquiryType,
  initialMessage,
  initialBusinessName,
}: ContactFormProps) {
  return (
    <PexpacksEnquiryForm
      mode="contact"
      title="Send an enquiry"
      submitLabel="Send enquiry"
      initialEnquiryType={initialEnquiryType}
      initialMessage={initialMessage}
      initialBusinessName={initialBusinessName}
    />
  );
}
