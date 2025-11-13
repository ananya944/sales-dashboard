import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { supabase } from "@/lib/supabase";
import { DollarSign, Users, TrendingUp, BarChart3, Clock } from "lucide-react";

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

type TrendDirection = "up" | "down" | "neutral";

interface MetricState {
  current: number;
  previous: number;
  changePercent: number | null;
  trend: TrendDirection;
}

interface DashboardInvoice {
  invoice_id: string;
  org_legal_name: string | null;
  due_date: string | null;
  amount: number | null;
  status: string | null;
}

const OUTSTANDING_STATUSES = ["sent", "overdue", "partially paid"];

const calculatePercentChange = (current: number, previous: number): number | null => {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / previous) * 100;
};

const getTrendDirection = (changePercent: number | null): TrendDirection => {
  if (changePercent === null) {
    return "neutral";
  }

  if (changePercent > 0) {
    return "up";
  }

  if (changePercent < 0) {
    return "down";
  }

  return "neutral";
};

const formatChangeLabel = (changePercent: number | null): string => {
  if (changePercent === null) {
    return "No data from last month";
  }

  return `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}% from last month`;
};

export default function Dashboard() {
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [activeEmployees, setActiveEmployees] = useState<MetricState>({
    current: 0,
    previous: 0,
    changePercent: null,
    trend: "neutral",
  });
  const [activeClients, setActiveClients] = useState<MetricState>({
    current: 0,
    previous: 0,
    changePercent: null,
    trend: "neutral",
  });
  const [outstandingInvoices, setOutstandingInvoices] = useState<MetricState>({
    current: 0,
    previous: 0,
    changePercent: null,
    trend: "neutral",
  });
  const [totalOutstandingAmount, setTotalOutstandingAmount] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<DashboardInvoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      setIsLoadingMetrics(true);
      setMetricsError(null);

      try {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const startOfCurrentMonthISO = startOfCurrentMonth.toISOString();
        const startOfLastMonthISO = startOfLastMonth.toISOString();
        const startOfNextMonthISO = startOfNextMonth.toISOString();

        const [
          activeEmployeesCurrent,
          activeEmployeesPrevious,
          activeClientsCurrent,
          activeClientsPrevious,
          outstandingTotal,
          outstandingCurrentMonth,
          outstandingLastMonth,
        ] = await Promise.all([
          supabase
            .from("employees")
            .select("*", { count: "exact", head: true })
            .eq("status", "Active"),
          supabase
            .from("employees")
            .select("*", { count: "exact", head: true })
            .eq("status", "Active")
            .lt("created_at", startOfCurrentMonthISO),
          supabase
            .from("organizations")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true),
          supabase
            .from("organizations")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true)
            .lt("created_at", startOfCurrentMonthISO),
          supabase
            .from("zoho_invoices")
            .select("amount")
            .in("status", OUTSTANDING_STATUSES),
          supabase
            .from("zoho_invoices")
            .select("amount")
            .in("status", OUTSTANDING_STATUSES)
            .gte("date", startOfCurrentMonthISO)
            .lt("date", startOfNextMonthISO),
          supabase
            .from("zoho_invoices")
            .select("amount")
            .in("status", OUTSTANDING_STATUSES)
            .gte("date", startOfLastMonthISO)
            .lt("date", startOfCurrentMonthISO),
        ]);

        if (
          activeEmployeesCurrent.error ||
          activeEmployeesPrevious.error ||
          activeClientsCurrent.error ||
          activeClientsPrevious.error ||
          outstandingTotal.error ||
          outstandingCurrentMonth.error ||
          outstandingLastMonth.error
        ) {
          throw (
            activeEmployeesCurrent.error ||
            activeEmployeesPrevious.error ||
            activeClientsCurrent.error ||
            activeClientsPrevious.error ||
            outstandingTotal.error ||
            outstandingCurrentMonth.error ||
            outstandingLastMonth.error
          );
        }

        const activeEmployeesCurrentCount = activeEmployeesCurrent.count ?? 0;
        const activeEmployeesPreviousCount = activeEmployeesPrevious.count ?? 0;
        const activeEmployeesChange = calculatePercentChange(
          activeEmployeesCurrentCount,
          activeEmployeesPreviousCount
        );

        setActiveEmployees({
          current: activeEmployeesCurrentCount,
          previous: activeEmployeesPreviousCount,
          changePercent: activeEmployeesChange,
          trend: getTrendDirection(activeEmployeesChange),
        });

        const activeClientsCurrentCount = activeClientsCurrent.count ?? 0;
        const activeClientsPreviousCount = activeClientsPrevious.count ?? 0;
        const activeClientsChange = calculatePercentChange(
          activeClientsCurrentCount,
          activeClientsPreviousCount
        );

        setActiveClients({
          current: activeClientsCurrentCount,
          previous: activeClientsPreviousCount,
          changePercent: activeClientsChange,
          trend: getTrendDirection(activeClientsChange),
        });

        const sumAmounts = (rows: { amount: number | null }[] | null | undefined) =>
          rows?.reduce((total, row) => total + (row.amount ?? 0), 0) ?? 0;

        const totalOutstanding = sumAmounts(outstandingTotal.data);
        const currentMonthOutstanding = sumAmounts(outstandingCurrentMonth.data);
        const lastMonthOutstanding = sumAmounts(outstandingLastMonth.data);
        const outstandingChange = calculatePercentChange(
          currentMonthOutstanding,
          lastMonthOutstanding
        );

        setTotalOutstandingAmount(totalOutstanding);
        setOutstandingInvoices({
          current: currentMonthOutstanding,
          previous: lastMonthOutstanding,
          changePercent: outstandingChange,
          trend: getTrendDirection(outstandingChange),
        });
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
        setMetricsError("We couldn't load the latest metrics.");
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    void fetchDashboardMetrics();
  }, []);

  useEffect(() => {
    const fetchRecentInvoices = async () => {
      setIsLoadingInvoices(true);
      setInvoicesError(null);
      try {
        const { data, error } = await supabase
          .from("zoho_invoices")
          .select("invoice_id, org_legal_name, due_date, amount, status")
          .order("date", { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        setRecentInvoices((data as DashboardInvoice[]) ?? []);
      } catch (error) {
        console.error("Error fetching recent invoices:", error);
        setInvoicesError("Unable to load recent invoices.");
      } finally {
        setIsLoadingInvoices(false);
      }
    };

    void fetchRecentInvoices();
  }, []);

  // Helper function to format currency
  const formatCurrency = (amount: number | null | undefined) => {
    return `$${(amount ?? 0).toLocaleString('en-US')}`;
  };
  const formatNumber = (value: number) => value.toLocaleString('en-US');
  const formatDate = (value: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.split("T")[0] ?? value;
    }
    return date.toISOString().split("T")[0];
  };
  const getChangeStyles = (trend: TrendDirection) => {
    switch (trend) {
      case "up":
        return { textClass: "text-green-600", rotate: false };
      case "down":
        return { textClass: "text-red-600", rotate: true };
      default:
        return { textClass: "text-slate-500", rotate: false };
    }
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
      case "partially paid":
        return "pending";
      default:
        return "draft";
    }
  };

  const activeEmployeesStyles = getChangeStyles(activeEmployees.trend);
  const activeClientsStyles = getChangeStyles(activeClients.trend);
  const outstandingStyles = getChangeStyles(outstandingInvoices.trend);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back! Here's what's happening with your business.
        </p>
        {metricsError && (
          <p className="mt-2 text-sm text-red-600">{metricsError}</p>
        )}
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
            <div className="text-xl font-bold text-slate-900">
              {isLoadingMetrics ? "—" : formatNumber(activeEmployees.current)}
            </div>
            <p
              className={`text-xs flex items-center gap-1 mt-1 ${activeEmployeesStyles.textClass}`}
            >
              {activeEmployees.trend !== "neutral" && (
                <span className={activeEmployeesStyles.rotate ? "rotate-180 inline-block" : ""}>
                  <TrendingUp className="h-3 w-3" />
                </span>
              )}
              {formatChangeLabel(activeEmployees.changePercent)}
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
            <div className="text-xl font-bold text-slate-900">
              {isLoadingMetrics ? "—" : formatNumber(activeClients.current)}
            </div>
            <p
              className={`text-xs flex items-center gap-1 mt-1 ${activeClientsStyles.textClass}`}
            >
              {activeClients.trend !== "neutral" && (
                <span className={activeClientsStyles.rotate ? "rotate-180 inline-block" : ""}>
                  <TrendingUp className="h-3 w-3" />
                </span>
              )}
              {formatChangeLabel(activeClients.changePercent)}
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
            <div className="text-xl font-bold text-slate-900">
              {isLoadingMetrics ? "—" : formatCurrency(totalOutstandingAmount)}
            </div>
            <p
              className={`text-xs flex items-center gap-1 mt-1 ${outstandingStyles.textClass}`}
            >
              {outstandingInvoices.trend !== "neutral" && (
                <span className={outstandingStyles.rotate ? "rotate-180 inline-block" : ""}>
                  <TrendingUp className="h-3 w-3" />
                </span>
              )}
              {formatChangeLabel(outstandingInvoices.changePercent)}
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
              <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-700 p-0 h-auto" asChild>
                <Link to="/invoices">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {invoicesError && (
              <p className="mb-3 text-sm text-red-600">{invoicesError}</p>
            )}
            <div className="space-y-3">
              {isLoadingInvoices
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`invoice-skeleton-${index}`}
                      className="h-20 rounded-lg border border-slate-200 bg-slate-100 animate-pulse"
                    />
                  ))
                : recentInvoices.map((invoice) => (
                    <div
                      key={invoice.invoice_id}
                      className="rounded-lg border border-slate-200 p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900 text-sm">
                              {invoice.invoice_id}
                            </span>
                            {invoice.status && (
                              <StatusBadge variant={getStatusVariant(invoice.status.toLowerCase())}>
                                {invoice.status.toLowerCase()}
                              </StatusBadge>
                            )}
                          </div>
                          <div className="text-sm text-slate-600">
                            {invoice.org_legal_name ?? "Unknown client"}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Due: {formatDate(invoice.due_date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900 text-sm">
                            {formatCurrency(invoice.amount)}
                          </div>
                          {invoice.status?.toLowerCase() === "overdue" && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                              <Clock className="h-3 w-3" />
                              Overdue
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              {!isLoadingInvoices && !invoicesError && recentInvoices.length === 0 && (
                <p className="text-sm text-slate-500">No recent invoices found.</p>
              )}
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
