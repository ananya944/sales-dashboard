import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { ExtendedClient } from "@/types/client";

interface EditClientModalProps {
  open: boolean;
  onClose: () => void;
  client: ExtendedClient;
  onUpdate: (data: any) => Promise<void>;
}

const EMPLOYEE_COUNT_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+"
];

const GST_STATUS_OPTIONS = ["GST Applicable", "Not Applicable"];
const CURRENCY_OPTIONS = ["USD", "INR", "GBP", "EUR", "AUD", "CAD"];
const INVOICING_FREQUENCY_OPTIONS = ["Monthly", "Quarterly", "Annually"];
const PAYMENT_METHOD_OPTIONS = ["Bank Transfer", "Wire Transfer", "SEPA Transfer"];

export function EditClientModal({ open, onClose, client, onUpdate }: EditClientModalProps) {
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    legal_name: "",
    country: "",
    employee_count: "",
    website: "",
    industry: "",
    description: "",
    // Contact Information
    contact_first_name: "",
    contact_last_name: "",
    contact_job_title: "",
    email: "",
    phone: "",
    // Business Address
    business_address: "",
    business_city: "",
    business_state: "",
    business_postal_code: "",
    // Tax & Compliance
    gst_status: "",
    gstin: "",
    gst_state: "",
    withholding_percentage: "",
    tax_registration_number: "",
    invoice_currency_preference: "",
    // Banking Details
    invoice_issue_date: "",
    payment_due_date: "",
    invoicing_frequency: "",
    payment_method: "",
    bank_account_holder: "",
    bank_account_number: "",
    bank_name: "",
    bank_ifsc_code: "",
    virtual_account_id: "",
    // Company Details
    entity_type: "",
    country_of_incorporation: "",
    director_name: "",
    has_25_ownership: false,
    beneficial_owner_1: "",
    beneficial_owner_2: "",
  });

  const [loading, setLoading] = useState(false);

  // Populate form with client data when modal opens
  useEffect(() => {
    if (open && client) {
      setFormData({
        name: client.name || "",
        legal_name: client.legal_name || "",
        country: client.country || "",
        employee_count: client.employee_count || "",
        website: client.website || "",
        industry: client.industry || "",
        description: client.description || "",
        contact_first_name: client.contact_first_name || "",
        contact_last_name: client.contact_last_name || "",
        contact_job_title: client.contact_job_title || "",
        email: client.email || "",
        phone: client.phone || "",
        business_address: client.business_address || "",
        business_city: client.business_city || "",
        business_state: client.business_state || "",
        business_postal_code: client.business_postal_code || "",
        gst_status: client.gst_status || "",
        gstin: client.gstin || "",
        gst_state: client.gst_state || "",
        withholding_percentage: client.withholding_percentage?.toString() || "",
        tax_registration_number: client.tax_registration_number || "",
        invoice_currency_preference: client.invoice_currency_preference || "",
        invoice_issue_date: client.invoice_issue_date || "",
        payment_due_date: client.payment_due_date || "",
        invoicing_frequency: client.invoicing_frequency || "",
        payment_method: client.payment_method || "",
        bank_account_holder: client.bank_account_holder || "",
        bank_account_number: client.bank_account_number || "",
        bank_name: client.bank_name || "",
        bank_ifsc_code: client.bank_ifsc_code || "",
        virtual_account_id: client.virtual_account_id || "",
        entity_type: client.entity_type || "",
        country_of_incorporation: client.country_of_incorporation || "",
        director_name: client.director_name || "",
        has_25_ownership: client.has_25_ownership || false,
        beneficial_owner_1: client.beneficial_owner_1 || "",
        beneficial_owner_2: client.beneficial_owner_2 || "",
      });
    }
  }, [open, client]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert withholding_percentage to number if it exists
      const submitData = {
        ...formData,
        withholding_percentage: formData.withholding_percentage 
          ? parseFloat(formData.withholding_percentage) 
          : null,
      };
      await onUpdate(submitData);
      onClose();
    } catch (error) {
      console.error("Error updating client:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Edit Client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 text-slate-900">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Legal Name
                </label>
                <Input
                  value={formData.legal_name}
                  onChange={(e) => handleChange("legal_name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Employee Count
                </label>
                <Select value={formData.employee_count} onValueChange={(value) => handleChange("employee_count", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_COUNT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Website
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  type="url"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Industry
                </label>
                <Input
                  value={formData.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  placeholder="Brief description about the client..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contact First Name
                </label>
                <Input
                  value={formData.contact_first_name}
                  onChange={(e) => handleChange("contact_first_name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contact Last Name
                </label>
                <Input
                  value={formData.contact_last_name}
                  onChange={(e) => handleChange("contact_last_name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contact Job Title
                </label>
                <Input
                  value={formData.contact_job_title}
                  onChange={(e) => handleChange("contact_job_title", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  type="email"
                  required
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

          {/* Business Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Business Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Business Address
                </label>
                <Input
                  value={formData.business_address}
                  onChange={(e) => handleChange("business_address", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Business City
                </label>
                <Input
                  value={formData.business_city}
                  onChange={(e) => handleChange("business_city", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Business State
                </label>
                <Input
                  value={formData.business_state}
                  onChange={(e) => handleChange("business_state", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Business Postal Code
                </label>
                <Input
                  value={formData.business_postal_code}
                  onChange={(e) => handleChange("business_postal_code", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tax & Compliance Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Tax & Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  GST Status
                </label>
                <Select value={formData.gst_status} onValueChange={(value) => handleChange("gst_status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GST status" />
                  </SelectTrigger>
                  <SelectContent>
                    {GST_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  GSTIN
                </label>
                <Input
                  value={formData.gstin}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  GST State
                </label>
                <Input
                  value={formData.gst_state}
                  onChange={(e) => handleChange("gst_state", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Withholding Percentage
                </label>
                <div className="relative">
                  <Input
                    value={formData.withholding_percentage}
                    onChange={(e) => handleChange("withholding_percentage", e.target.value)}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tax Registration Number
                </label>
                <Input
                  value={formData.tax_registration_number}
                  onChange={(e) => handleChange("tax_registration_number", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Invoice Currency Preference
                </label>
                <Select value={formData.invoice_currency_preference} onValueChange={(value) => handleChange("invoice_currency_preference", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
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

          {/* Banking Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Banking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Invoice Issue Date
                </label>
                <Input
                  value={formData.invoice_issue_date}
                  onChange={(e) => handleChange("invoice_issue_date", e.target.value)}
                  placeholder="e.g., 1st of every month"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Due Date
                </label>
                <Input
                  value={formData.payment_due_date}
                  onChange={(e) => handleChange("payment_due_date", e.target.value)}
                  placeholder="e.g., 15th of every month"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Invoicing Frequency
                </label>
                <Select value={formData.invoicing_frequency} onValueChange={(value) => handleChange("invoicing_frequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICING_FREQUENCY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Method
                </label>
                <Select value={formData.payment_method} onValueChange={(value) => handleChange("payment_method", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bank Account Holder
                </label>
                <Input
                  value={formData.bank_account_holder}
                  onChange={(e) => handleChange("bank_account_holder", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bank Account Number
                </label>
                <Input
                  value={formData.bank_account_number}
                  onChange={(e) => handleChange("bank_account_number", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bank Name
                </label>
                <Input
                  value={formData.bank_name}
                  onChange={(e) => handleChange("bank_name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  IFSC/SWIFT Code
                </label>
                <Input
                  value={formData.bank_ifsc_code}
                  onChange={(e) => handleChange("bank_ifsc_code", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Virtual Account ID
                </label>
                <Input
                  value={formData.virtual_account_id}
                  onChange={(e) => handleChange("virtual_account_id", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Company Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Entity Type
                </label>
                <Input
                  value={formData.entity_type}
                  onChange={(e) => handleChange("entity_type", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country of Incorporation
                </label>
                <Input
                  value={formData.country_of_incorporation}
                  onChange={(e) => handleChange("country_of_incorporation", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Director Name
                </label>
                <Input
                  value={formData.director_name}
                  onChange={(e) => handleChange("director_name", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="has_25_ownership"
                  checked={formData.has_25_ownership}
                  onCheckedChange={(checked) => handleChange("has_25_ownership", checked as boolean)}
                />
                <label htmlFor="has_25_ownership" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Has 25% Ownership
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Beneficial Owner 1
                </label>
                <Input
                  value={formData.beneficial_owner_1}
                  onChange={(e) => handleChange("beneficial_owner_1", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Beneficial Owner 2
                </label>
                <Input
                  value={formData.beneficial_owner_2}
                  onChange={(e) => handleChange("beneficial_owner_2", e.target.value)}
                />
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

