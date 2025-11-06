import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizations: any[];
}

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" }
];

const SENIORITY_OPTIONS = ["junior", "mid-level", "senior"];
const WORK_LOCATION_OPTIONS = ["remote", "office", "hybrid"];
const CURRENCY_OPTIONS = ["INR", "USD", "EUR", "GBP", "CAD", "AUD"];
const STATUS_OPTIONS = ["Active", "Onboarding", "Preboarding", "Invited", "Inactive"];

export function AddEmployeeModal({ open, onClose, onSuccess, organizations }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    job_title: "",
    department: "",
    employment_type: "full-time",
    start_date: "",
    organization_id: "",
    pan_number: "",
    phone: "",
    salary: "",
    currency: "INR",
    status: "Active",
    seniority: "",
    work_location: "",
  });

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        employee_id: "",
        first_name: "",
        last_name: "",
        email: "",
        job_title: "",
        department: "",
        employment_type: "full-time",
        start_date: "",
        organization_id: "",
        pan_number: "",
        phone: "",
        salary: "",
        currency: "INR",
        status: "Active",
        seniority: "",
        work_location: "",
      });
      setSelectedDate(undefined);
    }
  }, [open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData((prev) => ({ ...prev, start_date: format(date, "yyyy-MM-dd") }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.employee_id || !formData.first_name || !formData.last_name || 
        !formData.email || !formData.job_title || !formData.department || 
        !formData.employment_type || !formData.start_date || !formData.organization_id) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      
      // Build insert object
      const insertData: any = {
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        job_title: formData.job_title,
        department: formData.department,
        employment_type: formData.employment_type,
        start_date: formData.start_date,
        organization_id: formData.organization_id,
        currency: formData.currency,
        status: formData.status,
      };

      // Add optional fields if provided
      if (formData.pan_number) insertData.pan_number = formData.pan_number;
      if (formData.phone) insertData.phone = formData.phone;
      if (formData.salary) insertData.salary = parseFloat(formData.salary);
      if (formData.seniority) insertData.seniority = formData.seniority;
      if (formData.work_location) insertData.work_location = formData.work_location;

      const { data, error } = await supabase
        .from('employees')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        throw error;
      }

      console.log('Employee created successfully:', data);
      
      // Show success toast
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "✅ Employee added successfully",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "❌ Failed to add employee",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Employee</DialogTitle>
          <DialogDescription>
            Fill in the employee information below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID *</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => handleChange("employee_id", e.target.value)}
                    placeholder="EMP001"
                    required
                    className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization_id">Organization *</Label>
                  <Select
                    value={formData.organization_id}
                    onValueChange={(value) => handleChange("organization_id", value)}
                  >
                    <SelectTrigger className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    placeholder="John"
                    required
                    className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    placeholder="Doe"
                    required
                    className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john.doe@company.com"
                    required
                    className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan_number">PAN Number</Label>
                  <Input
                    id="pan_number"
                    value={formData.pan_number}
                    onChange={(e) => handleChange("pan_number", e.target.value)}
                    placeholder="ABCDE1234F"
                    className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Job Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Job Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title *</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => handleChange("job_title", e.target.value)}
                    placeholder="Software Engineer"
                    required
                    className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    placeholder="Engineering"
                    required
                    className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment_type">Employment Type *</Label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={(value) => handleChange("employment_type", value)}
                  >
                    <SelectTrigger className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-gray-300 hover:border-gray-400 hover:bg-transparent focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        defaultMonth={selectedDate || new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seniority">Seniority</Label>
                  <Select
                    value={formData.seniority}
                    onValueChange={(value) => handleChange("seniority", value)}
                  >
                    <SelectTrigger className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors">
                      <SelectValue placeholder="Select seniority" />
                    </SelectTrigger>
                    <SelectContent>
                      {SENIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_location">Work Location</Label>
                  <Select
                    value={formData.work_location}
                    onValueChange={(value) => handleChange("work_location", value)}
                  >
                    <SelectTrigger className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors">
                      <SelectValue placeholder="Select work location" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_LOCATION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Compensation Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Compensation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleChange("salary", e.target.value)}
                    placeholder="50000"
                    className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleChange("currency", value)}
                  >
                    <SelectTrigger className="border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

