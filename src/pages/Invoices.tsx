import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, FileText, DollarSign, TrendingUp, Clock, Eye, Download, ChevronDown, AlertCircle } from "lucide-react";
import { getAllInvoices, type Invoice } from "@/services/invoiceService";

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toNumber = (value: number | string | null | undefined) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllInvoices();
        setInvoices(data);
      } catch (err) {
        console.error("Failed to load invoices:", err);
        setError(err instanceof Error ? err.message : "Unable to load invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const statusOptions = useMemo(() => {
    const uniqueStatuses = new Set<string>();
    invoices.forEach((invoice) => {
      if (invoice.status) {
        uniqueStatuses.add(invoice.status);
      }
    });
    return ["All Status", ...Array.from(uniqueStatuses).sort((a, b) => a.localeCompare(b))];
  }, [invoices]);

  // Calculate summary metrics
  const { totalInvoices, totalAmount, outstandingAmount, overdueCount } = useMemo(() => {
    const totalInvoicesCount = invoices.length;
    const totalAmountSum = invoices.reduce((sum, inv) => sum + toNumber(inv.amount), 0);
    const outstandingAmountSum = invoices
      .filter((inv) => {
        const status = inv.status?.toLowerCase();
        return status === "sent" || status === "overdue";
      })
      .reduce((sum, inv) => sum + toNumber(inv.amount), 0);
    const overdue = invoices.filter((inv) => inv.status?.toLowerCase() === "overdue").length;

    return {
      totalInvoices: totalInvoicesCount,
      totalAmount: totalAmountSum,
      outstandingAmount: outstandingAmountSum,
      overdueCount: overdue,
    };
  }, [invoices]);

  const summaryCurrency = invoices[0]?.currency || "USD";

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoice_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.org_legal_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" ||
        invoice.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);
  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatStatusText = (status: string) => {
    if (!status) return "Unknown";
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/(^|\s)\w/g, (char) => char.toUpperCase());
  };

  // Helper function to get status variant
  const getStatusVariant = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case "paid":
        return "active";
      case "sent":
        return "pending";
      case "overdue":
        return "terminated";
      case "draft":
        return "draft";
      case "cancelled":
        return "draft";
      default:
        return "pending";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">
            Manage and track all client invoices
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3">
          <Plus className="h-3 w-3 mr-1.5" />
          New Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Invoices */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Total Invoices</CardTitle>
              <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">{loading ? "—" : totalInvoices}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        {/* Total Amount */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Total Amount</CardTitle>
              <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                <DollarSign className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">
              {loading ? "—" : formatCurrency(totalAmount, summaryCurrency)}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        {/* Outstanding */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Outstanding</CardTitle>
              <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">
              {loading ? "—" : formatCurrency(outstandingAmount, summaryCurrency)}
            </div>
            <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
              <span className="rotate-180 inline-block">
                <TrendingUp className="h-3 w-3" />
              </span>
              -5% from last month
            </p>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Overdue</CardTitle>
              <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-slate-900">{loading ? "—" : overdueCount}</div>
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <span className="rotate-180 inline-block">
                <TrendingUp className="h-3 w-3" />
              </span>
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* All Invoices Section */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-slate-700" />
            <CardTitle className="text-lg font-semibold text-slate-900">All Invoices</CardTitle>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none shrink-0" />
              <Input 
                placeholder="Search invoices or clients..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-10 relative z-0 h-9 text-sm" 
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 text-sm">
                  {statusFilter === "All Status" ? statusFilter : formatStatusText(statusFilter)}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                {statusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className="cursor-pointer text-sm"
                  >
                    {status === "All Status" ? status : formatStatusText(status)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Invoices Table */}
          <div className="overflow-x-auto border-t border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="h-10 bg-slate-50">
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Invoice Number</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Client</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Issue Date</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Due Date</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs text-right">Base Amount</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs text-right">Tax</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs text-right">Total</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Status</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="h-12">
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      Loading invoices...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow className="h-12">
                    <TableCell colSpan={9} className="text-center py-8 text-red-500 text-sm">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow className="h-12">
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const baseAmount = Math.max(
                      0,
                      toNumber(invoice.amount) - toNumber(invoice.tax_amount)
                    );
                    const currency = invoice.currency || "USD";
                    const issueDate = invoice.date
                      ? new Date(invoice.date).toLocaleDateString("en-GB")
                      : "—";
                    const dueDate = invoice.due_date
                      ? new Date(invoice.due_date).toLocaleDateString("en-GB")
                      : "—";
                    const statusLabel = invoice.status || "Unknown";

                    return (
                    <TableRow 
                      key={invoice.invoice_id} 
                      className="cursor-pointer hover:bg-slate-50 h-12 transition-colors"
                    >
                      <TableCell className="py-2 px-4 text-slate-900 text-xs">
                        {invoice.invoice_id}
                      </TableCell>
                      <TableCell className="py-2 px-4 font-semibold text-slate-900 text-xs">
                        {invoice.org_legal_name}
                      </TableCell>
                      <TableCell className="py-2 px-4 text-slate-600 text-xs">
                        {issueDate}
                      </TableCell>
                      <TableCell className="py-2 px-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1">
                          {dueDate}
                          {statusLabel.toLowerCase() === "overdue" && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4 text-slate-600 text-xs text-right">
                        {formatCurrency(baseAmount, currency)}
                      </TableCell>
                      <TableCell className="py-2 px-4 text-slate-600 text-xs text-right">
                        {formatCurrency(toNumber(invoice.tax_amount), currency)}
                      </TableCell>
                      <TableCell className="py-2 px-4 font-semibold text-slate-900 text-xs text-right">
                        {formatCurrency(toNumber(invoice.amount), currency)}
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <StatusBadge variant={getStatusVariant(statusLabel)}>
                          {formatStatusText(statusLabel)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Eye className="h-3 w-3 text-slate-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Download className="h-3 w-3 text-slate-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
