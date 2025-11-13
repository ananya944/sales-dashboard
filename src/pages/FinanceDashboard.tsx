import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DollarSign, FileText, TrendingUp, Calendar, Download, Plus, BarChart3, Users } from "lucide-react";
import { getAllInvoices, type Invoice } from "@/services/invoiceService";
import { useToast } from "@/hooks/use-toast";

type MetricState = {
  totalRevenue: number;
  outstandingInvoices: number;
  collectionRate: number;
  averagePaymentDays: number | null;
};

const OUTSTANDING_STATUSES = new Set(["sent", "overdue", "partially paid", "partially_paid", "draft"]);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (input: string) => {
  if (!input) return "—";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const determineTransactionType = (status: string) => {
  return status.toLowerCase() === "paid" ? "Payment Received" : "Invoice Generated";
};

const formatStatusLabel = (status: string) => {
  if (!status) return "unknown";
  return status.replace(/_/g, " ");
};

export default function FinanceDashboard() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricState>({
    totalRevenue: 0,
    outstandingInvoices: 0,
    collectionRate: 0,
    averagePaymentDays: null,
  });

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true);
        const data = await getAllInvoices();
        setInvoices(data);
      } catch (error: any) {
        console.error("Error loading invoices:", error);
        toast({
          title: "❌ Failed to load finance data",
          description: error?.message ?? "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, [toast]);

  useEffect(() => {
    if (!invoices.length) {
      setMetrics({
        totalRevenue: 0,
        outstandingInvoices: 0,
        collectionRate: 0,
        averagePaymentDays: null,
      });
      return;
    }

    const paidInvoices = invoices.filter(
      (invoice) => invoice.status?.toLowerCase() === "paid",
    );

    const totalRevenue = paidInvoices.reduce(
      (sum, invoice) => sum + (Number(invoice.amount) || 0),
      0,
    );

    const outstandingInvoices = invoices.reduce((sum, invoice) => {
      const status = invoice.status?.toLowerCase() ?? "";
      return OUTSTANDING_STATUSES.has(status)
        ? sum + (Number(invoice.amount) || 0)
        : sum;
    }, 0);

    const collectionRate =
      invoices.length > 0 ? (paidInvoices.length / invoices.length) * 100 : 0;

    const paymentDayDiffs = paidInvoices
      .map((invoice) => {
        if (!invoice.date || !invoice.due_date) return null;
        const issuedAt = new Date(invoice.date);
        const dueAt = new Date(invoice.due_date);
        if (Number.isNaN(issuedAt.getTime()) || Number.isNaN(dueAt.getTime())) return null;
        const diffMs = dueAt.getTime() - issuedAt.getTime();
        return diffMs / (1000 * 60 * 60 * 24);
      })
      .filter((value): value is number => value !== null && Number.isFinite(value) && value >= 0);

    const averagePaymentDays =
      paymentDayDiffs.length > 0
        ? Math.round(
            paymentDayDiffs.reduce((sum, days) => sum + days, 0) / paymentDayDiffs.length,
          )
        : null;

    setMetrics({
      totalRevenue,
      outstandingInvoices,
      collectionRate,
      averagePaymentDays,
    });
  }, [invoices]);

  const recentTransactions = useMemo(() => {
    if (!invoices.length) return [];

    const sorted = [...invoices].sort((a, b) => {
      const dateA = new Date(a.date ?? "").getTime();
      const dateB = new Date(b.date ?? "").getTime();
      return dateB - dateA;
    });

    return sorted.slice(0, 5);
  }, [invoices]);

  const formatMetricValue = (value: number, formatter: (input: number) => string) => {
    if (isLoading) return "Loading...";
    if (!Number.isFinite(value)) return "—";
    return formatter(value);
  };

  const formatAveragePaymentDays = (value: number | null) => {
    if (isLoading) return "Loading...";
    if (value === null) return "N/A";
    return `${value} days`;
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
            <div className="text-xl font-bold text-slate-900">
              {formatMetricValue(metrics.totalRevenue, formatCurrency)}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-slate-300" />
              Updated just now
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
            <div className="text-xl font-bold text-slate-900">
              {formatMetricValue(metrics.outstandingInvoices, formatCurrency)}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-slate-300 rotate-180" />
              Updated just now
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
            <div className="text-xl font-bold text-slate-900">
              {isLoading
                ? "Loading..."
                : `${metrics.collectionRate ? metrics.collectionRate.toFixed(1) : 0}%`}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-slate-300" />
              Updated just now
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
            <div className="text-xl font-bold text-slate-900">
              {formatAveragePaymentDays(metrics.averagePaymentDays)}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-slate-300 rotate-180" />
              Updated just now
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
              {isLoading && (
                <div className="rounded-lg border border-slate-200 p-4 bg-white text-sm text-slate-500">
                  Loading transactions...
                </div>
              )}

              {!isLoading && recentTransactions.length === 0 && (
                <div className="rounded-lg border border-slate-200 p-4 bg-white text-sm text-slate-500">
                  No transactions available.
                </div>
              )}

              {!isLoading &&
                recentTransactions.map((transaction) => {
                  const status = transaction.status?.toLowerCase() ?? "";
                  const badgeVariant = status === "paid" ? "active" : "pending";
                  return (
                    <div key={transaction.invoice_id} className="rounded-lg border border-slate-200 p-4 bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 text-sm">
                            {determineTransactionType(status)}
                          </div>
                          <div className="text-sm text-slate-600 mt-0.5">
                            {transaction.org_legal_name || "Unknown Client"}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{formatDate(transaction.date)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900 text-sm">
                            {formatCurrency(Number(transaction.amount) || 0)}
                          </div>
                          <div className="mt-1">
                            <StatusBadge variant={badgeVariant}>
                              {formatStatusLabel(status)}
                            </StatusBadge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

