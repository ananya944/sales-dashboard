import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
	BrowserRouter,
	Routes,
	Route,
} from 'react-router-dom'
import SidebarLayout from './layouts/SidebarLayout'
import Dashboard from './pages/Dashboard'
import FinanceDashboard from './pages/FinanceDashboard'
import Clients from './pages/Clients'
import Employees from './pages/Employees'
import Invoices from './pages/Invoices'
import Reconciliation from './pages/Reconciliation'
import Prospects from './pages/Prospects'
import ProspectDetail from './pages/ProspectDetail'
import ClientDetails from './pages/ClientDetails'
import CreateSubscription from './pages/CreateSubscription'
import CreateSubscriptionStep2 from './pages/CreateSubscriptionStep2'
import CreateSubscriptionStep3 from './pages/CreateSubscriptionStep3'
import EmployeeDetails from './pages/EmployeeDetails'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<SidebarLayout />}> 
          <Route index element={<Prospects />} />
          <Route path="finance/dashboard" element={<FinanceDashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetails />} />
          <Route path="clients/:id/new-subscription" element={<CreateSubscription />} />
          <Route path="clients/:id/new-subscription/step2" element={<CreateSubscriptionStep2 />} />
          <Route path="clients/:id/new-subscription/step3" element={<CreateSubscriptionStep3 />} />
          <Route path="prospects" element={<Prospects />} />
          <Route path="prospects/:id" element={<ProspectDetail />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<EmployeeDetails />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reconciliation" element={<Reconciliation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
