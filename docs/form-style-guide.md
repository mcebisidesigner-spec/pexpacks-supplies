# Pexpacks Form Style Guide

Use the shared form tokens in `styles/tokens.css` for all form controls. New forms should prefer the shared primitives in `components/ui` before writing native inputs directly.

## Required Building Blocks

- `Input` for text, email, phone, number, search, date, and similar single-line fields.
- `Textarea` for multi-line notes and messages.
- `Select` for dropdown choices. It renders the app-styled drawer tray and preserves form submission values, so do not use raw `<select>` for visible user-facing dropdowns unless a platform constraint requires it.
- Existing `Button` variants for submit and navigation actions.

## Visual Contract

Form labels use `--form-label-*` tokens. Helper text uses `--form-helper-*`. Controls use `--form-control-*` for height, radius, padding, background, border, placeholder, focus, and error states.

Segmented choices, radio cards, and pill choices should use:

- `--form-option-bg`
- `--form-option-selected-bg`
- `--form-option-selected-border`
- `--form-option-selected-color`
- `--form-option-radius`

## Interaction Rules

- Every visible label must be associated with its field by nesting or `htmlFor`/`id`.
- Focus states must use `--form-control-focus-border` and `--form-control-focus-shadow`.
- Error states must use `--form-control-error-border`, `--form-control-error-shadow`, and `--form-error-*`.
- Placeholder text should use `--form-control-placeholder`, not a hard-coded grey.
- Dropdown trays should use the shared `Select` option styling so selected, hover, focus, and disabled states stay aligned with the Pexpacks form language.
- Avoid one-off utility-class styling for controls. If a new control type is needed, add it to the shared primitives or reuse the token set in its CSS module.
