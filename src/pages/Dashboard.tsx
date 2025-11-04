import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DollarSign, Users, TrendingUp, BarChart3, Clock, AlertCircle } from "lucide-react";

// Mock recent invoices data
const recentInvoices = [
  {
    id: "INV-2024-001",
    client: "Acme Corp",
    dueDate: "2024-01-15",
    amount: 12450,
    status: "sent",
  },
  {
    id: "INV-2024-002",
    client: "TechStart Inc",
    dueDate: "2024-01-12",
    amount: 8920,
    status: "overdue",
  },
  {
    id: "INV-2024-003",
    client: "Global Solutions",
    dueDate: "2024-01-20",
    amount: 15600,
    status: "draft",
  },
  {
    id: "INV-2024-004",
    client: "Innovation Labs",
    dueDate: "2024-01-10",
    amount: 9800,
    status: "paid",
  },
];

// Mock pending approvals data
const pendingApprovals = [
  {
    id: "1",
    type: "New Subscription",
    company: "Enterprise Corp",
    description: "Large discount applied",
    amount: 25000,
  },
  {
    id: "2",
    type: "Price Change",
    company: "Startup XYZ",
    description: "GST policy override",
    amount: 1200,
  },
  {
    id: "3",
    type: "Contract Terms",
    company: "MegaCorp Ltd",
    description: "Custom payment terms",
    amount: 18500,
  },
];

export default function Dashboard() {
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US')}`;
  };

  // Helper function to get status variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "active";
      case "sent":
        return "pending";
      case "overdue":
        return "terminated";
      case "draft":
        return "draft";
      default:
        return "draft";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* MRR */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">MRR</CardTitle>
              <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                <DollarSign className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">$847,320</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        {/* Active Employees */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Active Employees</CardTitle>
              <div className="h-7 w-7 rounded bg-purple-100 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">1,284</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8 this month
            </p>
          </CardContent>
        </Card>

        {/* Active Clients */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Active Clients</CardTitle>
              <div className="h-7 w-7 rounded bg-purple-100 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">892</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +23 this month
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Invoices */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Outstanding Invoices</CardTitle>
              <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">$124,580</div>
            <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
              <span className="rotate-180 inline-block">
                <TrendingUp className="h-3 w-3" />
              </span>
              -5.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Recent Invoices & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
              <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-700 p-0 h-auto">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="rounded-lg border border-slate-200 p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 text-sm">{invoice.id}</span>
                        <StatusBadge variant={getStatusVariant(invoice.status)}>
                          {invoice.status}
                        </StatusBadge>
                      </div>
                      <div className="text-sm text-slate-600">{invoice.client}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Due: {invoice.dueDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 text-sm">{formatCurrency(invoice.amount)}</div>
                      {invoice.status === "overdue" && (
                        <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                          <Clock className="h-3 w-3" />
                          Overdue
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-300" />
              <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="rounded-lg border border-amber-100 bg-amber-25 p-4" style={{ backgroundColor: '#fefce8' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-orange-400 font-medium">{approval.type}</div>
                      <div className="font-semibold text-slate-900 text-sm mt-0.5">{approval.company}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{approval.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 text-sm">{formatCurrency(approval.amount)}/mo</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-[10px] h-6 px-3 rounded-full">
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" className="text-[10px] h-6 px-3 rounded-full">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
