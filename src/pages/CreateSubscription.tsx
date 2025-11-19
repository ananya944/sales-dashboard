import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { X, Pencil, Users, Check, ChevronDown, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { getOrganizationById } from "@/services/organizationService";
import { getEmployeesByOrganization, type Employee } from "@/services/employeeService";
import { getProspectById } from "@/services/prospectService";

interface EmployeeWithEORFee extends Employee {
  individual_eor_fee?: number | null;
  isNew?: boolean; // Flag to identify newly created employees
  billable?: boolean; // Billable status for subscription
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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState({
    legalName: "",
    clientId: "",
    billingEmail: "",
    billingCurrency: "",
    invoiceCurrencyPreference: "",
    billingAddress: "",
  });
  const [editedEorFee, setEditedEorFee] = useState<string>("");
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    name: "",
    role: "",
    monthlySalary: "",
    startDate: undefined as Date | undefined,
    eorFee: "",
  });
  const [actualClientId, setActualClientId] = useState<string | null>(null);

  const getStoredEmployees = (fallbackEmployees: EmployeeWithEORFee[]) => {
    if (!clientId) return fallbackEmployees;

    try {
      const stored = localStorage.getItem(`subscription_step1_${clientId}`);
      if (stored) {
        const parsed = JSON.parse(stored);

        if (parsed.actualClientId) {
          setActualClientId(parsed.actualClientId);
        }

        if (Array.isArray(parsed.fullEmployees) && parsed.fullEmployees.length > 0) {
          return parsed.fullEmployees as EmployeeWithEORFee[];
        }
      }
    } catch (error) {
      console.error("Error loading stored employees:", error);
    }

    return fallbackEmployees;
  };

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
        } catch (orgError) {
          // If not found in organizations, try as prospect
          console.log("Not found in organizations, checking if prospect...");
          try {
            prospectData = await getProspectById(clientId);
            if (prospectData) {
              isProspectMode = true;
              
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

        // Store actual client ID (will be set when prospect is converted)
        setActualClientId(isProspectMode ? null : clientId);

        // Fetch employees from employees table (only if it's a client, not a prospect)
        let fetchedEmployees: EmployeeWithEORFee[] = [];
        if (!isProspectMode) {
          try {
            const employeesData = await getEmployeesByOrganization(clientId);
            // Ensure billable is set (default to true if null/undefined)
            fetchedEmployees = employeesData.map(emp => ({
              ...emp,
              billable: emp.billable ?? true,
            })) as EmployeeWithEORFee[];
          } catch (empError) {
            // No employees found, keep empty array
            fetchedEmployees = [];
          }
        }

        const hydratedEmployees = getStoredEmployees(fetchedEmployees);
        setEmployees(hydratedEmployees);
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
    if (!clientData) return;
    
    // Initialize editedData with current value when starting to edit
    setEditedData((prev) => ({
      ...prev,
      [field]: clientData[field] || "",
    }));
    
    setEditingField(field);
  };

  const handleSave = (field: string) => {
    if (!clientData) return;
    
    // Update clientData with the edited value
    setClientData((prev: any) => ({
      ...prev,
      [field]: editedData[field as keyof typeof editedData],
    }));
    
    setEditingField(null);
  };

  const handleCancel = () => {
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

  const handleEditEorFee = (employeeId: string, currentFee: number | null | undefined) => {
    setEditingEmployeeId(employeeId);
    setEditedEorFee(currentFee !== null && currentFee !== undefined ? currentFee.toString() : "0");
  };

  const handleSaveEorFee = (employeeId: string) => {
    const feeValue = parseFloat(editedEorFee) || 0;
    
    // Update the employee's EOR fee in the employees state
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, individual_eor_fee: feeValue }
          : emp
      )
    );
    
    setEditingEmployeeId(null);
    setEditedEorFee("");
  };

  const handleCancelEorFee = () => {
    setEditingEmployeeId(null);
    setEditedEorFee("");
  };

  const handleAddEmployee = () => {
    // Validate required fields
    if (!newEmployeeForm.name.trim() || !newEmployeeForm.role.trim() || 
        !newEmployeeForm.monthlySalary.trim() || !newEmployeeForm.startDate || 
        !newEmployeeForm.eorFee.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    // Create a temporary employee object
    const nameParts = newEmployeeForm.name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const newEmployee: EmployeeWithEORFee = {
      id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
      employee_id: `TEMP-${Date.now()}`,
      first_name: firstName,
      last_name: lastName,
      email: "", // Will be set when saved
      phone: null,
      job_title: newEmployeeForm.role.trim(),
      department: "",
      employment_type: "full-time",
      salary: parseFloat(newEmployeeForm.monthlySalary) || 0,
      start_date: format(newEmployeeForm.startDate, "yyyy-MM-dd"),
      status: "Active",
      organization_id: actualClientId || clientId || "",
      currency: "INR",
      seniority: null,
      work_location: null,
      individual_eor_fee: parseFloat(newEmployeeForm.eorFee) || 0,
      isNew: true, // Mark as new employee
      billable: true, // New employees default to billable
    };

    // Add to employees list
    setEmployees((prev) => [...prev, newEmployee]);

    // Reset form
    setNewEmployeeForm({
      name: "",
      role: "",
      monthlySalary: "",
      startDate: undefined,
      eorFee: "",
    });
    setShowAddEmployeeForm(false);
  };

  const handleCancelAddEmployee = () => {
    setNewEmployeeForm({
      name: "",
      role: "",
      monthlySalary: "",
      startDate: undefined,
      eorFee: "",
    });
    setShowAddEmployeeForm(false);
  };

  const handleRemoveNewEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
  };

  const handleToggleBillable = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, billable: !emp.billable }
          : emp
      )
    );
  };

  const handleContinue = () => {
    if (!clientId) return;

    const employeeSummary = employees.map((emp) => ({
      id: emp.id,
      name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.email || "-",
      role: emp.job_title || "-",
      salaryInr: emp.salary || 0,
      startDate: emp.start_date || null,
      eorFee: typeof emp.individual_eor_fee === "number" ? emp.individual_eor_fee : 0,
      isNew: emp.isNew || false, // Include flag for Step 3
      billable: emp.billable !== false, // Include billable status (default to true)
    }));

    const billableEmployeeCount = employeeSummary.filter(emp => emp.billable !== false).length;

    const step1Data = {
      employees: employeeSummary,
      totals: {
        employeeCount: billableEmployeeCount,
        monthlyPayrollInr: totalMonthlyPayroll,
        monthlyEorFeeUsd: totalEorFee,
      },
      actualClientId: actualClientId || clientId, // Store actual client ID
      fullEmployees: employees,
    };

    localStorage.setItem(`subscription_step1_${clientId}`, JSON.stringify(step1Data));

    navigate(`/clients/${clientId}/new-subscription/step2`, {
      state: location.state,
    });
  };

  const handleChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate totals - only include billable employees
  const totalEorFee = employees.reduce((sum, emp) => {
    if (emp.billable !== false) { // Include if billable is true or null/undefined (default to true)
      const eorFee = emp.individual_eor_fee || 0;
      return sum + (typeof eorFee === 'number' ? eorFee : 0);
    }
    return sum;
  }, 0);

  const totalMonthlyPayroll = employees.reduce((sum, emp) => {
    if (emp.billable !== false) {
      return sum + (emp.salary || 0);
    }
    return sum;
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
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={handleCancel}>
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
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={handleCancel}>
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
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={handleCancel}>
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
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={handleCancel}>
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
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={handleCancel}>
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
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={handleCancel}>
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
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  Total: {employees.length} employees
                </span>
                {employees.length === 0 && !showAddEmployeeForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => setShowAddEmployeeForm(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Employee
                  </Button>
                )}
              </div>
            </div>

            {/* Add Employee Form */}
            {showAddEmployeeForm && (
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Add New Employee</h4>
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Employee Name *</label>
                    <Input
                      value={newEmployeeForm.name}
                      onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Role/Job Title *</label>
                    <Input
                      value={newEmployeeForm.role}
                      onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Software Engineer"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Monthly Salary (INR) *</label>
                    <Input
                      type="number"
                      value={newEmployeeForm.monthlySalary}
                      onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, monthlySalary: e.target.value }))}
                      placeholder="50000"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Start Date *</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-full text-sm justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-3.5 w-3.5" />
                          {newEmployeeForm.startDate ? format(newEmployeeForm.startDate, "dd/MM/yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={newEmployeeForm.startDate}
                          onSelect={(date) => setNewEmployeeForm(prev => ({ ...prev, startDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Individual EOR Fee (USD) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newEmployeeForm.eorFee}
                      onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, eorFee: e.target.value }))}
                      placeholder="50.00"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={handleCancelAddEmployee}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleAddEmployee}
                  >
                    Save Employee
                  </Button>
                </div>
              </div>
            )}

            {/* Add Employee Button (when employees exist) */}
            {employees.length > 0 && !showAddEmployeeForm && (
              <div className="mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => setShowAddEmployeeForm(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Employee
                </Button>
              </div>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left border-r border-slate-200">Name</TableHead>
                    <TableHead className="text-left border-r border-slate-200">Role</TableHead>
                    <TableHead className="text-left border-r border-slate-200">Monthly Salary (INR)</TableHead>
                    <TableHead className="text-left border-r border-slate-200">Start Date</TableHead>
                    <TableHead className="text-left border-r border-slate-200">EOR Fee</TableHead>
                    <TableHead className="text-left border-r border-slate-200">Billable</TableHead>
                    {employees.some(emp => emp.id.startsWith('temp-')) && (
                      <TableHead className="text-left w-20">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 && !showAddEmployeeForm ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                        No employees found for this client
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => {
                      const isNewEmployee = employee.id.startsWith('temp-');
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium text-slate-900 border-r border-slate-200">
                            {`${employee.first_name} ${employee.last_name}`.trim() || "-"}
                          </TableCell>
                          <TableCell className="text-slate-600 border-r border-slate-200">{employee.job_title || "-"}</TableCell>
                          <TableCell className="text-slate-900 border-r border-slate-200">{formatSalary(employee.salary)}</TableCell>
                          <TableCell className="text-slate-600 border-r border-slate-200">{formatDate(employee.start_date)}</TableCell>
                          <TableCell className="border-r border-slate-200">
                            {editingEmployeeId === employee.id ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editedEorFee}
                                  onChange={(e) => setEditedEorFee(e.target.value)}
                                  className="h-8 w-24 text-sm border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="0.00"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 text-green-600" 
                                  onClick={() => handleSaveEorFee(employee.id)}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 text-red-600" 
                                  onClick={handleCancelEorFee}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-900">{formatEORFee(employee.individual_eor_fee)}</span>
                                {!isNewEmployee && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-5 w-5 p-0" 
                                    onClick={() => handleEditEorFee(employee.id, employee.individual_eor_fee)}
                                  >
                                    <Pencil className="h-1.5 w-1.5 text-slate-500" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className={isNewEmployee ? "border-r border-slate-200" : ""}>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={employee.billable !== false}
                                onChange={() => handleToggleBillable(employee.id)}
                                className="h-4 w-4 rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500"
                              />
                            </div>
                          </TableCell>
                          {isNewEmployee && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                onClick={() => handleRemoveNewEmployee(employee.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                  {/* Total Row */}
                  {employees.length > 0 && (
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={employees.some(emp => emp.id.startsWith('temp-')) ? 5 : 5} className="text-right font-semibold text-slate-900">
                        Total EOR Fee:
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900" colSpan={employees.some(emp => emp.id.startsWith('temp-')) ? 3 : 2}>
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
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
      </div>
    </div>
  );
}

