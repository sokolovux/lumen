import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { CheckIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, countBadgeClassName, notificationBadgeClassName } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Kbd } from '@/components/ui/kbd'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  getLabStatusLabel,
  getLabStatusTint,
  getNoteStatusLabel,
  getScheduleStatusLabel,
  scheduleStatusTint,
} from '@/lib/statusDerivation'
import type { LabStatus, NoteStatus, ScheduleStatus } from '@/state/types'
import { LabResultCardsGallery } from '@/pages/LabResultCardsGallery'

const COLOR_TOKENS = [
  { name: 'Background', swatch: 'bg-background', fg: 'text-foreground', border: true },
  { name: 'Foreground', swatch: 'bg-foreground', fg: 'text-background' },
  { name: 'Card', swatch: 'bg-card', fg: 'text-card-foreground', border: true },
  { name: 'Primary', swatch: 'bg-primary', fg: 'text-primary-foreground' },
  { name: 'Secondary', swatch: 'bg-secondary', fg: 'text-secondary-foreground' },
  { name: 'Muted', swatch: 'bg-muted', fg: 'text-muted-foreground' },
  { name: 'Accent', swatch: 'bg-accent', fg: 'text-accent-foreground' },
  { name: 'Destructive', swatch: 'bg-destructive', fg: 'text-white' },
  { name: 'Border', swatch: 'bg-border', fg: 'text-foreground' },
  { name: 'Input', swatch: 'bg-input', fg: 'text-foreground' },
  { name: 'Ring', swatch: 'bg-ring', fg: 'text-foreground' },
  { name: 'Sidebar', swatch: 'bg-sidebar', fg: 'text-sidebar-foreground', border: true },
] as const

const CHART_TOKENS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'] as const

const SCHEDULE_STATUSES: ScheduleStatus[] = [
  'scheduled',
  'with_pa',
  'with_physician',
  'finished',
  'late',
]

const LAB_STATUSES: LabStatus[] = [
  'pending',
  'requested',
  'granted_unstarted',
  'active',
  'expired',
  'denied',
  'released',
]

const NOTE_STATUS_STYLES: { status: NoteStatus; className: string }[] = [
  { status: 'not_started', className: '' },
  { status: 'draft', className: '' },
  { status: 'submitted', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  { status: 'returned', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  { status: 'cosigned', className: 'border-green-200 bg-green-50 text-green-700' },
]

function BadgeRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <h6>{label}</h6>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-4">
        {children}
      </div>
    </div>
  )
}

const UI_COMPONENTS = [
  'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'attachment', 'avatar',
  'badge', 'breadcrumb', 'bubble', 'button', 'button-group', 'calendar',
  'card', 'carousel', 'chart', 'checkbox', 'collapsible', 'combobox',
  'command', 'context-menu', 'dialog', 'direction', 'drawer', 'dropdown-menu',
  'empty', 'field', 'hover-card', 'input', 'input-group', 'input-otp',
  'item', 'kbd', 'label', 'marker', 'menubar', 'message', 'message-scroller',
  'native-select', 'navigation-menu', 'pagination', 'popover', 'progress',
  'questionnaire', 'radio-group', 'resizable', 'scroll-area', 'select',
  'separator', 'sheet', 'sidebar', 'skeleton', 'slider', 'sonner',
  'spinner', 'switch', 'table', 'tabs', 'textarea', 'toggle', 'toggle-group',
  'tooltip',
]

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6 space-y-4">
      <div>
        <h5>{title}</h5>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function Swatch({
  name,
  swatch,
  fg,
  border,
}: {
  name: string
  swatch: string
  fg: string
  border?: boolean
}) {
  return (
    <div
      className={`flex h-20 flex-col justify-end rounded-lg p-2 ${swatch} ${fg} ${
        border ? 'ring-1 ring-border' : ''
      }`}
    >
      <span className="text-xs font-medium">{name}</span>
    </div>
  )
}

