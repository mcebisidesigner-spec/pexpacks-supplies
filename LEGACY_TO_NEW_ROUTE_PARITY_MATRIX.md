# PEXPACKS ROUTE PARITY MATRIX
**Document:** `LEGACY_TO_NEW_ROUTE_PARITY_MATRIX.md`  
**Reference Authoritative Source:** `pexpacks-OLD-WEBAPP` & Live Reference (`https://pexpacks.co.za`)  
**Target Application:** `pexpacks-supplies`  
**Author:** Principal Frontend Architect & Visual Regression Engineer  
**Date:** September 2026  
**Status:** COMPLETE INITIAL AUDIT MATRIX — AWAITING PHASE EXECUTION  

---

## 1. Parity Classification Key

* **`EXACT_LEGACY`**: An exact corresponding route exists in the authoritative legacy application with direct visual references and live production captures.
* **`LEGACY_DERIVED`**: Route exists in modern app or admin suite where visual layout is derived from analogous legacy design patterns (cards, data tables, modals, form controls).
* **`NO_REFERENCE`**: Novel feature or internal utility route with no legacy analogue. Follows strict Pexpacks design tokens.

---

## 2. Customer-Facing Route Parity Matrix (Public Application)

| New Route (`pexpacks-supplies`) | Legacy Equivalent (`pexpacks-OLD-WEBAPP`) | Parity Type | Primary Components Involved | Legacy CSS Source | New Tailwind / Component Source | Responsive States | Functional Risk | Parity Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`/`** | `/` | `EXACT_LEGACY` | `HeroSearch`, `SchoolSearchBox`, `RetailVsPexpacksSlider`, `MarketingSections`, `FAQExperience`, `RatingStrip`, `AskPex` | `MarketingHome.module.css`, `HeroBase.module.css`, `RetailVsPexpacksSlider.module.css` | `app/page.tsx`, `components/marketing/*`, `components/ui/SchoolSearchBox.tsx` | Mobile (375px/390px), Tablet (768px), Desktop (1280px/1440px) | Low | Near Parity (Awaiting batch cleanup) |
| **`/schools`** | `/schools` | `EXACT_LEGACY` | `SchoolSearchPanel`, `SchoolSearchBox`, `TrendingNearYou`, `BrowseAllSchools`, `SchoolResultsAutoLoad` | `SchoolSearchWidget.module.css`, `TrendingNearYou.module.css` | `app/schools/page.tsx`, `components/schools/*` | Mobile stacked, Desktop 2-column hero | Low | Near Parity |
| **`/schools/[schoolSlug]`** | `/schools/[schoolSlug]` | `EXACT_LEGACY` | `GradePackItemSelector`, `PackCustomiser`, `CompleteListModal`, `SchoolsBreadcrumbs`, `SchoolVisibleToggle` | `GradePackItemSelector.module.css`, `PackCustomiser.module.css`, `CompleteListModal.module.css` | `app/schools/[schoolSlug]/page.tsx`, `components/schools/*` | Mobile sticky CTA, Desktop split view | High (Pack calculations) | In Progress |
| **`/order`** | `/order` | `EXACT_LEGACY` | `OrderForm`, `FloatingInput`, `FloatingTextarea`, `GradePackActions`, `OrderSavedToast` | `order.module.css`, `FloatingInput.module.css` | `app/order/page.tsx`, `app/order/OrderForm.tsx` | Mobile form column, Desktop 2-col | High (Order persistence) | In Progress |
| **`/cart/review`** | `/cart/review` | `EXACT_LEGACY` | `CartReviewClient`, `PackTrayItem`, `OrderSummary`, `GlobalPackTray` | `CartReview.module.css`, `Tray.module.css` | `app/cart/review/page.tsx`, `app/cart/review/CartReviewClient.tsx` | Full viewport drawer & review table | High (Cart calculations) | In Progress |
| **`/checkout`** | `/checkout` | `EXACT_LEGACY` | `TrayCheckoutClient`, `CheckoutForm`, `OzowHandoff`, `HappyPayHandoff`, `OrderSummary` | `Checkout.module.css`, `HappyPayBanner.module.css` | `app/checkout/page.tsx`, `app/checkout/TrayCheckoutClient.tsx` | Mobile accordion, Desktop split column | Critical (Payment / Gateway) | Protected / In Progress |
| **`/checkout/happypay`** | `/checkout/happypay` | `EXACT_LEGACY` | `HappyPayCheckoutClient`, `HappyPaySteps`, `HappyPayBanner` | `HappyPaySteps.module.css`, `HappyPayBanner.module.css` | `app/checkout/happypay/page.tsx` | Mobile stack, Desktop card | Critical (Payment / HappyPay) | Protected / In Progress |
| **`/checkout/success`** | `/checkout/success` | `EXACT_LEGACY` | `OrderSuccessReceipt`, `DeliveryTrackerCard` | `CheckoutSuccess.module.css` | `app/checkout/success/page.tsx` | Mobile centered, Desktop receipt card | High (Order state) | In Progress |
| **`/happy-pay`** | `/happy-pay` | `EXACT_LEGACY` | `HappyPayExplainer`, `HappyPaySteps`, `FAQExperience` | `HappyPayPage.module.css`, `HappyPaySteps.module.css` | `app/happy-pay/page.tsx` | Mobile single column, Desktop feature cards | Low | In Progress |
| **`/track-order`** | `/track-order` | `EXACT_LEGACY` | `TrackOrderForm`, `DeliveryTimeline`, `AnimatedVehicle` | `TrackOrder.module.css`, `AnimatedVehicle.module.css` | `app/track-order/page.tsx` | Mobile card stack, Desktop timeline | Low | In Progress |
| **`/partnership`** | `/partnership` | `EXACT_LEGACY` | `SchoolPartnershipHero`, `PartnershipForm`, `PartnerBenefits` | `Partnership.module.css` | `app/partnership/page.tsx` | Mobile single column, Desktop grid | Low | In Progress |
| **`/add-your-school`** | `/add-your-school` | `EXACT_LEGACY` | `AddSchoolForm`, `SchoolBenefitsCard` | `MarketingForms.module.css` | `app/add-your-school/page.tsx` | Mobile form, Desktop centered card | Low | In Progress |
| **`/contact`** | `/contact` | `EXACT_LEGACY` | `ContactForm`, `ContactChannelsCard`, `WhatsAppDirect` | `MarketingForms.module.css` | `app/contact/page.tsx` | Mobile stack, Desktop split | Low | In Progress |
| **`/faq`** | `/faq` | `EXACT_LEGACY` | `FAQExperience`, `FaqAccordion`, `CategoryTabs` | `FAQExperience.module.css`, `FaqAccordion.module.css` | `app/faq/page.tsx` | Responsive accordion | Low | In Progress |
| **`/blog`** | `/blog` | `EXACT_LEGACY` | `BlogFilter`, `ArticleGrid`, `ArticleCard`, `SubscribeForm` | `blog.module.css` | `app/blog/page.tsx` | Mobile 1-col, Desktop 3-col grid | Low | In Progress |
| **`/blog/[slug]`** | `/blog/[slug]` | `EXACT_LEGACY` | `BlogPostContent`, `ShareButtons`, `RelatedArticles` | `blog.module.css`, `ShareButtons.module.css` | `app/blog/[slug]/page.tsx` | Prose container, responsive sidebars | Low | In Progress |
| **`/privacy-policy`** | `/privacy-policy` | `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/privacy-policy/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/terms`** | `/terms` | `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/terms/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/delivery-policy`** | `/delivery-policy` | `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/delivery-policy/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/returns-refunds-policy`**| `/returns-refunds-policy`| `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/returns-refunds-policy/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/paia-manual`** | `/paia-manual` | `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/paia-manual/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/cookie-notice`** | `/cookie-notice` | `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/cookie-notice/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/email-disclaimer`** | `/email-disclaimer` | `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/email-disclaimer/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/happy-pay-terms`** | `/happy-pay-terms` | `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/happy-pay-terms/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/campaign-terms`** | `/campaign-terms` | `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/campaign-terms/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/school-partnership-terms`**|`/school-partnership-terms`| `EXACT_LEGACY`| `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/school-partnership-terms/page.tsx`| Responsive legal prose | Zero | In Progress |
| **`/supplier-terms`** | `/supplier-terms` | `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/supplier-terms/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/social-media-guidelines`** | `/social-media-guidelines` | `EXACT_LEGACY` | `PolicyDocumentShell`, `PolicyNav` | `Policy.module.css` | `app/social-media-guidelines/page.tsx` | Responsive legal prose | Zero | In Progress |
| **`/offline`** | `/offline` | `EXACT_LEGACY` | `OfflineCard`, `RetryButton` | `globals.css` | `app/offline/page.tsx` | Mobile centered card | Zero | In Progress |
| **`/not-found` (404)** | `/not-found` | `EXACT_LEGACY` | `NotFoundHero`, `RatingStrip`, `Footer` | `globals.css` | `app/not-found.tsx` | Mobile stack (`media_1789827242148.jpg`) | Zero | Near Parity |
| **`/design-system-preview`** | `/design-system-preview` | `NO_REFERENCE` | `TokenSwatchGallery`, `ComponentShowcase` | None (Internal) | `app/design-system-preview/page.tsx` | Responsive preview grid | Zero | Maintained |

