import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { addClient } from "@/services/addClientService";
import type { CreateOrganizationInput, EmployeeCountOption } from "@/types/organization";

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

const EMPLOYEE_COUNT_OPTIONS: Array<{ value: EmployeeCountOption; label: string }> = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-500", label: "201-500" },
  { value: "500+", label: "500+" },
];

type FormState = CreateOrganizationInput & Required<Pick<CreateOrganizationInput, "is_active">>;

const INITIAL_FORM_STATE: FormState = {
  name: "",
  legal_name: "",
  country: "",
  employee_count: "1-10",
  is_active: true,
  email: "",
  phone: "",
  website: "",
  business_address: "",
  business_city: "",
  business_state: "",
  business_postal_code: "",
  contact_first_name: "",
  contact_last_name: "",
  contact_job_title: "",
  industry: "",
  description: "",
};

export function AddClientModal({ open, onClose, onSuccess }: AddClientModalProps) {
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormState(INITIAL_FORM_STATE);
      setIsSubmitting(false);
    }
  }, [open]);

  const requiredFieldErrors = useMemo(() => {
    return {
      name: formState.name.trim() === "",
      legal_name: formState.legal_name.trim() === "",
      country: formState.country.trim() === "",
      employee_count: formState.employee_count.trim() === "",
    };
  }, [formState]);

  const handleFieldChange = <Key extends keyof FormState>(field: Key, value: FormState[Key]) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (Object.values(requiredFieldErrors).some(Boolean)) {
      toast({
        title: "Missing required information",
        description: "Please fill in organization name, legal name, country, and employee count.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addClient(formState);

      toast({
        title: "✅ Client added successfully",
      });

      await onSuccess?.();
      onClose();
    } catch (error: any) {
      const message = error?.message ?? "Please try again.";
      toast({
        title: "❌ Failed to add client",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canClose = !isSubmitting;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && canClose) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-900">
            Add New Client
          </DialogTitle>
          <DialogDescription>
            Provide the organization details below. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="space-y-4">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Organization Name *</Label>
                  <Input
                    id="client-name"
                    value={formState.name}
                    onChange={(event) => handleFieldChange("name", event.target.value)}
                    placeholder="Acme Inc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-legal-name">Legal Name *</Label>
                  <Input
                    id="client-legal-name"
                    value={formState.legal_name}
                    onChange={(event) => handleFieldChange("legal_name", event.target.value)}
                    placeholder="Acme Incorporated"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-country">Country *</Label>
                  <Input
                    id="client-country"
                    value={formState.country}
                    onChange={(event) => handleFieldChange("country", event.target.value)}
                    placeholder="United States"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Employee Count *</Label>
                  <Select
                    value={formState.employee_count}
                    onValueChange={(value) =>
                      handleFieldChange("employee_count", value as EmployeeCountOption)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_COUNT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-is-active" className="text-sm font-medium text-slate-700">
                    Active Status
                  </Label>
                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formState.is_active ? "Active" : "Inactive"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Toggle to enable or disable the organization.
                      </p>
                    </div>
                    <Switch
                      id="client-is-active"
                      checked={formState.is_active}
                      onCheckedChange={(checked) => handleFieldChange("is_active", checked)}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Contact & Communication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={formState.email ?? ""}
                    onChange={(event) => handleFieldChange("email", event.target.value)}
                    placeholder="contact@acme.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-phone">Phone</Label>
                  <Input
                    id="client-phone"
                    value={formState.phone ?? ""}
                    onChange={(event) => handleFieldChange("phone", event.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-website">Website</Label>
                  <Input
                    id="client-website"
                    value={formState.website ?? ""}
                    onChange={(event) => handleFieldChange("website", event.target.value)}
                    placeholder="https://www.acme.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-contact-first-name">Primary Contact First Name</Label>
                  <Input
                    id="client-contact-first-name"
                    value={formState.contact_first_name ?? ""}
                    onChange={(event) =>
                      handleFieldChange("contact_first_name", event.target.value)
                    }
                    placeholder="Jane"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-contact-last-name">Primary Contact Last Name</Label>
                  <Input
                    id="client-contact-last-name"
                    value={formState.contact_last_name ?? ""}
                    onChange={(event) =>
                      handleFieldChange("contact_last_name", event.target.value)
                    }
                    placeholder="Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-contact-title">Job Title</Label>
                  <Input
                    id="client-contact-title"
                    value={formState.contact_job_title ?? ""}
                    onChange={(event) =>
                      handleFieldChange("contact_job_title", event.target.value)
                    }
                    placeholder="Operations Manager"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Business Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="client-business-address">Street Address</Label>
                  <Input
                    id="client-business-address"
                    value={formState.business_address ?? ""}
                    onChange={(event) =>
                      handleFieldChange("business_address", event.target.value)
                    }
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-business-city">City</Label>
                  <Input
                    id="client-business-city"
                    value={formState.business_city ?? ""}
                    onChange={(event) =>
                      handleFieldChange("business_city", event.target.value)
                    }
                    placeholder="San Francisco"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-business-state">State / Province</Label>
                  <Input
                    id="client-business-state"
                    value={formState.business_state ?? ""}
                    onChange={(event) =>
                      handleFieldChange("business_state", event.target.value)
                    }
                    placeholder="California"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-business-postal-code">Postal Code</Label>
                  <Input
                    id="client-business-postal-code"
                    value={formState.business_postal_code ?? ""}
                    onChange={(event) =>
                      handleFieldChange("business_postal_code", event.target.value)
                    }
                    placeholder="94105"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-industry">Industry</Label>
                  <Input
                    id="client-industry"
                    value={formState.industry ?? ""}
                    onChange={(event) => handleFieldChange("industry", event.target.value)}
                    placeholder="Technology"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="client-description">Description</Label>
                  <Textarea
                    id="client-description"
                    value={formState.description ?? ""}
                    onChange={(event) =>
                      handleFieldChange("description", event.target.value)
                    }
                    placeholder="Brief description of the organization"
                    rows={4}
                  />
                </div>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={!canClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding Client..." : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

