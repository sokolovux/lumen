import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { CheckIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { StatusPill } from '@/components/schedule/StatusPill'
import {
  getLabStatusLabel,
  getNoteStatusLabel,
} from '@/lib/statusDerivation'
import type { LabStatus, NoteStatus, ScheduleStatus } from '@/state/types'

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

const LAB_STATUS_STYLES: { status: LabStatus; className: string }[] = [
  { status: 'pending', className: '' },
  { status: 'requested', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  { status: 'granted_unstarted', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  { status: 'active', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { status: 'expired', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  { status: 'denied', className: 'border-destructive/30 bg-destructive/10 text-destructive' },
  { status: 'released', className: 'border-green-200 bg-green-50 text-green-700' },
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
      <h3 className="text-sm font-medium">{label}</h3>
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
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
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
        <h1 className="text-xl font-semibold">Design system</h1>
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
            description="Olive-tinted light theme, Lato type, and shared radius tokens."
          >
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-medium">Color</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {COLOR_TOKENS.map((token) => (
                    <Swatch key={token.name} {...token} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Chart</h3>
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
                <h3 className="mb-2 text-sm font-medium">Typography</h3>
                <Card>
                  <CardContent className="space-y-4 p-4 font-sans">
                    <div className="space-y-3">
                      <h1 className="text-4xl font-semibold tracking-tight">
                        Heading 1
                      </h1>
                      <h2 className="text-3xl font-semibold tracking-tight">
                        Heading 2
                      </h2>
                      <h3 className="text-2xl font-semibold tracking-tight">
                        Heading 3
                      </h3>
                      <h4 className="text-xl font-semibold">
                        Heading 4
                      </h4>
                      <h5 className="text-lg font-semibold">
                        Heading 5
                      </h5>
                      <h6 className="text-base font-semibold">
                        Heading 6
                      </h6>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Body emphasis (text-sm medium)</p>
                      <p className="text-sm">
                        Body copy uses Lato. Prefer sentence case for all UI labels.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Muted helper text (text-xs muted-foreground)
                      </p>
                      <p className="text-sm">
                        Inline code uses{' '}
                        <Kbd>⌘</Kbd> <Kbd>B</Kbd> style affordances where needed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Radius</h3>
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
                <CardHeader className="pb-2">
                  <CardTitle>Sentence case</CardTitle>
                  <CardDescription>
                    All UI copy uses sentence case, except medications, test names,
                    lab results, and patient names.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-emerald-700">✓ Grant temporary access</p>
                  <p className="text-emerald-700">✓ Access requests</p>
                  <p className="text-destructive">✗ Grant Temporary Access</p>
                  <p className="text-muted-foreground">
                    Keep: Lisinopril, HbA1c, Chest X-Ray, Jordan Reyes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Schedule columns</CardTitle>
                  <CardDescription>
                    Today view uses exactly four stage columns. No checked-in status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="font-medium">Scheduled</span> — not started</p>
                  <p><span className="font-medium">With PA</span> — vitals + first note</p>
                  <p><span className="font-medium">With physician</span> — transferred</p>
                  <p><span className="font-medium">Finished</span> — finish visit clicked</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Button labels</CardTitle>
                  <CardDescription>
                    No ellipses in buttons. The dialog covers the incomplete step.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-emerald-700">✓ Grant</p>
                  <p className="text-emerald-700">✓ Deny</p>
                  <p className="text-destructive">✗ Grant…</p>
                  <p className="text-destructive">✗ Deny...</p>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Separator />

          <Section
            id="badges"
            title="Badges"
            description="Every badge style currently used in the product UI."
          >
            <div className="space-y-6">
              <BadgeRow label="Base variants">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="ghost">Ghost</Badge>
                <Badge variant="link">Link</Badge>
              </BadgeRow>

              <BadgeRow label="Unread / new indicators">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Sidebar count</span>
                  <Badge variant="destructive" className="h-5 min-w-5 justify-center px-1.5 text-xs">
                    3
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Queue / requests</span>
                  <Badge variant="destructive" className="h-5 text-xs">New</Badge>
                </div>
              </BadgeRow>

              <BadgeRow label="Schedule status pills">
                {SCHEDULE_STATUSES.map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <StatusPill status={status} />
                    {status === 'scheduled' ? (
                      <span className="text-xs text-muted-foreground">Scheduled (hidden)</span>
                    ) : null}
                  </div>
                ))}
              </BadgeRow>

              <BadgeRow label="Lab & imaging status">
                {LAB_STATUS_STYLES.map(({ status, className }) => (
                  <Badge key={status} variant="outline" className={className}>
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

          <Section id="buttons" title="Buttons" description="Variants and sizes from shadcn Button.">
            <Card>
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
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
              </CardContent>
            </Card>
          </Section>

          <Separator />

          <Section id="forms" title="Forms" description="Inputs and controls used across charts and dialogs.">
            <Card>
              <CardContent className="grid gap-6 p-4 md:grid-cols-2">
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
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={62} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Loading</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4">
                    <Spinner />
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Section>

          <Separator />

          <Section id="surfaces" title="Surfaces" description="Cards, tabs, tables, and avatars.">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card title</CardTitle>
                  <CardDescription>
                    Cards group related chart content and queue items.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Body content sits here with muted supporting copy.
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm">Primary action</Button>
                  <Button size="sm" variant="outline">Cancel</Button>
                </CardFooter>
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
                    <Button>Grant access</Button>
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
            id="inventory"
            title="Component inventory"
            description="Every shadcn component installed under src/components/ui."
          >
            <div className="flex flex-wrap gap-2">
              {UI_COMPONENTS.map((name) => (
                <Badge key={name} variant="outline" className="font-mono text-xs font-normal">
                  {name}
                </Badge>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
