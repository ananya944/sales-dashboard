import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, FileText, DollarSign, TrendingUp, Clock, Eye, Download, ChevronDown, AlertCircle } from "lucide-react";

// Mock invoice data
const mockInvoices = [
  {
    id: "INV-GLOBAL-002",
    client: "Global Solutions Ltd",
    issueDate: "15/01/2024",
    dueDate: "30/01/2024",
    amount: 32000,
    tax: 1600,
    total: 33600,
    status: "draft",
    currency: "USD",
  },
  {
    id: "INV-ACME-001",
    client: "Acme Corporation",
    issueDate: "01/01/2024",
    dueDate: "31/01/2024",
    amount: 45000,
    tax: 8100,
    total: 53100,
    status: "paid",
    currency: "USD",
  },
  {
    id: "INV-TECH-001",
    client: "TechStart Inc",
    issueDate: "01/01/2024",
    dueDate: "15/01/2024",
    amount: 28000,
    tax: 5040,
    total: 33040,
    status: "sent",
    currency: "USD",
  },
  {
    id: "INV-GLOBAL-003",
    client: "Global Solutions Ltd",
    issueDate: "01/01/2024",
    dueDate: "16/01/2024",
    amount: 32000,
    tax: 1600,
    total: 33600,
    status: "sent",
    currency: "USD",
  },
  {
    id: "INV-GLOBAL-001",
    client: "Global Solutions Ltd",
    issueDate: "15/12/2023",
    dueDate: "30/12/2023",
    amount: 32000,
    tax: 1600,
    total: 33600,
    status: "paid",
    currency: "USD",
  },
  {
    id: "INV-TECH-002",
    client: "TechStart Inc",
    issueDate: "01/12/2023",
    dueDate: "15/12/2023",
    amount: 28000,
    tax: 5040,
    total: 33040,
    status: "overdue",
    currency: "USD",
  },
  {
    id: "INV-INNOV-002",
    client: "InnovateCorp",
    issueDate: "01/11/2023",
    dueDate: "25/11/2023",
    amount: 15000,
    tax: 0,
    total: 15000,
    status: "cancelled",
    currency: "USD",
  },
  {
    id: "INV-INNOV-001",
    client: "InnovateCorp",
    issueDate: "01/10/2023",
    dueDate: "25/10/2023",
    amount: 45000,
    tax: 0,
    total: 45000,
    status: "paid",
    currency: "USD",
  },
];

const statusOptions = ["All Status", "Draft", "Sent", "Paid", "Overdue", "Cancelled"];

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Calculate summary metrics
  const totalInvoices = mockInvoices.length;
  const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const outstandingAmount = mockInvoices
    .filter(inv => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0);
  const overdueCount = mockInvoices.filter(inv => inv.status === "overdue").length;

  // Filter invoices
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === "All Status" || 
      invoice.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return `${currency} ${amount.toLocaleString('en-US')}`;
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
      case "cancelled":
        return "draft";
      default:
        return "draft";
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
            <div className="text-xl font-bold text-slate-900">{totalInvoices}</div>
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
            <div className="text-xl font-bold text-slate-900">${totalAmount.toLocaleString('en-US')}</div>
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
            <div className="text-xl font-bold text-slate-900">${outstandingAmount.toLocaleString('en-US')}</div>
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
            <div className="text-xl font-bold text-slate-900">{overdueCount}</div>
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
                  {statusFilter}
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
                    {status}
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
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs text-right">Amount</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs text-right">Tax</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs text-right">Total</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Status</TableHead>
                  <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow className="h-12">
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow 
                      key={invoice.id} 
                      className="cursor-pointer hover:bg-slate-50 h-12 transition-colors"
                    >
                      <TableCell className="py-2 px-4 text-slate-900 text-xs">
                        {invoice.id}
                      </TableCell>
                      <TableCell className="py-2 px-4 font-semibold text-slate-900 text-xs">
                        {invoice.client}
                      </TableCell>
                      <TableCell className="py-2 px-4 text-slate-600 text-xs">
                        {invoice.issueDate}
                      </TableCell>
                      <TableCell className="py-2 px-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1">
                          {invoice.dueDate}
                          {invoice.status === "overdue" && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4 text-slate-600 text-xs text-right">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </TableCell>
                      <TableCell className="py-2 px-4 text-slate-600 text-xs text-right">
                        {formatCurrency(invoice.tax, invoice.currency)}
                      </TableCell>
                      <TableCell className="py-2 px-4 font-semibold text-slate-900 text-xs text-right">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <StatusBadge variant={getStatusVariant(invoice.status)}>
                          {invoice.status}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