export function DesignSystemPage() {
  const [sliderValue, setSliderValue] = useState([40])
  const [checked, setChecked] = useState(true)
  const [enabled, setEnabled] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h4>Design system</h4>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-8">
          <nav className="flex flex-wrap gap-2">
            {[
              ['foundations', 'Foundations'],
              ['principles', 'Principles'],
              ['badges', 'Badges'],
              ['buttons', 'Buttons'],
              ['forms', 'Forms'],
              ['feedback', 'Feedback'],
              ['surfaces', 'Surfaces'],
              ['result-cards', 'Result cards'],
              ['overlays', 'Overlays'],
              ['inventory', 'Inventory'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={`#${href}`}
                className="rounded-md border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>

          <Section
            id="foundations"
            title="Foundations"
            description="Olive-tinted light theme, Geist type, and shared radius tokens."
          >
            <div className="space-y-6">
              <div>
                <h6 className="mb-2">Color</h6>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {COLOR_TOKENS.map((token) => (
                    <Swatch key={token.name} {...token} />
                  ))}
                </div>
              </div>

              <div>
                <h6 className="mb-2">Chart</h6>
                <div className="flex gap-2">
                  {CHART_TOKENS.map((token, i) => (
                    <div
                      key={token}
                      className={`h-12 flex-1 rounded-md ${token}`}
                      title={`Chart ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h6 className="mb-2">Typography</h6>
                <Card>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h1>Heading 1</h1>
                        <h2>Heading 2</h2>
                        <h3>Heading 3</h3>
                        <h4>Heading 4</h4>
                        <h5>Heading 5</h5>
                        <h6>Heading 6</h6>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <p>
                          Unstyled paragraph — inherits body text-base (no size utilities).
                        </p>
                        <p className="text-sm font-medium">Body emphasis (text-sm medium)</p>
                        <p className="text-sm">
                          Body copy uses Geist. Prefer sentence case for all UI labels.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          text-muted-foreground — secondary copy
                        </p>
                        <p className="text-sm">
                          Inline code uses{' '}
                          <Kbd>⌘</Kbd> <Kbd>B</Kbd> style affordances where needed.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h6 className="mb-2">Radius</h6>
                <div className="flex flex-wrap items-end gap-3">
                  {[
                    ['rounded-sm', 'sm'],
                    ['rounded-md', 'md'],
                    ['rounded-lg', 'lg'],
                    ['rounded-xl', 'xl'],
                    ['rounded-2xl', '2xl'],
                  ].map(([cls, label]) => (
                    <div key={label} className="flex flex-col items-center gap-1">
                      <div className={`size-14 bg-primary ${cls}`} />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          <Section
            id="principles"
            title="Principles"
            description="Product rules from design.md that apply across the prototype."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sentence case</CardTitle>
                  <CardDescription>
                    All UI copy uses sentence case, except medications, test names,
                    lab results, and patient names.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-emerald-700">✓ Grant temporary access</p>
                    <p className="text-emerald-700">✓ Access requests</p>
                    <p className="text-destructive">✗ Grant Temporary Access</p>
                    <p className="text-muted-foreground">
                      Keep: Lisinopril, HbA1c, Chest X-Ray, Jordan Reyes
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Schedule columns</CardTitle>
                  <CardDescription>
                    Today view uses exactly four stage columns. No checked-in status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><span className="font-medium">Scheduled</span> — not started</p>
                    <p><span className="font-medium">With PA</span> — vitals + first note</p>
                    <p><span className="font-medium">With physician</span> — transferred</p>
                    <p><span className="font-medium">Finished</span> — finish visit clicked</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Default text size</CardTitle>
                  <CardDescription>
                    Body and content copy inherit base (unstyled p). Size utilities
                    only when intentional.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-emerald-700">✓ Unstyled p / inherit text-base</p>
                    <p className="text-emerald-700">✓ Naked h1–h6 (styles in @layer base)</p>
                    <p className="text-emerald-700">✓ Button text-base · Badge text-sm</p>
                    <p className="text-destructive">✗ Heading with text-* / font-* utilities</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Button labels</CardTitle>
                  <CardDescription>
                    No ellipses in buttons. The dialog covers the incomplete step.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-emerald-700">✓ Grant</p>
                    <p className="text-emerald-700">✓ Deny</p>
                    <p className="text-emerald-700">✓ Release permanently</p>
                    <p className="text-destructive">✗ Grant…</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Button groups</CardTitle>
                  <CardDescription>
                    Primary → secondary left to right. Reverse when the group is
                    right-aligned.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-emerald-700">✓ Left: Grant → Deny → Release permanently</p>
                    <p className="text-emerald-700">✓ Right footer: Cancel → Grant</p>
                    <p className="text-destructive">✗ Left: Release permanently → View (View primary)</p>
                    <p className="text-destructive">✗ Right footer: Grant → Cancel</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>
                    Light by default and light-only. OS dark mode must not flip the app.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-emerald-700">✓ Forced light ThemeProvider</p>
                    <p className="text-emerald-700">✓ Toasts use resolved light theme</p>
                    <p className="text-destructive">✗ theme=&quot;system&quot; as app default</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>
                    Outline only. Color meaning comes from className tints.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-emerald-700">✓ variant=&quot;outline&quot;</p>
                    <p className="text-emerald-700">✓ Blue tint for New / unread</p>
                    <p className="text-destructive">✗ Filled default / destructive badges</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cards</CardTitle>
                  <CardDescription>
                    Naked Card slots. Layout utilities go on inner elements only.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-emerald-700">✓ Equal padding from the primitive</p>
                    <p className="text-emerald-700">✓ interactive · size props</p>
                    <p className="text-destructive">✗ className on Card / Header / Content</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tabs</CardTitle>
                  <CardDescription>
                    Line tabs only. TabsList defaults to variant=&quot;line&quot;.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-emerald-700">✓ Underline active state (line)</p>
                    <p className="text-destructive">✗ Muted pill TabsList variant=&quot;default&quot;</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Utilities &amp; components</CardTitle>
                  <CardDescription>
                    Utilities first for layout. Ask before new components; keep
                    existing ones naked.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-emerald-700">✓ Compose with utilities + existing primitives</p>
                    <p className="text-emerald-700">✓ Repeated chrome → @apply in the component</p>
                    <p className="text-destructive">✗ New component without asking</p>
                    <p className="text-destructive">✗ Utilities on existing components without permission</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Separator />

          <Section
            id="badges"
            title="Badges"
            description="Outline only. Use className tints for status and notification color."
          >
            <div className="space-y-6">
              <BadgeRow label="Product rule — outline only">
                <Badge variant="outline">Outline</Badge>
                <Badge variant="outline" className={notificationBadgeClassName}>
                  Notification tint
                </Badge>
                <Badge
                  variant="outline"
                  className="border-destructive/30 bg-destructive/10 text-destructive"
                >
                  Restricted tint
                </Badge>
              </BadgeRow>

              <BadgeRow label="Unread / new indicators">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Sidebar count</span>
                  <Badge
                    variant="outline"
                    className={cn(countBadgeClassName, notificationBadgeClassName)}
                  >
                    3
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Queue / requests</span>
                  <Badge variant="outline" className={notificationBadgeClassName}>
                    New
                  </Badge>
                </div>
              </BadgeRow>

              <BadgeRow label="Schedule status pills">
                {SCHEDULE_STATUSES.map((status) => {
                  const tint = scheduleStatusTint[status]
                  return (
                    <div key={status} className="flex items-center gap-2">
                      {tint ? (
                        <Badge variant="outline" className={tint}>
                          {getScheduleStatusLabel(status)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Scheduled (hidden)
                        </span>
                      )}
                    </div>
                  )
                })}
              </BadgeRow>

              <BadgeRow label="Lab & imaging status">
                {LAB_STATUSES.map((status) => (
                  <Badge
                    key={status}
                    variant="outline"
                    className={getLabStatusTint(status)}
                  >
                    {getLabStatusLabel(status)}
                  </Badge>
                ))}
              </BadgeRow>

              <BadgeRow label="Clinical note status">
                {NOTE_STATUS_STYLES.map(({ status, className }) => (
                  <Badge key={status} variant="outline" className={className}>
                    {getNoteStatusLabel(status)}
                  </Badge>
                ))}
              </BadgeRow>

              <BadgeRow label="Medication status">
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700"
                >
                  Active
                </Badge>
                <Badge
                  variant="outline"
                  className="border-destructive/30 bg-destructive/10 text-destructive"
                >
                  Discontinued
                </Badge>
              </BadgeRow>

              <BadgeRow label="Cosign queue note status">
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-700"
                >
                  Submitted — awaiting cosign
                </Badge>
              </BadgeRow>
            </div>
          </Section>

          <Separator />

          <Section
            id="buttons"
            title="Buttons"
            description="Variants, sizes, and group order: primary → secondary left to right; reverse when right-aligned."
          >
            <Card>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="xs">Extra small</Button>
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon" aria-label="Add">
                      <PlusIcon />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled>Disabled</Button>
                    <Button
                      onClick={() => toast.success('Toast example', {
                        description: 'Sonner notification from the design system page.',
                      })}
                    >
                      Show toast
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Left-aligned group — primary first
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="success">Grant</Button>
                      <Button size="sm" variant="destructive">Deny</Button>
                      <Button size="sm" variant="outline">Release permanently</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Right-aligned group — primary on the right
                    </p>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline">Cancel</Button>
                      <Button size="sm" variant="success">Grant access</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          <Separator />

          <Section id="forms" title="Forms" description="Inputs and controls used across charts and dialogs.">
            <Card>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ds-name">Patient name</Label>
                    <Input id="ds-name" placeholder="Jordan Reyes" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select defaultValue="10m">
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10s">10 seconds (demo)</SelectItem>
                        <SelectItem value="10m">10 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ds-note">Clinical note</Label>
                    <Textarea id="ds-note" placeholder="Enter note text…" rows={3} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="ds-check"
                      checked={checked}
                      onCheckedChange={(v) => setChecked(v === true)}
                    />
                    <Label htmlFor="ds-check">Confirm access</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="ds-switch"
                      checked={enabled}
                      onCheckedChange={setEnabled}
                    />
                    <Label htmlFor="ds-switch">Enable reminder</Label>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Slider ({sliderValue[0]}%)</Label>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          <Separator />

          <Section id="feedback" title="Feedback" description="Alerts, progress, and loading states.">
            <div className="space-y-4">
              <Alert>
                <CheckIcon />
                <AlertTitle>Access granted</AlertTitle>
                <AlertDescription>
                  Temporary access is ready — awaiting PA confirmation.
                </AlertDescription>
              </Alert>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={62} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Loading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Spinner />
                      <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Section>

          <Separator />

          <Section id="surfaces" title="Surfaces" description="Cards, line tabs, tables, and avatars.">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card title</CardTitle>
                  <CardDescription>
                    Naked by default — equal padding, no call-site utilities on Card slots.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Body content sits here with muted supporting copy.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Primary action</Button>
                  <Button size="sm" variant="outline">Cancel</Button>
                </CardFooter>
              </Card>
              <Card size="sm" interactive>
                <CardHeader>
                  <CardTitle>Interactive · sm</CardTitle>
                  <CardDescription>
                    size=&quot;sm&quot; and interactive for clickable cards.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Tabs defaultValue="visits">
                <TabsList>
                  <TabsTrigger value="visits">Visits</TabsTrigger>
                  <TabsTrigger value="labs">Labs & results</TabsTrigger>
                  <TabsTrigger value="audit">Audit trail</TabsTrigger>
                </TabsList>
                <TabsContent value="visits" className="rounded-lg border p-4 text-sm">
                  Visit panel content
                </TabsContent>
                <TabsContent value="labs" className="rounded-lg border p-4 text-sm">
                  Labs & results content
                </TabsContent>
                <TabsContent value="audit" className="rounded-lg border p-4 text-sm">
                  Audit trail content
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>JR</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>PA</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>PA</TableCell>
                      <TableCell>Start visit</TableCell>
                      <TableCell className="text-muted-foreground">Visit started</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Physician</TableCell>
                      <TableCell>Cosign note</TableCell>
                      <TableCell className="text-muted-foreground">Note cosigned (v1)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </Section>

          <Separator />

          <Section id="overlays" title="Overlays" description="Dialogs, alert dialogs, and sheets.">
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Grant temporary access</DialogTitle>
                    <DialogDescription>
                      Timer starts when the PA confirms.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="success">Grant access</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Open alert dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Release permanently?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The PA will be notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive">
                      Release permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Visit panel</SheetTitle>
                    <SheetDescription>
                      Sheets are used for side panels and mobile navigation.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Start window confirm</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Start access window?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Start your 1-hour access window now? The countdown begins
                      only after you confirm.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Expired document overlay</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>HbA1c</DialogTitle>
                    <DialogDescription>
                      Document view expired state (blur + overlay)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative min-h-40 overflow-hidden rounded-lg border">
                    <div className="space-y-2 p-4 blur-sm">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 px-4 text-center">
                      <p className="text-sm font-semibold">Access has expired</p>
                      <p className="text-xs text-muted-foreground">
                        Your temporary access window closed.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Section>

          <Separator />

          <Section
            id="result-cards"
            title="Result cards"
            description="Every Labs & Results and Access / My Requests card state for PA and physician. Presentational fixtures — switch tabs to review edge cases."
          >
            <LabResultCardsGallery />
          </Section>

          <Separator />

          <Section
            id="inventory"
            title="Component inventory"
            description="Every shadcn component installed under src/components/ui."
          >
            <div className="flex flex-wrap gap-2">
              {UI_COMPONENTS.map((name) => (
                <Badge key={name} variant="outline">
                  <span className="font-mono">{name}</span>
                </Badge>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
