-- Migration 00104: Create and seed admin_letter_templates
BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_letter_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_admin_letter_templates_sort ON public.admin_letter_templates(sort_order, created_at);

ALTER TABLE public.admin_letter_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated staff full access letter templates" 
  ON public.admin_letter_templates 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

INSERT INTO public.admin_letter_templates (name, subject, body_markdown, sort_order)
VALUES
(
  'Partnership Proposal',
  'Partnership Invitation — Modernize Your School''s Stationery Procurement with Zero Administrative Load',
  'Dear Principal,

As a Growth Hacker & Founder at Pexpacks Supplies, I have spent years helping schools and startups simplify operations so they can focus on their core mission. At the start of every academic year, school administration teams face a recurring challenge: managing paper order forms, manual cash collections, and the complexity of stationery distribution.

We would like to invite your school to partner with Pexpacks Supplies to eliminate this administrative burden while giving parents a seamless, modern digital ordering experience.

The Pexpacks Partnership Advantage
Complimentary Custom Web Development and Hosting. We build, launch, and host a dedicated premium stationery portal for your school at no cost. Our development team manages security, software updates, and server maintenance.

Effortless Parent Ordering
Parents access custom, teacher-approved stationery lists through an intuitive, mobile-friendly portal linked to your school website or communication channels.

Secure Direct Payment Gateway
Parents pay directly online with instant receipts and clear order confirmations, eliminating cash handling for your bursar and admin staff.

Direct-to-Home Delivery
Every pack is delivered directly to parents with accurate tracking and prompt customer support.

Zero Financial or Operational Cost
There are no development costs, no monthly maintenance fees, and no inventory risk for your school.

Next Steps & Consultation
We would welcome a 15-minute introductory meeting with your leadership team or School Governing Body to demonstrate a live prototype portal tailored for your school.

Thank you for your time, leadership, and ongoing dedication to academic excellence.',
  1
),
(
  'Quotation Transmittal',
  'Formal Quotation Transmittal: Institutional Scholastic & Office Supplies',
  'Dear School Management Team,

Please find enclosed our formal commercial quotation for the requested scholastic supplies and educational stationery packs.

All quoted line items have been carefully vetted to ensure compliance with Department of Basic Education specifications, high manufacturing durability, and maximum cost efficiency.

Terms & Commercial Conditions:
• Validity: This quotation is strictly valid for 30 calendar days from the date of issue.
• Delivery Timelines: Estimated delivery within 3–5 business days following formal purchase order sign-off.
• Settlement: Payment terms as per our approved institutional credit agreement or EFT prior to dispatch.

Should you require any line-item adjustments or additional bundle customizations, please do not hesitate to contact our administrative desk directly.',
  2
),
(
  'Credit Terms Application',
  'Formal Notification: 30-Day Institutional Account Facility & Settlement Terms',
  'Dear Finance Office / Bursar,

Following our recent commercial review, PexPacks Supplies is pleased to confirm the approval of your institutional 30-Day Commercial Account facility.

Account Specifications:
• Approved Billing Entity: School Governing Body / Commercial Desk
• Standard Payment Terms: Strictly 30 days from date of monthly statement
• Remittance Address: accounts@pexpacks.co.za

To ensure seamless order dispatch throughout the academic term, please ensure all authorized purchase orders reference your official institutional customer code.

Thank you for choosing PexPacks Supplies as your trusted scholastic distribution partner.',
  3
),
(
  'General Commercial Notice',
  'Commercial Update & Term Notice from PexPacks Supplies',
  'Dear Valued Partner,

We are writing to provide an important administrative and operational update regarding upcoming procurement deadlines and delivery logistics for the forthcoming school term.

Our team remains fully dedicated to providing unparalleled customer care and uninterrupted distribution across all contracted regions.

Please feel free to reach out directly should you have any questions or require custom supply arrangements for your campus.',
  4
)
ON CONFLICT DO NOTHING;

COMMIT;
