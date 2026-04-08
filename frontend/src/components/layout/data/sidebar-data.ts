import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: 'command_key',
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: 'gallery_thumbnail',
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: 'audio_waveform',
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Admin Workspace',
      items: [
        {
          title: 'Dashboard Analytics',
          url: '/admin/dashboard-analytics',
          icon: 'monitoring',
        },
        {
          title: 'Overview',
          url: '/admin',
          icon: 'security',
        },
        {
          title: 'Projects',
          url: '/admin/projects',
          icon: 'business_center',
        },
        {
          title: 'AI Command Center',
          url: '/admin/ai-command-center',
          icon: 'smart_toy',
        },
        {
          title: 'User Management',
          url: '/admin/users',
          icon: 'group',
        },
        {
          title: 'Team Management',
          url: '/admin/team',
          icon: 'engineering',
        },
        {
          title: 'Procurement',
          url: '/admin/procurement',
          icon: 'inventory_2',
        },
        {
          title: 'Knowledge Base',
          url: '/admin/knowledge-base',
          icon: 'menu_book',
        },
        {
          title: 'Floor Plans',
          url: '/admin/floor-plans',
          icon: 'image',
        },
        {
          title: 'Platform Billing',
          url: '/admin/billing',
          icon: 'payments',
        },
        {
          title: 'System Settings',
          url: '/admin/settings',
          icon: 'settings_suggest',
        },
      ],
    },
    {
      title: 'Aspirational Builder',
      items: [
        {
          title: 'Overview',
          url: '/builder',
          icon: 'dashboard',
        },
        {
          title: 'Design Drafting',
          url: '/builder/design-drafting',
          icon: 'architecture',
        },
        {
          title: 'Construction Budget',
          url: '/builder/measurements',
          icon: 'receipt_long',
        },
        {
          title: 'Procurement',
          url: '/builder/procurement',
          icon: 'inventory_2',
        },
        {
          title: 'Building the Project',
          url: '/builder/building',
          icon: 'construction',
        },
      ],
    },
    {
      title: 'Contractor Workspace',
      items: [
        {
          title: 'Overview',
          url: '/contractor',
          icon: 'dashboard',
        },
        {
          title: 'Bids',
          url: '/contractor',
          icon: 'description',
        },
        {
          title: 'WIPAA',
          url: '/contractor',
          icon: 'audio_waveform',
        },
        {
          title: 'Projects',
          url: '/contractor',
          icon: 'construction',
        },
      ],
    },
    {
      title: 'Supplier Workspace',
      items: [
        {
          title: 'Overview',
          url: '/supplier',
          icon: 'dashboard',
        },
        {
          title: 'Orders',
          url: '/supplier',
          icon: 'shopping_cart',
        },
        {
          title: 'Products',
          url: '/supplier',
          icon: 'inventory_2',
        },
        {
          title: 'Deliveries',
          url: '/supplier',
          icon: 'local_shipping',
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'SQB Building Team',
          url: '/sqb-team',
          icon: 'verified_user',
        },
        {
          title: 'Settings',
          icon: 'settings',
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: 'person',
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: 'manage_accounts',
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: 'palette',
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: 'notifications',
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: 'help',
        },
        {
          title: 'Billing',
          url: '/billing',
          icon: 'credit_card',
        },
      ],
    },
    {
      title: 'Finance Management',
      items: [
        {
          title: 'Financial Reports',
          url: '/admin/finance?tab=pl',
          icon: 'account_balance',
        },
        {
          title: 'Balance Sheet',
          url: '/admin/finance?tab=balance',
          icon: 'balance',
        },
        {
          title: 'Profit & Loss',
          url: '/admin/finance?tab=pl',
          icon: 'trending_up',
        },
        {
          title: 'Cash Flow',
          url: '/admin/finance?tab=cashflow',
          icon: 'water',
        },
        {
          title: 'Invoices',
          url: '/admin/finance?tab=invoices',
          icon: 'receipt_long',
        },
      ],
    },
    {
      title: 'Cyber Info',
      items: [
        {
          title: 'Activity Log',
          url: '/admin/activity-log',
          icon: 'history',
        },
        {
          title: 'Audit Log',
          url: '/admin/audit-log',
          icon: 'travel_explore',
        },
      ],
    },
  ],
}
