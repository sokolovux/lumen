# Design

## UI copy

All UI copy must use **sentence case**, with these exceptions:

- Medication names
- Test names
- Lab results
- Patient names

Sentence case means only the first word and proper nouns / acronyms are capitalized.

Examples:

- ✅ Grant temporary access
- ✅ Access requests
- ✅ Release permanently
- ❌ Grant Temporary Access
- ❌ Access Requests
- ❌ Release Permanently

Keep medication names, test names, lab result names, and patient names in their conventional capitalization (e.g. Lisinopril, HbA1c, Chest X-Ray, Jordan Reyes).

### Buttons

Do not use ellipses (`…` or `...`) in button labels. The dialog or next step makes the incomplete action clear — the button should be a complete verb phrase.

Examples:

- ✅ Grant
- ✅ Deny
- ✅ Release
- ❌ Grant…
- ❌ Deny...

## Schedule status columns

Today’s schedule uses exactly these columns:

| Column | Meaning |
|--------|---------|
| Scheduled | Appointment is scheduled but has not been started yet |
| With PA | Visit started; PA is entering vitals and the first note |
| With physician | PA has transferred the patient to the physician (first note submitted for cosign) |
| Finished | Physician clicked Finish visit |

Do not use a separate Checked in status.

## Pointer cursor

All interactive elements must show a pointer cursor on hover.

Enforce this globally in `src/index.css` (`@layer base`) — do not sprinkle `cursor-pointer` on individual components unless an element is interactive but not covered by the global selectors (e.g. a clickable `div`/`Card`). In those cases, add `cursor-pointer` on that element.

## Design system documentation

Whenever a new component is created (or a new variant/style is introduced), document it immediately on the `/ds` page (`src/pages/DesignSystemPage.tsx`).

- Add a live example of the component and its variants
- If it is a product status badge or other repeated pattern, show every style currently used in the app
- Keep the inventory list in sync when adding shadcn/ui primitives under `src/components/ui`
- Do not merge or consider the work complete until `/ds` reflects the new component
