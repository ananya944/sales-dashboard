import React, { useState } from "react";
import type { ExtendedClient } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Users, Laptop, Shield, Receipt, FileCheck } from "lucide-react";

export function EmployeesTab({ client }: { client: ExtendedClient }) {
  const employees = client.employees ?? [];
  const [activeSubTab, setActiveSubTab] = useState("Details");

  const subTabs = [
    { id: "Details", label: "Details", icon: Users },
    { id: "Equipment", label: "Equipment", icon: Laptop },
    { id: "Insurance", label: "Insurance", icon: Shield },
    { id: "Reimbursements", label: "Reimbursements", icon: Receipt },
    { id: "BGV", label: "BGV", icon: FileCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs - separate from content box */}
      <div className="flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 w-full">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 flex-1 ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:text-slate-900"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === "Details" && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 pt-4 pb-4 mb-4">
            <h3 className="text-xl font-semibold">Employee Details</h3>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>

          <div className="overflow-x-auto px-6 pb-6">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[14.28%] text-left">Name</TableHead>
                  <TableHead className="w-[14.28%] text-left">Role</TableHead>
                  <TableHead className="w-[14.28%] text-left">Department</TableHead>
                  <TableHead className="w-[14.28%] text-left">Salary (INR)</TableHead>
                  <TableHead className="w-[14.28%] text-left">Start Date</TableHead>
                  <TableHead className="w-[14.28%] text-left">Status</TableHead>
                  <TableHead className="w-[14.28%] text-left">Billable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((e, i) => (
                  <TableRow key={i} className="h-14">
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.role}</TableCell>
                    <TableCell>{e.department}</TableCell>
                    <TableCell>₹{e.salaryInr.toLocaleString("en-IN")}</TableCell>
                    <TableCell>{e.startDate}</TableCell>
                    <TableCell>
                      <StatusBadge variant="active">active</StatusBadge>
                    </TableCell>
                    <TableCell>
                      {e.billable ? (
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          No
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeSubTab === "Equipment" && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 pt-4 pb-4 mb-4">
            <h3 className="text-xl font-semibold">Equipment Assignments</h3>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Assign Equipment
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Laptop className="h-16 w-16 text-slate-300 mb-4" strokeWidth={1.5} />
            <p className="text-slate-500 text-sm">No equipment assigned yet</p>
          </div>
        </div>
      )}

      {activeSubTab === "Insurance" && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 pt-4 pb-4 mb-4">
            <h3 className="text-xl font-semibold">Insurance Policies</h3>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Shield className="h-16 w-16 text-slate-300 mb-4" strokeWidth={1.5} />
            <p className="text-slate-500 text-sm">No insurance policies found</p>
          </div>
        </div>
      )}

      {activeSubTab === "Reimbursements" && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 pt-4 pb-4 mb-4">
            <h3 className="text-xl font-semibold">Reimbursements</h3>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Reimbursement
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Receipt className="h-16 w-16 text-slate-300 mb-4" strokeWidth={1.5} />
            <p className="text-slate-500 text-sm">No reimbursements found</p>
          </div>
        </div>
      )}

      {activeSubTab === "BGV" && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 pt-4 pb-4 mb-4">
            <h3 className="text-xl font-semibold">Background Verification</h3>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Initiate BGV
            </Button>
          </div>

          <div className="overflow-x-auto px-6 pb-6">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[14.28%] text-left">Employee</TableHead>
                  <TableHead className="w-[14.28%] text-left">Check Type</TableHead>
                  <TableHead className="w-[14.28%] text-left">Provider</TableHead>
                  <TableHead className="w-[14.28%] text-left">Initiated Date</TableHead>
                  <TableHead className="w-[14.28%] text-left">Completed Date</TableHead>
                  <TableHead className="w-[14.28%] text-left">Status</TableHead>
                  <TableHead className="w-[14.28%] text-left">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="h-14">
                  <TableCell className="font-medium">Mike Chen</TableCell>
                  <TableCell>Identity</TableCell>
                  <TableCell>AuthBridge</TableCell>
                  <TableCell>10/12/2023</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                      in_progress
                    </span>
                  </TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}


