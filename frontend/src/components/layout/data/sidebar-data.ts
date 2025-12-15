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
      title: 'Builder Workspace',
      items: [
        {
          title: 'Overview',
          url: '/builder',
          icon: LayoutDashboard,
        },
        {
          title: 'Projects',
          url: '/builder?tab=projects',
          icon: Construction,
        },
        {
          title: 'Escrow',
          url: '/builder?tab=escrow',
          icon: Lock,
        },
        {
          title: 'Compliance',
          url: '/builder?tab=compliance',
          icon: ShieldCheck,
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
          url: '/contractor?tab=bids',
          icon: FileX, // Using FileX as a placeholder for Bids/Proposals
        },
        {
          title: 'WIPAA',
          url: '/contractor?tab=wipaa',
          icon: AudioWaveform,
        },
        {
          title: 'Projects',
          url: '/contractor?tab=projects',
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
          url: '/supplier?tab=orders',
          icon: Package,
        },
        {
          title: 'Products',
          url: '/supplier?tab=products',
          icon: Palette,
        },
        {
          title: 'Deliveries',
          url: '/supplier?tab=deliveries',
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
