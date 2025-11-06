import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Employee } from "@/services/employeeService";

interface EditEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  onUpdate: (data: any) => Promise<void>;
}

// Database constraint values - DO NOT CHANGE without updating database constraints
const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "consultant", label: "Consultant" }
];
const SENIORITY_OPTIONS = ["junior", "mid-level", "senior"];
const WORK_LOCATION_OPTIONS = ["remote", "office", "hybrid"];
const CURRENCY_OPTIONS = ["USD", "INR", "GBP", "EUR", "AUD", "CAD"];
const STATUS_OPTIONS = ["Active", "Onboarding", "Preboarding", "Invited", "Inactive"];

export function EditEmployeeModal({ open, onClose, employee, onUpdate }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    department: "",
    employment_type: "",
    start_date: "",
    seniority: "",
    work_location: "",
    salary: "",
    currency: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);

  // Populate form with employee data when modal opens
  useEffect(() => {
    if (open && employee) {
      setFormData({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        job_title: employee.job_title || "",
        department: employee.department || "",
        employment_type: employee.employment_type?.toLowerCase() || "",
        start_date: employee.start_date || "",
        seniority: employee.seniority?.toLowerCase() || "",
        work_location: employee.work_location?.toLowerCase() || "",
        salary: employee.salary?.toString() || "",
        currency: employee.currency || "INR",
        status: employee.status || "Active",
      });
    }
  }, [open, employee]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build update object with only non-empty fields
      // This avoids sending fields that might violate check constraints
      const submitData: any = {};
      
      if (formData.first_name) submitData.first_name = formData.first_name;
      if (formData.last_name) submitData.last_name = formData.last_name;
      if (formData.email) submitData.email = formData.email;
      if (formData.phone) submitData.phone = formData.phone;
      if (formData.job_title) submitData.job_title = formData.job_title;
      if (formData.department) submitData.department = formData.department;
      if (formData.employment_type) submitData.employment_type = formData.employment_type;
      if (formData.start_date) submitData.start_date = formData.start_date;
      if (formData.seniority) submitData.seniority = formData.seniority;
      if (formData.work_location) submitData.work_location = formData.work_location;
      if (formData.salary) submitData.salary = parseFloat(formData.salary);
      if (formData.currency) submitData.currency = formData.currency;
      if (formData.status) submitData.status = formData.status;
      
      // Log the exact data being sent to Supabase
      console.log('=== UPDATE EMPLOYEE DATA ===');
      console.log('Employee ID:', employee.id);
      console.log('Update Object:', submitData);
      console.log('Field Values:', {
        first_name: submitData.first_name,
        last_name: submitData.last_name,
        email: submitData.email,
        phone: submitData.phone,
        job_title: submitData.job_title,
        department: submitData.department,
        employment_type: submitData.employment_type,
        start_date: submitData.start_date,
        seniority: submitData.seniority,
        work_location: submitData.work_location,
        salary: submitData.salary,
        currency: submitData.currency,
        status: submitData.status,
      });
      console.log('Timestamp:', new Date().toISOString());
      console.log('============================');
      
      await onUpdate(submitData);
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Edit Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 text-slate-900">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <Input
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  type="tel"
                />
              </div>
            </div>
          </div>

          {/* Employment Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Job Title
                </label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => handleChange("job_title", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>
                <Input
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Employment Type
                </label>
                <Select value={formData.employment_type} onValueChange={(value) => handleChange("employment_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-blue-500 hover:text-white">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date
                </label>
                <Input
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  type="date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Seniority
                </label>
                <Select value={formData.seniority} onValueChange={(value) => handleChange("seniority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seniority" />
                  </SelectTrigger>
                  <SelectContent>
                    {SENIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} className="hover:bg-blue-500 hover:text-white">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Work Location
                </label>
                <Select value={formData.work_location} onValueChange={(value) => handleChange("work_location", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_LOCATION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} className="hover:bg-blue-500 hover:text-white">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Salary & Compensation Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Salary & Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Salary
                </label>
                <Input
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  type="number"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Currency
                </label>
                <Select value={formData.currency} onValueChange={(value) => handleChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} className="hover:bg-blue-500 hover:text-white">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Employment Status
                </label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} className="hover:bg-blue-500 hover:text-white">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

