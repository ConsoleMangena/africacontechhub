import {
  Construction,
  LayoutDashboard,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  Settings,
  Wrench,
  UserCog,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  CreditCard,
  Briefcase,
  BookOpen,
  Users,
  ShieldAlert,
  Image,
  FileSpreadsheet,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Admin Workspace',
      items: [
        {
          title: 'Overview',
          url: '/admin',
          icon: ShieldAlert,
        },
        {
          title: 'User Management',
          url: '/admin/users',
          icon: Users,
        },
        {
          title: 'Knowledge Base',
          url: '/admin/knowledge-base',
          icon: BookOpen,
        },
        {
          title: 'Floor Plans',
          url: '/admin/floor-plans',
          icon: Image,
        },
      ],
    },
    {
      title: 'Aspirational Builder',
      items: [
        {
          title: 'Overview',
          url: '/builder',
          icon: LayoutDashboard,
        },
        {
          title: 'Floor Plans',
          url: '/builder/floor-plans',
          icon: Image,
        },
      ],
    },
    {
      title: 'Contractor Workspace',
      items: [
        {
          title: 'Overview',
          url: '/contractor',
          icon: LayoutDashboard,
        },
        {
          title: 'Bids',
          url: '/contractor',
          icon: FileX, // Using FileX as a placeholder for Bids/Proposals
        },
        {
          title: 'WIPAA',
          url: '/contractor',
          icon: AudioWaveform,
        },
        {
          title: 'Projects',
          url: '/contractor',
          icon: Construction,
        },
      ],
    },
    {
      title: 'Supplier Workspace',
      items: [
        {
          title: 'Overview',
          url: '/supplier',
          icon: LayoutDashboard,
        },
        {
          title: 'Orders',
          url: '/supplier',
          icon: Package,
        },
        {
          title: 'Products',
          url: '/supplier',
          icon: Palette,
        },
        {
          title: 'Deliveries',
          url: '/supplier',
          icon: Wrench,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
        {
          title: 'Billing',
          url: '/billing',
          icon: CreditCard,
        },
      ],
    },
  ],
}
