import { cn } from "@/lib/utils"
import React, { FC } from 'react';
import {
  Landmark, Plus, PlusCircle, AlertCircle, AlertTriangle, BarChart3, Edit3, ArrowLeft, ArrowDown, ArrowRight, ArrowUp, ClipboardList, Paperclip, DollarSign, Sparkles, BarChart, FlaskConical, Zap, BookOpen, Brain, PenTool, Building2, Building, Calculator, Calendar, CalendarDays, Camera, MessageSquare, Check, CheckCircle2, ListChecks, ChevronLeft, ChevronRight, X, UploadCloud, HardHat, Phone, Copy, Cpu, CreditCard, Moon, Trash2, FileText, ScanLine, Download, PenTool as DrawIcon, Edit, FileEdit, FileSignature, Mail, Factory, AlertOctagon, ChevronDown, Compass, Upload, ChevronsLeft, Folder, FolderOpen, UserPlus, ShieldCheck, Users, Users2, HelpCircle, History, Image as ImageIcon, Info, PackageSearch, ChevronUp, ChevronsRight, LayoutGrid, Sun, Truck, MapPinOff, MapPin, Lock, LogIn, LogOut, FileSearch, Maximize, Maximize2, Menu, Activity, Bell, Maximize as OpenInFull, Package, Palette, Pause, Pencil, User, UserSearch, PieChart, Play, PlayCircle, Anchor, Printer, Loader2, BrainCircuit, Globe, Circle, CloudRain, Receipt, RefreshCcw, Minus, FileQuestion, Save, Clock, Search, SearchX, Shield, Send, ShoppingCart, Smartphone, Bot, Star, RefreshCw, ThumbsDown, ThumbsUp, TrendingDown, TrendingUp, SlidersHorizontal, ChevronsUpDown, Unlock, CheckCircle, Video, Eye, EyeOff, Wallet, Briefcase, XCircle, FileQuestion as FallbackIcon
} from 'lucide-react';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string
  size?: number | string
  color?: string
}

const IconMap: Record<string, FC<any>> = {
  account_balance: Landmark,
  add: Plus,
  add_circle: PlusCircle,
  alert_circle: AlertCircle,
  alert_triangle: AlertTriangle,
  analytics: BarChart3,
  architecture: Edit3,
  arrow_back: ArrowLeft,
  arrow_downward: ArrowDown,
  arrow_forward: ArrowRight,
  arrow_left: ArrowLeft,
  arrow_upward: ArrowUp,
  assignment: ClipboardList,
  attach_file: Paperclip,
  attach_money: DollarSign,
  auto_awesome: Sparkles,
  bar_chart: BarChart,
  biotech: FlaskConical,
  bolt: Zap,
  book_open: BookOpen,
  brain: Brain,
  build: PenTool,
  building2: Building2,
  business: Building,
  calculate: Calculator,
  calendar: Calendar,
  calendar_today: CalendarDays,
  camera: Camera,
  chat: MessageSquare,
  check: Check,
  check_circle: CheckCircle2,
  checklist: ListChecks,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  close: X,
  cloud_upload: UploadCloud,
  construction: HardHat,
  contact_phone: Phone,
  content_copy: Copy,
  cpu: Cpu,
  credit_card: CreditCard,
  dark_mode: Moon,
  delete: Trash2,
  description: FileText,
  document_scanner: ScanLine,
  download: Download,
  draw: DrawIcon,
  edit: Edit,
  edit_document: FileEdit,
  edit_note: FileSignature,
  email: Mail,
  engineering: Factory,
  error: AlertOctagon,
  expand_more: ChevronDown,
  explore: Compass,
  file_up: Upload,
  first_page: ChevronsLeft,
  folder: Folder,
  folder_open: FolderOpen,
  folder_shared: UserPlus,
  gpp_good: ShieldCheck,
  group: Users,
  groups: Users2,
  help: HelpCircle,
  help_outline: HelpCircle,
  history: History,
  image: ImageIcon,
  info: Info,
  inventory_2: PackageSearch,
  keyboard_arrow_down: ChevronDown,
  keyboard_arrow_left: ChevronLeft,
  keyboard_arrow_right: ChevronRight,
  keyboard_arrow_up: ChevronUp,
  last_page: ChevronsRight,
  layout_grid: LayoutGrid,
  light_mode: Sun,
  local_shipping: Truck,
  location_off: MapPinOff,
  location_on: MapPin,
  lock: Lock,
  login: LogIn,
  logout: LogOut,
  mail: Mail,
  manage_accounts: UserPlus,
  manage_search: FileSearch,
  maximize: Maximize,
  maximize2: Maximize2,
  menu: Menu,
  monitoring: Activity,
  notifications: Bell,
  open_in_full: OpenInFull,
  package: Package,
  palette: Palette,
  pause: Pause,
  pencil: Pencil,
  person: User,
  person_add: UserPlus,
  person_search: UserSearch,
  phone: Phone,
  pie_chart: PieChart,
  play: Play,
  play_arrow: PlayCircle,
  precision_manufacturing: Anchor,
  print: Printer,
  progress_activity: Loader2,
  psychology: BrainCircuit,
  public: Globe,
  radio_button_unchecked: Circle,
  rainy: CloudRain,
  receipt_long: Receipt,
  refresh: RefreshCw,
  refresh_cw: RefreshCcw,
  remove: Minus,
  request_page: FileQuestion,
  save: Save,
  schedule: Clock,
  search: Search,
  search_off: SearchX,
  security: Shield,
  send: Send,
  shopping_cart: ShoppingCart,
  signature: FileSignature,
  smartphone: Smartphone,
  smart_toy: Bot,
  star: Star,
  sync: RefreshCw,
  thumb_down: ThumbsDown,
  thumb_up: ThumbsUp,
  trending_down: TrendingDown,
  trending_up: TrendingUp,
  truck: Truck,
  tune: SlidersHorizontal,
  unfold_more: ChevronsUpDown,
  unlock: Unlock,
  upload: Upload,
  upload_cloud: UploadCloud,
  verified: CheckCircle,
  verified_user: ShieldCheck,
  video: Video,
  visibility: Eye,
  visibility_off: EyeOff,
  wallet: Wallet,
  work: Briefcase,
  x_circle: XCircle
};

export function Icon({ name, className, size, color, style, ...props }: IconProps) {
  const LucideIcon = IconMap[name] || FallbackIcon;
  
  // Convert string sizes to numbers if possible, fallback to 24
  let resolvedSize: number = 24;
  if (typeof size === 'number') {
    resolvedSize = size;
  } else if (typeof size === 'string') {
    const parsed = parseInt(size, 10);
    if (!isNaN(parsed)) resolvedSize = parsed;
  }
  
  return (
    <span
      className={cn("flex items-center justify-center shrink-0", className)}
      style={{
        ...style,
      }}
      {...props}
    >
      <LucideIcon size={resolvedSize} color={color || "currentColor"} strokeWidth={2} />
    </span>
  )
}
