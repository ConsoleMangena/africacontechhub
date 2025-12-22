# Africa ConTech Hub

**The Digital Enabler for DzeNhare Secure Quality Building Consultancy.**

## Overview
[cite_start]The **Africa ConTech Hub** is a digital ecosystem designed to manage capital project risk in the construction environment of Zimbabwe.

[cite_start]The system replaces the "lowest-bid" mentality with a "Budget Engineering" methodology, connecting three key stakeholders—Aspirational Builders (Diaspora), Professional Contractors, and Material Suppliers—through transparent, data-driven dashboards.

## Tech Stack

* **Frontend:** React (TypeScript) + Vite
* **Backend:** Django (Python)
* **API:** Django REST Framework (DRF)
* **Authentication & Database:** **Supabase** (PostgreSQL + Auth)
    * *Database:* Managed PostgreSQL accessed via `dj-database-url`.
    * *Auth:* JWT-based authentication verified via custom Django backend.
* **Mobile Strategy:** Offline-First Architecture 

## Key Features

### 1. The Aspirational Builder Dashboard (B2C)
*Target: Diaspora Clients & Property Owners*
* [cite_start]**Trust & Remote Control:** Full visibility of project progress from abroad[cite: 29].
* [cite_start]**Regulatory Shield:** Automated verification of architectural plans against **SI 56 of 2025** (Registered Architects) prior to deposit[cite: 34].
* [cite_start]**Milestone Escrow:** Funds are held in a Trust Account (e.g., CABS/Steward Bank) and released only upon verified completion of work[cite: 31, 32].
* [cite_start]**Digital Twin:** Real-time "Planned vs Actual" budget tracking and digital Change Order approval[cite: 33].

### 2. The Professional Contractor Dashboard (B2B)
*Target: Construction Firms*
* [cite_start]**P4P Bidding Engine:** Automated calculation of **Net Margin** and **Overhead** to ensure safe, profitable bids.
* [cite_start]**WIPAA Monitor:** Real-time solvency tracking (Work in Progress Account Analysis) to flag "Over/Under Billing" risks immediately.
* [cite_start]**TCO Procurement:** A purchasing tool that ranks suppliers by **Total Cost of Ownership** (Price + Reliability + Defect Rate)[cite: 40].

### 3. The Supplier Portal
*Target: Material Vendors*
* [cite_start]**Value-Driven Quoting:** Allows suppliers to upload performance metrics (e.g., On-Time Delivery %) to justify pricing[cite: 44].
* [cite_start]**Guaranteed Payment:** Direct integration with the Escrow system for automatic payment upon verified delivery[cite: 45].

## Repository Structure

```text
/africa-contech-hub
├── /apps                    # Django Apps (Modular Logic)
│   ├── /core               # Shared Models
│   ├── /builder_dashboard  # B2C Domain
│   ├── /contractor_dashboard # B2B Domain
│   ├── /supplier_dashboard # Portal Domain
│   ├── /authentication     # Custom Auth
│   └── /billing            # Subscription & Billing
├── /config                  # Django Global Settings (CORS, DB, Middleware)
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── /src                     # React + TypeScript Application
│   ├── /features           # Domain Logic (Builder, Contractor, Supplier)
│   ├── /components         # Reusable UI Components
│   ├── /routes             # Router Configuration
│   ├── /services           # API Services
│   └── /stores             # State Management
├── /public                  # Static Assets
├── manage.py                # Django Management Script
├── requirements.txt         # Python Dependencies
├── package.json             # Node.js Dependencies
├── vite.config.ts           # Vite Configuration
├── tsconfig.json            # TypeScript Configuration
└── README.md
```