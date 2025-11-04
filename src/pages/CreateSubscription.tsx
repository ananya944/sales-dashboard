import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Pencil, Users, Check, ChevronDown } from "lucide-react";

export default function CreateSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedData, setEditedData] = useState({
    legalName: "Client CL-002",
    clientId: "CL-002",
    billingEmail: "billing@cl-002.com",
    billingCurrency: "INR",
    invoiceCurrencyPreference: "USD",
    billingAddress: "123 Business Street, Commercial District, City 10001",
  });

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleSave = (field: string) => {
    setEditingField(null);
    // Here you would typically save to backend
  };

  const handleCancel = (field: string) => {
    setEditingField(null);
    // Reset to original value if needed
  };

  const handleChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const clientData = {
    ...editedData,
    gstStatus: "Applicable",
    gstNumber: "29ABCDE1234F1Z5",
    virtualAccount: "VA123456789",
  };

  const employees = [
    {
      name: "Anjali Verma",
      role: "Team Lead",
      monthlySalary: "₹1,80,000",
      startDate: "10 Jan 2024",
      eorFee: "$200.00",
    },
    {
      name: "Rahul Joshi",
      role: "Data Scientist",
      monthlySalary: "₹1,40,000",
      startDate: "20 Feb 2024",
      eorFee: "$160.00",
    },
    {
      name: "Kavya Menon",
      role: "UX Designer",
      monthlySalary: "₹1,00,000",
      startDate: "05 Mar 2024",
      eorFee: "$135.00",
    },
  ];

  const totalEorFee = employees.reduce((sum, emp) => {
    return sum + parseFloat(emp.eorFee.replace("$", "").replace(",", ""));
  }, 0);

  return (
    <div className="mx-auto max-w-5xl px-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Create Subscription</h1>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => navigate(`/clients/${id}`)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Client & Employee Data Card */}
        <Card className="border border-slate-200 bg-white shadow-sm">
        <div className="p-5">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 pb-4 mb-4 border-b border-slate-200">
            {/* Step 1 - Active */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">
                1
              </div>
              <span className="mt-1.5 text-xs font-medium text-indigo-600">CLIENT DETAILS</span>
            </div>

            {/* Connector Line */}
            <div className="h-0.5 w-12 bg-slate-200"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">
                2
              </div>
              <span className="mt-1.5 text-xs font-medium text-slate-500">CREATE SUBSCRIPTION</span>
            </div>

            {/* Connector Line */}
            <div className="h-0.5 w-12 bg-slate-200"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">
                3
              </div>
              <span className="mt-1.5 text-xs font-medium text-slate-500">GENERATE INVOICE</span>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Client & Employee Data</h2>
            <p className="text-sm text-slate-500">
              Review and manage your client information and employee list
            </p>
          </div>

          {/* Client Information Section */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-base font-semibold text-slate-900 mb-3">Client Information</h3>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Row 1: Legal Name */}
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Legal Name</label>
                {editingField === "legalName" ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editedData.legalName}
                      onChange={(e) => handleChange("legalName", e.target.value)}
                      className="h-8 text-sm border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600" onClick={() => handleSave("legalName")}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => handleCancel("legalName")}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{clientData.legalName}</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleEdit("legalName")}>
                      <Pencil className="h-1.5 w-1.5 text-slate-500" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Row 1: Client ID */}
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Client ID</label>
                {editingField === "clientId" ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editedData.clientId}
                      onChange={(e) => handleChange("clientId", e.target.value)}
                      className="h-8 text-sm border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600" onClick={() => handleSave("clientId")}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => handleCancel("clientId")}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{clientData.clientId}</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleEdit("clientId")}>
                      <Pencil className="h-1.5 w-1.5 text-slate-500" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Row 1: Billing Email */}
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Billing Email</label>
                {editingField === "billingEmail" ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editedData.billingEmail}
                      onChange={(e) => handleChange("billingEmail", e.target.value)}
                      className="h-8 text-sm border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600" onClick={() => handleSave("billingEmail")}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => handleCancel("billingEmail")}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{clientData.billingEmail}</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleEdit("billingEmail")}>
                      <Pencil className="h-1.5 w-1.5 text-slate-500" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Row 2: Billing Currency */}
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Billing Currency</label>
                {editingField === "billingCurrency" ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editedData.billingCurrency}
                      onChange={(e) => handleChange("billingCurrency", e.target.value)}
                      className="h-8 text-sm border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600" onClick={() => handleSave("billingCurrency")}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => handleCancel("billingCurrency")}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{clientData.billingCurrency}</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleEdit("billingCurrency")}>
                      <Pencil className="h-1.5 w-1.5 text-slate-500" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Row 2: GST Status */}
              <div>
                <label className="text-sm text-slate-500 mb-1 block">GST Status</label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {clientData.gstStatus}
                  </span>
                  <span className="text-sm font-medium text-slate-900">{clientData.gstNumber}</span>
                </div>
              </div>

              {/* Row 2: Invoice Currency Preference */}
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Invoice Currency Preference</label>
                {editingField === "invoiceCurrencyPreference" ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editedData.invoiceCurrencyPreference}
                      onChange={(e) => handleChange("invoiceCurrencyPreference", e.target.value)}
                      className="h-8 text-sm border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600" onClick={() => handleSave("invoiceCurrencyPreference")}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => handleCancel("invoiceCurrencyPreference")}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{clientData.invoiceCurrencyPreference}</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleEdit("invoiceCurrencyPreference")}>
                      <Pencil className="h-1.5 w-1.5 text-slate-500" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Row 3: Billing Address */}
              <div className="col-span-2">
                <label className="text-sm text-slate-500 mb-1 block">Billing Address</label>
                {editingField === "billingAddress" ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editedData.billingAddress}
                      onChange={(e) => handleChange("billingAddress", e.target.value)}
                      className="h-8 text-sm border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 flex-1"
                    />
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600" onClick={() => handleSave("billingAddress")}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => handleCancel("billingAddress")}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{clientData.billingAddress}</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleEdit("billingAddress")}>
                      <Pencil className="h-1.5 w-1.5 text-slate-500" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Row 3: Virtual Account */}
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Virtual Account</label>
                <span className="text-sm font-medium text-slate-900">{clientData.virtualAccount}</span>
              </div>
            </div>
          </div>

          {/* Employees Section */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-500" />
                <h3 className="text-base font-semibold text-slate-900">Employees</h3>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                Total: {employees.length} employees
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left border-r border-slate-200">Name</TableHead>
                    <TableHead className="text-left border-r border-slate-200">Role</TableHead>
                    <TableHead className="text-left border-r border-slate-200">Monthly Salary (INR)</TableHead>
                    <TableHead className="text-left border-r border-slate-200">Start Date</TableHead>
                    <TableHead className="text-left">EOR Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-slate-900 border-r border-slate-200">{employee.name}</TableCell>
                      <TableCell className="text-slate-600 border-r border-slate-200">{employee.role}</TableCell>
                      <TableCell className="text-slate-900 border-r border-slate-200">{employee.monthlySalary}</TableCell>
                      <TableCell className="text-slate-600 border-r border-slate-200">{employee.startDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900">{employee.eorFee}</span>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <Pencil className="h-1.5 w-1.5 text-slate-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total Row */}
                  <TableRow className="bg-slate-50">
                    <TableCell colSpan={4} className="text-right font-semibold text-slate-900">
                      Total EOR Fee:
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      ${totalEorFee.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          className="border-slate-200 text-slate-600 hover:bg-slate-50"
          onClick={() => navigate(`/clients/${id}`)}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => navigate(`/clients/${id}/new-subscription/step2`)}
        >
          Continue
        </Button>
      </div>
      </div>
    </div>
  );
}

