# The Central Hub - Zimbabwe's Construction Digital Backbone

A React SPA for Zimbabwe's construction industry marketplace, connecting project owners, contractors, and material suppliers.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/      # Reusable UI components
├── layouts/         # Page layouts (AppLayout)
├── pages/           # Route pages
│   ├── AIFeatures/
│   ├── DiyService/
│   ├── FinancialServices/
│   ├── Marketplace/
│   ├── ServiceTiers/
│   ├── SupplierPlatform/
│   └── ... (48+ page components)
├── styles/          # CSS styles
├── App.tsx          # Route definitions
└── main.tsx         # Application entry point
```

## 🛠 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **Recharts** - Charts/graphs
- **React Helmet Async** - Document head management

## 📱 Main Features

### Four Portal Gateways
1. **Aspirational Builder Portal** - For homeowners planning construction
2. **Contractor Suite** - Dashboard for contractors
3. **Supplier Platform** - For building material suppliers
4. **Marketplace** - Buy/sell construction goods

### Service Tiers
- **DIY (Do It Yourself)** - Self-service tools
- **DIT (Do It Together)** - Guided support
- **DIFY (Do It For You)** - Full-service management

### Tools & Features
- Cost Calculator
- Project Cost Estimator
- Professional Directory
- Bulk Purchasing Groups
- Project Management Hub
- Financial Services
- AI-powered features

## 🔗 Key Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/aspirational-builder` | Aspirational Builder portal |
| `/contractor-suite` | Contractor management suite |
| `/supplier-platform` | Supplier platform |
| `/marketplace` | Marketplace |
| `/bulk-purchasing` | Bulk purchasing groups |
| `/financial-services` | Financial services |
| `/ai-features` | AI-powered features |

## 📝 Note

This is a **frontend-only** application. To add backend functionality, you'll need to integrate with:
- A REST API or GraphQL backend
- Authentication service (Auth0, Firebase Auth, etc.)
- Database (via BaaS like Supabase, Firebase, or custom API)

## 📄 License

MIT
