# Supabase Migration Rules

This folder is append-only migration history.

Rules:

- Do not delete migration files.
- Do not rewrite migrations that have already been applied to any shared or production database.
- Use one unique increasing numeric prefix per migration file.
- For schema cleanup, add a new forward migration instead of editing/removing old history.
- Canonical tables for new work are:
  - `master_products` for products.
  - `school_pack_items` for pack composition.
  - `order_items` for purchased order lines.
  - `system_settings` for app settings.
- Compatibility tables still exist for older app paths:
  - `stationery_items`
  - `orders.items`
  - `app_settings`

For a clean database build, migrations must apply in filename order without relying on objects created manually outside this folder.

