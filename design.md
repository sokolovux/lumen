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
  <Button variant="outline">View</Button>
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

### Font weights

Do **not** use font-weight Tailwind utilities (`font-normal`, `font-medium`, `font-semibold`, `font-bold`, etc.) at call sites.

Adjust weight only with:

- **Naked headings** (`h1`–`h6`) — medium from `@layer base`
- **`<strong>`** — `@apply font-medium text-foreground` in `@layer base`

Default body and most UI stay regular by inheritance (Button and Badge included). Primitive chrome may set weight only via `@apply` inside the component (see `src/components/ui/font-weight.css` and `card.css`), not via call-site utilities. Applied emphasis weight is **medium**.

### Headings

`h1`–`h6` styles are defined with `@apply` in `@layer base` (`src/index.css`). Use **naked** heading tags — no `text-*`, `font-*`, or `tracking-*` utilities on them unless explicitly requested as an exception.

| Element | Style |
| --- | --- |
| `h1` | `text-4xl font-medium tracking-tight` |
| `h2` | `text-3xl font-medium tracking-tight` |
| `h3` | `text-2xl font-medium tracking-tight` |
| `h4` | `text-xl font-medium` |
| `h5` | `text-lg font-medium` |
| `h6` | `text-base font-medium` |

Pick the level that matches the intended scale instead of overriding a larger level with utilities.

### Default size

Body text, copy inside content components, and common text applications inherit the **base** size — the same as an unstyled `<p>` (`text-base` on `body` in `src/index.css`).

Unstyled `<p>` also defaults to **`text-muted-foreground`** via `@apply` in `@layer base`. Add `text-foreground` (or a semantic color) only when the paragraph should be primary emphasis.

Do not force `text-sm` (or other sizes) on layout shells or content wrappers. Add a size utility only when you intentionally want denser or larger type (e.g. `text-xs` meta lines). Control chrome may define its own size: **Button / TabsTrigger → `text-base`** (same as a regular `<p>`), **Badge → `text-sm`** (regular weight by inheritance; no weight utilities).

Examples:

- ✅ `<p>Ordered Aug 5</p>` — muted by default
- ✅ `<p className="text-foreground">Pending request from Alex Chen</p>` — intentional primary copy
- ✅ `<h4>Schedule</h4>` (naked; level matches scale)
- ❌ `Card` / `DialogContent` / `SheetContent` with root `text-sm` so children shrink by default
- ❌ `<h1 className="text-xl font-medium">Schedule</h1>`
- ❌ `<p className="text-muted-foreground">…</p>` when muted is already the default (redundant)

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

Do **not** use `Button` `variant="secondary"`. Use `variant="outline"` for that role. Do not reintroduce secondary on the Button primitive.

Do not use ellipses (`…` or `...`) in button labels. The dialog or next step makes the incomplete action clear — the button should be a complete verb phrase.

Examples:

- ✅ `<Button variant="outline">View</Button>`
- ✅ Grant
- ✅ Deny
- ✅ Release permanently
- ❌ `<Button variant="secondary">View</Button>`
- ❌ Grant…
- ❌ Deny...

### Button groups

When buttons are placed close together in a group, order them by priority. Here “primary / secondary / tertiary” means **action emphasis**, not `variant="secondary"`.

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

Badge text is **regular weight** (inherited) and `text-sm` — set on the Badge primitive; do not add font-weight utilities.

Color meaning comes from documented tint helpers on the Badge module (`notificationBadgeClassName`, status tints). Compact counts use `countBadgeClassName` — do not re-declare `h-5` / `px-*` at call sites.

Examples:

- ✅ `<Badge variant="outline">Pending</Badge>`
- ✅ `<Badge variant="outline" className={notificationBadgeClassName}>New</Badge>`
- ❌ `<Badge variant="destructive">New</Badge>`
- ❌ `<Badge variant="secondary">3</Badge>`

### Lab / result card tags

- Green — Just released
- Green — Temporary access (`granted_unstarted` and `active` on Labs; live countdown uses neutral `AccessTimer` top-right in `CardContent`)
- Blue — Access requested
- Amber — Access pending
- Neutral/muted — Access expired (not red; expiry is not a rejection)
- Red — Deny control and denial-reason block only

## Border radius

Maximum corner radius is **`md`** (`rounded-md`). Do not use `rounded-lg`, `rounded-xl`, `rounded-2xl`, or larger.

- Cards and most chrome use `rounded-md` (Card in `src/components/ui/card.css`)
- Smaller radii (`rounded-xs`, `rounded-sm`, `rounded-none`) are fine where denser
- `rounded-xs` is half of `rounded-sm` (`--radius-xs: calc(var(--radius-sm) * 0.5)`); Badges use it
- `rounded-full` is reserved for circular controls only (avatar, radio, switch) — not for cards, menus, or panels

## Theme

The product UI is **light by default and light-only**. Do not follow the OS dark preference for the app shell, pages, or toasts.

Semantic neutrals (`background`, `foreground`, `muted`, `border`, `sidebar`, etc.) use the **Tailwind Gray** ramp via `var(--color-gray-*)` in `src/index.css`.

- Root theme is forced to light via `ThemeProvider` (`src/components/theme-provider.tsx`)
- Do not pass `theme="system"` to Sonner or other theme-aware components
- Scoped `.dark` islands (e.g. the demo controls bar) are allowed for intentional contrast; they must not change the global theme

## Schedule status columns

Today’s schedule uses exactly these columns:

| Column | Meaning |
|--------|---------|
| Scheduled | Appointment is scheduled but has not been started yet |
| Intake | Visit started; Assistant is entering vitals and the first note |
| Review | Assistant has transferred the patient to the physician (first note submitted for cosign) |
| Finished | Physician clicked Finish visit |

Do not use a separate Checked in status.

## Roles

The product has exactly two user denominations:

| Display | Code (`Role`) |
|---------|----------------|
| Assistant | `'assistant'` |
| Physician | `'physician'` |

Do not use PA, physician assistant, doctor, or other synonyms in UI copy or new code. Schedule column/status labels use **Intake** and **Review**.

## Pointer cursor

All interactive elements must show a pointer cursor on hover.

Enforce this globally in `src/index.css` (`@layer base`) — do not sprinkle `cursor-pointer` on individual components unless an element is interactive but not covered by the global selectors (e.g. a clickable `div`). For clickable cards, use `<Card interactive>` instead of a `cursor-pointer` utility.

## Design system documentation

Whenever a new component is created (or a new variant/style is introduced), document it immediately on the `/ds` page (`src/pages/DesignSystemPage.tsx`).

- Add a live example of the component and its variants
- If it is a product status badge or other repeated pattern, show every style currently used in the app
- Keep the inventory list in sync when adding shadcn/ui primitives under `src/components/ui`
- Do not merge or consider the work complete until `/ds` reflects the new component
