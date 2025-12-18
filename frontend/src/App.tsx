import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import BuilderLayout from './layouts/BuilderLayout';
import ContractorLayout from './layouts/ContractorLayout';
import SupplierLayout from './layouts/SupplierLayout';

// Common Pages
import Home from './pages/common/Home';
import About from './pages/common/About';
import FAQ from './pages/common/FAQ';
import Community from './pages/common/Community';
import Referral from './pages/common/Referral';
import Resources from './pages/common/Resources';
import HowItWorks from './pages/common/HowItWorks';
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import Dashboard from './pages/common/Dashboard';
import Marketplace from './pages/common/Marketplace';
import ProfessionalDirectory from './pages/common/ProfessionalDirectory';
import ContractorsDirectory from './pages/common/ContractorsDirectory';
import FairPriceCalculator from './pages/common/FairPriceCalculator';
import FinancialServices from './pages/common/FinancialServices';
import AIFeatures from './pages/common/AIFeatures';
import ConstructionOS from './pages/common/ConstructionOS';
import TrustInfrastructure from './pages/common/TrustInfrastructure';
import ForProjectOwners from './pages/common/ForProjectOwners';
import ForContractors from './pages/common/ForContractors';
import ContractorSignup from './pages/common/ContractorSignup';

// Builder Dashboard Pages
import AspirationalBuilder from './pages/builder/AspirationalBuilder';
import ConstructionRoadmap from './pages/builder/ConstructionRoadmap';
import BudgetingBuildingPlanning from './pages/builder/BudgetingBuildingPlanning';
import Building from './pages/builder/Building';
import CostCalculator from './pages/builder/CostCalculator';
import DiasporaGuide from './pages/builder/DiasporaGuide';
import CreateProject from './pages/builder/CreateProject';
import PostProject from './pages/builder/PostProject';
import ProjectCostEstimator from './pages/builder/ProjectCostEstimator';
import SqbTool from './pages/builder/SqbTool';
import ServiceTierSelection from './pages/builder/ServiceTierSelection';

// Contractor Dashboard Pages
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import ContractorSuite from './pages/contractor/ServiceTiers/DIY';
import ContractorSuiteDIT from './pages/contractor/ServiceTiers/DIT';
import ProjectManagement from './pages/contractor/ProjectManagement';
import ProjectManagementHub from './pages/contractor/ProjectManagementHub';
import ProjectDashboard from './pages/contractor/ProjectDashboard';
import SubcontractorHub from './pages/contractor/SubcontractorHub';
import ChangeOrders from './pages/contractor/ChangeOrders';
import FinancialTools from './pages/contractor/FinancialTools';
import AnalyticsReports from './pages/contractor/AnalyticsReports';

// Supplier Dashboard Pages
import SupplierPlatform from './pages/supplier/SupplierPlatform';
import Inventory from './pages/supplier/Inventory';
import Quotes from './pages/supplier/Quotes';
import Proposals from './pages/supplier/Proposals';
import Analytics from './pages/supplier/Analytics';
import TCOCalculator from './pages/supplier/TCOCalculator';
import VEProposalGenerator from './pages/supplier/VEProposalGenerator';
import BulkPurchasing from './pages/supplier/BulkPurchasing';
import BulkPurchasingGroup from './pages/supplier/BulkPurchasingGroup';
import CreateBulkPurchasingGroup from './pages/supplier/CreateBulkPurchasingGroup';
import MyBulkPurchasingGroups from './pages/supplier/MyBulkPurchasingGroups';

export default function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/community" element={<Community />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/resources" element={<Resources blogPosts={[]} />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/professional-directory" element={<ProfessionalDirectory />} />
            <Route path="/contractors-directory" element={<ContractorsDirectory />} />
            <Route path="/fair-price-calculator" element={<FairPriceCalculator />} />
            <Route path="/financial-services" element={<FinancialServices />} />
            <Route path="/ai-features" element={<AIFeatures />} />
            <Route path="/construction-os" element={<ConstructionOS />} />
            <Route path="/trust-infrastructure" element={<TrustInfrastructure />} />
            <Route path="/for-project-owners" element={<ForProjectOwners />} />
            <Route path="/for-contractors" element={<ForContractors />} />
            <Route path="/contractor-signup" element={<ContractorSignup />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Builder Dashboard Routes */}
            <Route path="/builder" element={<BuilderLayout />}>
                <Route index element={<AspirationalBuilder />} />
                <Route path="roadmap" element={<ConstructionRoadmap />} />
                <Route path="budgeting" element={<BudgetingBuildingPlanning />} />
                <Route path="building" element={<Building />} />
                <Route path="calculator" element={<CostCalculator />} />
                <Route path="diaspora" element={<DiasporaGuide />} />
                <Route path="create-project" element={<CreateProject />} />
                <Route path="post-project" element={<PostProject />} />
                <Route path="cost-estimator" element={<ProjectCostEstimator />} />
                <Route path="sqb-tool" element={<SqbTool />} />
                <Route path="service-tiers" element={<ServiceTierSelection />} />
            </Route>

            {/* Contractor Dashboard Routes */}
            <Route path="/contractor" element={<ContractorLayout />}>
                <Route index element={<ContractorDashboard />} />
                <Route path="suite" element={<ContractorSuite />} />
                <Route path="suite/dit" element={<ContractorSuiteDIT />} />
                <Route path="projects" element={<ProjectManagement />} />
                <Route path="hub" element={<ProjectManagementHub />} />
                <Route path="project/:id" element={<ProjectDashboard />} />
                <Route path="subcontractors" element={<SubcontractorHub />} />
                <Route path="change-orders" element={<ChangeOrders />} />
                <Route path="financial" element={<FinancialTools />} />
                <Route path="analytics" element={<AnalyticsReports />} />
            </Route>

            {/* Supplier Dashboard Routes */}
            <Route path="/supplier" element={<SupplierLayout />}>
                <Route index element={<SupplierPlatform />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="quotes" element={<Quotes />} />
                <Route path="proposals" element={<Proposals />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="tco-calculator" element={<TCOCalculator />} />
                <Route path="ve-generator" element={<VEProposalGenerator />} />
                <Route path="bulk-purchasing" element={<BulkPurchasing />} />
                <Route path="bulk-purchasing/group/:id" element={<BulkPurchasingGroup />} />
                <Route path="bulk-purchasing/create" element={<CreateBulkPurchasingGroup />} />
                <Route path="my-groups" element={<MyBulkPurchasingGroups />} />
            </Route>
        </Routes>
    );
}