---

## 3. Back-Office / Admin Route Parity Matrix (Operations Interface)

| New Route (`pexpacks-supplies`) | Legacy Equivalent | Parity Type | Key Components Involved | Authoritative CSS / Token Sources | Responsive Strategy | Functional Risk | Parity Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`/admin` (Dashboard)** | `/admin` | `EXACT_LEGACY` | `AdminShell`, `Sidebar`, `DashboardWidgets`, `KpiMetricCards`, `CityDistributionBar` | `admin-dark.css`, `db-tokens.css`, `admin.module.css` | Collapsible sidebar on mobile, full grid desktop (`media_1789827215306.png`) | Low | In Progress |
| **`/admin/products`** | `/admin/products` | `EXACT_LEGACY` | `AdminPageHeader`, `ProductsDataTable`, `PricingMarginCell`, `CategoryFilterDropdown` | `ADMIN_PRODUCTS_TABLE_AUDIT.md`, `db-tokens.css` | Horizontal scroll TanStack data table, mobile card fallback | High (Wholesale pricing / Margins) | Protected / In Progress |
| **`/admin/products/add-product`** | `/admin/products/add-product` | `EXACT_LEGACY` | `ProductForm`, `WholesalePricingCalculator`, `TierPricingTable` | `admin.module.css`, `db-tokens.css` | Mobile 1-col, Desktop 2-col form | High (Product persistence) | In Progress |
| **`/admin/products/[productId]/edit`**| `/admin/products/[productId]/edit` | `EXACT_LEGACY` | `ProductEditForm`, `MarginGuardrail` | `admin.module.css`, `db-tokens.css` | Mobile 1-col, Desktop 2-col form | High (Pricing formulas) | In Progress |
| **`/admin/schools`** | `/admin/schools` | `EXACT_LEGACY` | `SchoolsDataTable`, `SchoolOverviewModal`, `SchoolStatusBadge` | `SchoolProfile.module.css`, `db-tokens.css` | Desktop data table, mobile card stack | Medium | In Progress |
| **`/admin/schools/new`** | `/admin/schools/new` | `EXACT_LEGACY` | `SchoolForm`, `PostalAddressFields` | `SchoolProfile.module.css`, `db-tokens.css` | Form grid | Medium | In Progress |
| **`/admin/schools/[id]/profile`** | `/admin/schools/[id]/profile` | `EXACT_LEGACY` | `SchoolProfileHeader`, `PackAssociationList`, `PartnerStatusToggle` | `SchoolProfile.module.css`, `db-tokens.css` | Tabbed desktop layout | Medium | In Progress |
| **`/admin/packs`** | `/admin/packs` | `EXACT_LEGACY` | `PacksDataTable`, `GradeFilter`, `VisibleToggle` | `admin.module.css`, `db-tokens.css` | Data table with status pills | High (Pack pricing) | In Progress |
| **`/admin/packs/builder`** | `/admin/packs/builder` | `EXACT_LEGACY` | `PackBuilderWorkbench`, `ItemCatalogueDrawer`, `LivePackPriceSummary` | `admin.module.css`, `db-tokens.css` | Multi-pane desktop workspace | Critical (Pack formulas) | In Progress |
| **`/admin/orders`** | `/admin/orders` | `EXACT_LEGACY` | `OrdersDataTable`, `OrderStatusBadge`, `FulfillmentFilter`, `DateRangePicker` | `admin.module.css`, `db-tokens.css` | Data table with badge cells | High (Order states) | In Progress |
| **`/admin/orders/[id]`** | `/admin/orders/[id]` | `EXACT_LEGACY` | `OrderDetailView`, `OrderStatusForm`, `RefundButton`, `PackingSlipPrint` | `admin.module.css`, `db-tokens.css` | Split order and line-item views | High (Financial / Refund) | In Progress |
| **`/admin/pricing`** | `/admin/pricing` | `EXACT_LEGACY` | `PricingControlCentre`, `MarginMatrixEditor`, `VatToggle` | `db-tokens.css`, `admin-dark.css` | Formula review tables | Critical (Pricing calculations) | Protected / In Progress |
| **`/admin/procurement`** | `/admin/procurement` | `EXACT_LEGACY` | `ProcurementWorkbench`, `SupplierOrderSummary`, `StockReceivingTable` | `db-tokens.css`, `admin-dark.css` | Data table with inline steppers | High (Inventory) | In Progress |
| **`/admin/fulfilment`** | `/admin/fulfilment` | `EXACT_LEGACY` | `FulfilmentQueueTable`, `BatchLabelPrinter`, `DispatchConfirmModal` | `db-tokens.css`, `admin-dark.css` | Queue data table | High (Shipping) | In Progress |
| **`/admin/suppliers`** | `/admin/suppliers` | `EXACT_LEGACY` | `SuppliersDataTable`, `SupplierForm` | `db-tokens.css`, `admin.module.css` | Form and list views | Medium | In Progress |
| **`/admin/letters`** | `/admin/letters` | `EXACT_LEGACY` | `LettersListView`, `LetterActionWorkbench`, `LetterEditor` | `LetterEditor.module.css`, `db-tokens.css` | Editor pane with PDF preview | Medium | In Progress |
| **`/admin/quotations`** | `/admin/quotations` | `EXACT_LEGACY` | `QuotationsListView`, `QuotationBuilderForm`, `PexpacksDetailsView` | `quotationStyles.ts`, `db-tokens.css` | Quotation generator workspace | High (Pricing quotes) | In Progress |
| **`/admin/content`** | `/admin/content` | `EXACT_LEGACY` | `UnifiedCmsView`, `AnnouncementsTab`, `FaqsTab`, `TestimonialsTab` | `content.module.css`, `cmsStyles.ts` | Tabbed CMS control interface | Low | In Progress |
| **`/admin/blog`** | `/admin/blog` | `EXACT_LEGACY` | `BlogForm`, `ContentBlocksEditor`, `BlogList` | `blog.module.css`, `blogStyles.ts` | Multi-block WYSIWYG editor | Low | In Progress |
| **`/admin/audit`** | `/admin/audit` | `EXACT_LEGACY` | `AuditLogDataTable`, `AuditDetailDrawer`, `ExportButton` | `audit.module.css`, `db-tokens.css` | High-density event log table | Low (Read-only) | In Progress |
| **`/admin/tasks`** | `/admin/tasks` | `EXACT_LEGACY` | `TasksKanban`, `TaskForm`, `AssigneeSelect` | `admin.module.css`, `db-tokens.css` | Responsive task board | Low | In Progress |
| **`/admin/users`** | `/admin/users` | `EXACT_LEGACY` | `UsersDataTable`, `InviteUserModal`, `RoleSelector` | `users.module.css`, `roles.module.css` | User administration table | High (Access control) | In Progress |
| **`/admin/settings`** | `/admin/settings` | `EXACT_LEGACY` | `SettingsControlCentre`, `PaymentGatewaySettings`, `NotificationSettings` | `settings.module.css`, `db-tokens.css` | Vertical tabbed settings panels | High (System settings) | In Progress |
| **`/pex-console-secure`**| `/pex-console-secure` | `EXACT_LEGACY` | `ConsolePageHeader`, `TerminalView`, `AuditStream` | `ConsolePage.module.css`, `db-tokens.css` | Monospace developer dashboard | Medium | In Progress |

---

## 4. API Routes Integrity Protection (29 Routes)
All routes under `/api/*` (including `/api/checkout`, `/api/ai-convert-list`, `/api/ozow/*`, `/api/packs/*`, `/api/schools/*`, `/api/admin/*`) are **functionally protected** and outside visual restyling scope.
