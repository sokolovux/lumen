# Design

## Components

### Layout and utilities (default)

**Prefer Tailwind utilities** when building layout and UI. Compose pages and features with native elements, existing primitives, and utility classes first.

Do **not** invent a new component by default. If you believe a new component is necessary, **ask first** and wait for permission before creating it.

### Existing components (naked by default)

Once a component exists (shared UI under `src/components/ui/`, or any product component), call sites must use it **naked** — no Tailwind utilities on that component unless you **ask and get permission**.

Documented exceptions (props, helpers, or semantic tints already in this file) do not require re-asking — e.g. Badge `notificationBadgeClassName` / status tints, Card `interactive` / `size`, Button `variant` / `size`.

### Repeated styles → `@apply` in the component

If the same utilities keep appearing on a component (or would, by judgment), do **not** keep repeating them at call sites. Apply them **systematically inside the component** with `@apply` (typically co-located CSS or `@layer components` targeting the component’s root / `data-slot`), then keep call sites naked.

```tsx
// ✅ Layout with utilities; existing primitives naked
<div className="flex flex-wrap gap-2">
  <Button variant="secondary">View</Button>
  <Button variant="outline">Release permanently</Button>
</div>

// ✅ Inner layout wrappers are fine — they are not the component
<Card>
  <CardContent>
    <div className="flex flex-wrap gap-2">…</div>
  </CardContent>
</Card>

// ❌ New component without asking
function ActionRow({ children }) { … }

// ❌ Utilities on an existing component without permission
<Button className="h-8 px-4 bg-primary">…</Button>
<Card className="gap-2 py-0">…</Card>
```

### Tabs

Use **line** tabs only (`TabsList` defaults to `variant="line"`). Do not use the muted pill `default` variant in the product.

```tsx
// ✅
<TabsList>
  <TabsTrigger value="visits">Visits</TabsTrigger>
</TabsList>

// ❌
<TabsList variant="default">…</TabsList>
```

### Cards

Card styles live in `src/components/ui/card.css` (`@apply` on `data-slot`). Use **naked** `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardAction` / `CardContent` / `CardFooter` — no Tailwind utilities on those slots by default.

- Equal padding on all sides (`p-(--card-spacing)`); do not override with `p-*` / `px-*` / `py-*` / section `gap-*`
- Put stacks, grids, and button rows on **inner** elements
- Allowed props: `size="sm" | "default"`, `interactive` (pointer + hover shadow)
- Ask before any other call-site `className` on Card slots

```tsx
// ✅
<Card interactive onClick={…}>
  <CardHeader>
    <CardTitle>Jordan Reyes</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap gap-2">…</div>
  </CardContent>
</Card>

// ❌
<Card className="gap-2 py-0 cursor-pointer">
  <CardHeader className="px-4 pt-4 pb-0">…</CardHeader>
</Card>
```

## Typography

### Headings

`h1`–`h6` styles are defined with `@apply` in `@layer base` (`src/index.css`). Use **naked** heading tags — no `text-*`, `font-*`, or `tracking-*` utilities on them unless explicitly requested as an exception.

| Element | Style |
| --- | --- |
| `h1` | `text-4xl font-semibold tracking-tight` |
| `h2` | `text-3xl font-semibold tracking-tight` |
| `h3` | `text-2xl font-semibold tracking-tight` |
| `h4` | `text-xl font-semibold` |
| `h5` | `text-lg font-semibold` |
| `h6` | `text-base font-semibold` |

Pick the level that matches the intended scale instead of overriding a larger level with utilities.

### Default size

Body text, copy inside content components, and common text applications inherit the **base** size — the same as an unstyled `<p>` (`text-base` on `body` in `src/index.css`).

Do not force `text-sm` (or other sizes) on layout shells or content wrappers. Add a size utility only when you intentionally want denser or larger type (e.g. `text-xs` meta lines). Control chrome may define its own size/weight: **Button → `text-base` + `font-normal`**, **Badge → `text-sm` + `font-normal`**.

Examples:

- ✅ `<p>Jordan Reyes · lab · Ordered Aug 5</p>` with `text-xs` only on the meta line if needed
- ✅ Unstyled `<p>` for default body copy
- ✅ `<h4>Schedule</h4>` (naked; level matches scale)
- ❌ `Card` / `DialogContent` / `SheetContent` with root `text-sm` so children shrink by default
- ❌ `<h1 className="text-xl font-semibold">Schedule</h1>`

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
- ✅ Release permanently
- ❌ Grant…
- ❌ Deny...

### Button groups

When buttons are placed close together in a group, order them by priority:

- **Default (left / start aligned):** primary → secondary → tertiary, left to right
- **Right-aligned** (dialog footers, `justify-end`, trailing action clusters): reverse the order so the primary action sits on the right edge

Examples:

- ✅ Left-aligned card actions: `Grant` → `Deny` → `Release permanently`
- ✅ Left-aligned note actions: `Cosign` → `Return for revision`
- ✅ Right-aligned dialog footer: `Cancel` → `Grant access`
- ❌ Left-aligned: `Release permanently` → `View` when View is the primary action
- ❌ Right-aligned footer: `Grant access` → `Cancel`

Segmented toggles (role switch, schedule view) are mutually exclusive options, not priority-ordered action groups.

## Badges

Use **outline badges only** (`variant="outline"`). Do not use filled badge variants (`default`, `secondary`, `destructive`, `ghost`, `link`, or solid notification pills).

Badge text is **regular weight** (`font-normal`) and `text-sm` — set on the Badge primitive; do not override with `font-medium`.

Color meaning comes from documented tint helpers on the Badge module (`notificationBadgeClassName`, status tints). Compact counts use `countBadgeClassName` — do not re-declare `h-5` / `px-*` at call sites.

Examples:

- ✅ `<Badge variant="outline">Pending</Badge>`
- ✅ `<Badge variant="outline" className={notificationBadgeClassName}>New</Badge>`
- ❌ `<Badge variant="destructive">New</Badge>`
- ❌ `<Badge variant="secondary">3</Badge>`

### Lab / result card tags

- Green — Just released
- Blue — Temporary access, live countdown
- Amber — Access pending
- Neutral/muted — Access expired (not red; expiry is not a rejection)
- Red — Deny control and denial-reason block only

## Theme

The product UI is **light by default and light-only**. Do not follow the OS dark preference for the app shell, pages, or toasts.

- Root theme is forced to light via `ThemeProvider` (`src/components/theme-provider.tsx`)
- Do not pass `theme="system"` to Sonner or other theme-aware components
- Scoped `.dark` islands (e.g. the demo controls bar) are allowed for intentional contrast; they must not change the global theme

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

Enforce this globally in `src/index.css` (`@layer base`) — do not sprinkle `cursor-pointer` on individual components unless an element is interactive but not covered by the global selectors (e.g. a clickable `div`). For clickable cards, use `<Card interactive>` instead of a `cursor-pointer` utility.

## Design system documentation

Whenever a new component is created (or a new variant/style is introduced), document it immediately on the `/ds` page (`src/pages/DesignSystemPage.tsx`).

- Add a live example of the component and its variants
- If it is a product status badge or other repeated pattern, show every style currently used in the app
- Keep the inventory list in sync when adding shadcn/ui primitives under `src/components/ui`
- Do not merge or consider the work complete until `/ds` reflects the new component
