import {
  // Business & Commerce
  ShoppingBag,
  Store,
  Truck,
  Package,
  CreditCard,
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  
  // Communication
  MessageCircle,
  Phone,
  Mail,
  Send,
  
  // Files & Documents
  FileText,
  File,
  Upload,
  Download,
  Image,
  FileSpreadsheet,
  
  // Status & Feedback
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  
  // Navigation
  Home,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  
  // Actions
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  
  // Security & Trust
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  
  // User & Account
  User,
  Users,
  LogIn,
  LogOut,
  Settings,
  
  // Misc
  Calendar,
  MapPin,
  Tag,
  Star,
  Heart,
  Bookmark,
  HelpCircle,
  ExternalLink,
  Link2,
  QrCode,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export const businessIcons: Record<string, LucideIcon> = {
  // E-commerce platforms
  shopee: ShoppingBag,
  lazada: ShoppingBag,
  grab: Truck,
  grabfood: Package,
  foodpanda: Package,
  
  // Payment methods
  tng: Wallet,
  bank: CreditCard,
  cash: DollarSign,
  ewallet: Wallet,
  
  // Business types
  store: Store,
  restaurant: Package,
  delivery: Truck,
  retail: ShoppingBag,
  
  // Default
  default: Store,
};

export const evidenceIcons: Record<string, LucideIcon> = {
  whatsapp: MessageCircle,
  telegram: Send,
  instagram: Image,
  csv_grab: FileSpreadsheet,
  csv_shopee: FileSpreadsheet,
  csv_foodpanda: FileSpreadsheet,
  pdf_bank: FileText,
  pdf_ewallet: FileText,
  screenshot: Image,
  manual: Edit,
  voice: Phone,
  default: File,
};

export const statusIcons: Record<string, LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  pending: Clock,
  processing: RefreshCw,
  default: Info,
};

export const insightIcons: Record<string, LucideIcon> = {
  trend: TrendingUp,
  peak_day: BarChart3,
  coverage: PieChart,
  recommendation: Info,
  default: Info,
};

export function getBusinessIcon(type: string): LucideIcon {
  const key = type.toLowerCase().replace(/[^a-z]/g, '');
  return businessIcons[key] || businessIcons.default;
}

export function getEvidenceIcon(sourceType: string): LucideIcon {
  const key = sourceType.toLowerCase().replace(/[^a-z_]/g, '');
  return evidenceIcons[key] || evidenceIcons.default;
}

export function getStatusIcon(status: string): LucideIcon {
  const key = status.toLowerCase().replace(/[^a-z]/g, '');
  return statusIcons[key] || statusIcons.default;
}

export function getInsightIcon(type: string): LucideIcon {
  const key = type.toLowerCase().replace(/[^a-z_]/g, '');
  return insightIcons[key] || insightIcons.default;
}

export {
  // Business
  ShoppingBag,
  Store,
  Truck,
  Package,
  CreditCard,
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  
  // Communication
  MessageCircle,
  Phone,
  Mail,
  Send,
  
  // Files
  FileText,
  File,
  Upload,
  Download,
  Image,
  FileSpreadsheet,
  
  // Status
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  
  // Navigation
  Home,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  
  // Actions
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  
  // Security
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  
  // User
  User,
  Users,
  LogIn,
  LogOut,
  Settings,
  
  // Misc
  Calendar,
  MapPin,
  Tag,
  Star,
  Heart,
  Bookmark,
  HelpCircle,
  ExternalLink,
  Link2,
  QrCode,
};
