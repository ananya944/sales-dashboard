import React from "react";
import type { ExtendedClient } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Eye, Download, AlertCircle } from "lucide-react";

export function InvoicesTab({ client }: { client: ExtendedClient }) {
  const invoices = [
    {
      invoiceNumber: "INV-TECH-001",
      issueDate: "01/01/2024",
      dueDate: "15/01/2024",
      amount: "USD 28,000",
      tax: "USD 5,040",
      total: "USD 33,040",
      status: "sent",
      isOverdue: false,
    },
    {
      invoiceNumber: "INV-TECH-002",
      issueDate: "01/12/2023",
      dueDate: "15/12/2023",
      amount: "USD 28,000",
      tax: "USD 5,040",
      total: "USD 33,040",
      status: "overdue",
      isOverdue: true,
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 pt-4 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h3 className="text-xl font-semibold">Invoice History</h3>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="overflow-x-auto px-6 pb-6">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[12.5%] text-left whitespace-nowrap">Invoice Number</TableHead>
              <TableHead className="w-[12.5%] text-left">Issue Date</TableHead>
              <TableHead className="w-[12.5%] text-left">Due Date</TableHead>
              <TableHead className="w-[12.5%] text-left">Amount</TableHead>
              <TableHead className="w-[12.5%] text-left">Tax</TableHead>
              <TableHead className="w-[12.5%] text-left">Total</TableHead>
              <TableHead className="w-[12.5%] text-left">Status</TableHead>
              <TableHead className="w-[12.5%] text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice, i) => (
              <TableRow key={i} className="h-14">
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.issueDate}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {invoice.dueDate}
                    {invoice.isOverdue && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{invoice.amount}</TableCell>
                <TableCell>{invoice.tax}</TableCell>
                <TableCell className="font-semibold">{invoice.total}</TableCell>
                <TableCell>
                  {invoice.status === "sent" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                      sent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                      overdue
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <button className="text-slate-600 hover:text-slate-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-slate-600 hover:text-slate-900">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


