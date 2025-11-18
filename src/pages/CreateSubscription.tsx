import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Pencil, Users, Check, ChevronDown } from "lucide-react";
import { getOrganizationById } from "@/services/organizationService";
import { getEmployeesByOrganization, type Employee } from "@/services/employeeService";
import { getProspectById } from "@/services/prospectService";

interface EmployeeWithEORFee extends Employee {
  individual_eor_fee?: number | null;
}

export default function CreateSubscription() {
  const { id: clientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sourcePage = location.state?.from || "clients";
  const fallbackPath =
    sourcePage === "prospects" ? "/prospects" : clientId ? `/clients/${clientId}` : "/clients";

  const confirmExit = () => window.confirm("Are you sure? Your changes will be lost.");
  const handleExit = () => {
    if (confirmExit()) {
      navigate(fallbackPath);
    }
  };
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [employees, setEmployees] = useState<EmployeeWithEORFee[]>([]);
  const [isProspect, setIsProspect] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedData, setEditedData] = useState({
    legalName: "",
    clientId: "",
    billingEmail: "",
    billingCurrency: "",
    invoiceCurrencyPreference: "",
    billingAddress: "",
  });

  // Fetch client and employee data on page load
  useEffect(() => {
    async function loadData() {
      if (!clientId) {
        setError("Client ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, try to fetch as client (organization)
        let orgData;
        let prospectData = null;
        let isProspectMode = false;

        try {
          orgData = await getOrganizationById(clientId);
          setIsProspect(false);
        } catch (orgError) {
          // If not found in organizations, try as prospect
          console.log("Not found in organizations, checking if prospect...");
          try {
            prospectData = await getProspectById(clientId);
            if (prospectData) {
              isProspectMode = true;
              setIsProspect(true);
              
              // Create orgData structure from prospect
              orgData = {
                id: clientId, // Use prospect ID temporarily
                name: prospectData.organization?.name || `${prospectData.first_name || ''} ${prospectData.last_name || ''}`.trim() || prospectData.email.split('@')[0],
                legal_name: prospectData.organization?.name || null,
                external_client_id: null,
                email: prospectData.email,
                billing_contact_email: prospectData.email,
                billing_currency: null,
                invoice_currency_preference: null,
                billing_street_address: prospectData.organization?.business_address || null,
                billing_city: prospectData.organization?.business_city || null,
                billing_state_province: prospectData.organization?.business_state || null,
                billing_postal_code: prospectData.organization?.business_postal_code || null,
                gst_status: null,
                gstin: null,
                virtual_account_id: null,
              };
            } else {
              throw new Error("Not found as client or prospect");
            }
          } catch (prospectError) {
            throw new Error("ID not found as client or prospect");
          }
        }
        
        // Combine billing address fields
        const billingAddress = [
          orgData.billing_street_address,
          orgData.billing_city,
          orgData.billing_state_province,
          orgData.billing_postal_code
        ].filter(Boolean).join(", ");

        // Set client data
        setClientData({
          legalName: orgData.legal_name || orgData.name || "-",
          clientId: orgData.external_client_id || "-",
          billingEmail: orgData.billing_contact_email || orgData.email || "-",
          billingCurrency: orgData.billing_currency || "INR",
          invoiceCurrencyPreference: orgData.invoice_currency_preference || "USD",
          billingAddress: billingAddress || "-",
          gstStatus: orgData.gst_status || "Not Applicable",
          gstNumber: orgData.gstin || "-",
          virtualAccount: orgData.virtual_account_id || "-",
        });

        // Set edited data for editing functionality
        setEditedData({
          legalName: orgData.legal_name || orgData.name || "",
          clientId: orgData.external_client_id || "",
          billingEmail: orgData.billing_contact_email || orgData.email || "",
          billingCurrency: orgData.billing_currency || "INR",
          invoiceCurrencyPreference: orgData.invoice_currency_preference || "USD",
          billingAddress: billingAddress || "",
        });

        // Fetch employees from employees table (only if it's a client, not a prospect)
        if (!isProspectMode) {
          try {
            const employeesData = await getEmployeesByOrganization(clientId);
            setEmployees(employeesData as EmployeeWithEORFee[]);
          } catch (empError) {
            // No employees found, set empty array
            setEmployees([]);
          }
        } else {
          // For prospects, no employees yet
          setEmployees([]);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [clientId]);

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleSave = (field: string) => {
    setEditingField(null);
    // Here you would typically save to backend
  };

  const handleCancel = (field: string) => {
    setEditingField(null);
    // Reset to original value
    if (clientData) {
      setEditedData({
        legalName: clientData.legalName,
        clientId: clientData.clientId,
        billingEmail: clientData.billingEmail,
        billingCurrency: clientData.billingCurrency,
        invoiceCurrencyPreference: clientData.invoiceCurrencyPreference,
        billingAddress: clientData.billingAddress,
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate total EOR fee
  const totalEorFee = employees.reduce((sum, emp) => {
    const eorFee = emp.individual_eor_fee || 0;
    return sum + (typeof eorFee === 'number' ? eorFee : 0);
  }, 0);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format salary for display
  const formatSalary = (salary: number | null) => {
    if (!salary) return "-";
    return `₹${salary.toLocaleString('en-IN')}`;
  };

  // Format EOR fee for display
  const formatEORFee = (fee: number | null | undefined) => {
    if (fee === null || fee === undefined) return "$0.00";
    return `$${fee.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading client and employee data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-slate-600 mb-4">{error || "Failed to load client data"}</p>
            <Button onClick={handleExit}>
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            onClick={handleExit}
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
                    <span className="text-sm font-medium text-slate-900">{editingField === "legalName" ? editedData.legalName : clientData.legalName}</span>
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
                    <span className="text-sm font-medium text-slate-900">{editingField === "clientId" ? editedData.clientId : clientData.clientId}</span>
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
                    <span className="text-sm font-medium text-slate-900">{editingField === "billingEmail" ? editedData.billingEmail : clientData.billingEmail}</span>
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
                    <span className="text-sm font-medium text-slate-900">{editingField === "billingCurrency" ? editedData.billingCurrency : clientData.billingCurrency}</span>
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
                  {clientData.gstNumber && clientData.gstNumber !== "-" && (
                    <span className="text-sm font-medium text-slate-900">{clientData.gstNumber}</span>
                  )}
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
                    <span className="text-sm font-medium text-slate-900">{editingField === "invoiceCurrencyPreference" ? editedData.invoiceCurrencyPreference : clientData.invoiceCurrencyPreference}</span>
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
                    <span className="text-sm font-medium text-slate-900">{editingField === "billingAddress" ? editedData.billingAddress : clientData.billingAddress}</span>
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
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                        No employees found for this client
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium text-slate-900 border-r border-slate-200">
                          {`${employee.first_name} ${employee.last_name}`.trim() || "-"}
                        </TableCell>
                        <TableCell className="text-slate-600 border-r border-slate-200">{employee.job_title || "-"}</TableCell>
                        <TableCell className="text-slate-900 border-r border-slate-200">{formatSalary(employee.salary)}</TableCell>
                        <TableCell className="text-slate-600 border-r border-slate-200">{formatDate(employee.start_date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900">{formatEORFee(employee.individual_eor_fee)}</span>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                              <Pencil className="h-1.5 w-1.5 text-slate-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {/* Total Row */}
                  {employees.length > 0 && (
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={4} className="text-right font-semibold text-slate-900">
                        Total EOR Fee:
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        ${totalEorFee.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )}
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
          onClick={handleExit}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() =>
            navigate(`/clients/${clientId}/new-subscription/step2`, {
              state: location.state,
            })
          }
        >
          Continue
        </Button>
      </div>
      </div>
    </div>
  );
}

