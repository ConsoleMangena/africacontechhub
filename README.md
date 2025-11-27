# Africa ConTech Hub 🏗️

**The Digital Enabler for DzeNhare Secure Quality Building Consultancy.**

## 📖 Overview
[cite_start]The **Africa ConTech Hub** is a digital ecosystem designed to manage capital project risk in the construction environment of Zimbabwe.

[cite_start]The system replaces the "lowest-bid" mentality with a "Budget Engineering" methodology, connecting three key stakeholders—Aspirational Builders (Diaspora), Professional Contractors, and Material Suppliers—through transparent, data-driven dashboards.

## 🛠️ Tech Stack

* **Frontend:** React (TypeScript)
* **Backend:** Django (Python)
* **API:** Django REST Framework (DRF)
* **Database:** PostgreSQL
* [cite_start]**Mobile Strategy:** Offline-First Architecture 

## 🚀 Key Features

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

## 📂 Repository Structure

```text
/africa-contech-hub
├── /backend                 # Django Project Root
│   ├── /core                # Main Settings & Config
│   ├── /api                 # Django REST Framework Apps
│   │   ├── /users           # Auth & Role Management (Builder, Contractor, Supplier)
│   │   ├── /projects        # WBS, Daily Logs, Change Orders
│   │   ├── /finance         # P4P Logic, WIPAA Monitor, Escrow Triggers
│   │   └── /procurement     # TCO Logic, Supplier Quotes
│   ├── manage.py
│   └── requirements.txt
├── /frontend                # React + TypeScript Application
│   ├── /src
│   │   ├── /components      # Reusable UI (Dashboards, Charts)
│   │   ├── /hooks           # Custom Hooks (Offline Sync, API calls)
│   │   └── /types           # TypeScript Interfaces (Project, WBS, User)
│   ├── package.json
│   └── tsconfig.json
├── /docs                    # Documentation
│   ├── /srs                 # Software Requirements Specification
│   └── /compliance          # SI 56 of 2025 Verification Rules
└── README.md