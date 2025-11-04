import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DollarSign, FileText, TrendingUp, Calendar, Download, Plus, BarChart3, Users } from "lucide-react";

// Mock transaction data
const recentTransactions = [
  {
    id: "1",
    type: "Payment Received",
    client: "TechCorp Ltd",
    date: "2024-01-15",
    amount: 250000,
    status: "completed",
  },
  {
    id: "2",
    type: "Invoice Generated",
    client: "StartupXYZ",
    date: "2024-01-14",
    amount: 175000,
    status: "pending",
  },
  {
    id: "3",
    type: "Payment Received",
    client: "GlobalTech Inc",
    date: "2024-01-13",
    amount: 325000,
    status: "completed",
  },
];

export default function FinanceDashboard() {
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance Dashboard</h1>
          <p className="text-sm text-slate-500">
            Monitor financial performance and cash flow
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white text-xs h-8 px-3">
            <Download className="h-3 w-3 mr-1.5" />
            Export Report
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3">
            <Plus className="h-3 w-3 mr-1.5" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Revenue */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Total Revenue</CardTitle>
              <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                <DollarSign className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">₹45,23,150</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              12.5%
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Invoices */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Outstanding Invoices</CardTitle>
              <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">₹8,75,000</div>
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <span className="rotate-180 inline-block">
                <TrendingUp className="h-3 w-3" />
              </span>
              5.2%
            </p>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Collection Rate</CardTitle>
              <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">94.5%</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              2.1%
            </p>
          </CardContent>
        </Card>

        {/* Avg Payment Days */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Avg Payment Days</CardTitle>
              <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">28 days</div>
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <span className="rotate-180 inline-block">
                <TrendingUp className="h-3 w-3" />
              </span>
              3 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <CardDescription className="text-xs">Latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="rounded-lg border border-slate-200 p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 text-sm">{transaction.type}</div>
                      <div className="text-sm text-slate-600 mt-0.5">{transaction.client}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{transaction.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 text-sm">{formatCurrency(transaction.amount)}</div>
                      <div className="mt-1">
                        <StatusBadge 
                          variant={transaction.status === "completed" ? "active" : "pending"}
                        >
                          {transaction.status}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Common finance operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-5 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100"
              >
                <FileText className="h-5 w-5 text-indigo-600" />
                <span className="text-xs font-medium">New Invoice</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-5 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100"
              >
                <FileText className="h-5 w-5 text-indigo-600" />
                <span className="text-xs font-medium">Record Payment</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-5 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100"
              >
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <span className="text-xs font-medium">View Reports</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-5 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100"
              >
                <Users className="h-5 w-5 text-indigo-600" />
                <span className="text-xs font-medium">Client Statements</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

