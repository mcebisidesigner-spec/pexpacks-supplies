"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Building2, CreditCard, Mail, Save } from "lucide-react";
import { updateSupplierAction } from "@/app/admin/suppliers/actions";
import type { SupplierFormState } from "@/lib/admin/suppliers";
import adminStyles from "@/app/admin/admin.module.css";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import formStyles from "./supplier-form.module.css";

export interface SupplierFormDefaults {
  slug: string;
  name: string;
  code: string;
  contactName: string;
  email: string;
  telephone: string;
  paymentTerms: string;
  leadTimeDays: string;
  active: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AdminButton
      type="submit"
      variant="primary"
      size="lg"
      loading={pending}
      icon={<Save size={14} />}
      className={adminStyles.hFullBtn}
    >
      {pending ? "Saving…" : "Update Supplier"}
    </AdminButton>
  );
}

const err = (state: SupplierFormState, field: string) =>
  state?.errors?.[field] ? (
    <span className={formStyles.fieldError} role="alert">
      {state.errors[field]}
    </span>
  ) : null;

export function SupplierEditForm({
  slug,
  defaults,
}: {
  slug: string;
  defaults: SupplierFormDefaults;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<SupplierFormState, FormData>(
    updateSupplierAction.bind(null, slug),
    {},
  );

  useEffect(() => {
    if (state?.newSlug && state.newSlug !== slug) {
      router.replace(`/admin/suppliers/${state.newSlug}/edit`);
    }
  }, [state?.newSlug, slug, router]);

  return (
    <form action={formAction} noValidate>
      {state?.ok ? (
        <p className={adminStyles.success} role="status">
          {state.message}
        </p>
      ) : state?.message ? (
        <p className={adminStyles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={adminStyles.detailLayout}>
        <div
          className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles.gap18}`}
        >
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Building2 size={16} className={adminStyles.iconTeal} />
                <span>Supplier Identity &amp; Information</span>
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel}>Supplier Name *</label>
                <input
                  name="name"
                  defaultValue={defaults.name}
                  required
                  className={adminStyles.inputField}
                />
                {err(state, "name")}
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Supplier Code / Ref
                </label>
                <input
                  name="code"
                  defaultValue={defaults.code}
                  className={adminStyles.inputField}
                />
                {err(state, "code")}
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Primary Contact Person
                </label>
                <input
                  name="contact_name"
                  defaultValue={defaults.contactName}
                  className={adminStyles.inputField}
                />
                {err(state, "contact_name")}
              </div>

              <div>
                <label className={adminStyles.formLabel}>Status</label>
                <select
                  name="status"
                  className={adminStyles.selectField}
                  defaultValue={defaults.active ? "Preferred" : "Prospect"}
                >
                  <option value="Preferred">Preferred Partner</option>
                  <option value="Approved">Approved Supplier</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </div>
            </div>
          </div>

          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Mail size={16} className={adminStyles.iconBlue} />
                <span>Contact Details &amp; Orders</span>
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel}>
                  Procurement Email *
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={defaults.email}
                  required
                  className={adminStyles.inputField}
                />
                {err(state, "email")}
              </div>

              <div>
                <label className={adminStyles.formLabel}>Telephone</label>
                <input
                  name="phone"
                  defaultValue={defaults.telephone}
                  className={adminStyles.inputField}
                />
                {err(state, "telephone")}
              </div>
            </div>
          </div>
        </div>

        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <CreditCard size={16} className={adminStyles.iconAmber} />
                <span>Commercial Terms</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>Payment Terms</label>
                <input
                  name="payment_terms"
                  defaultValue={defaults.paymentTerms}
                  className={adminStyles.inputField}
                />
                {err(state, "payment_terms")}
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Standard Lead Time (Days)
                </label>
                <input
                  type="number"
                  name="lead_time"
                  defaultValue={defaults.leadTimeDays}
                  className={adminStyles.inputField}
                />
                {err(state, "lead_time")}
              </div>

              <div className={adminStyles.pt12}>
                <SubmitButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
