export type EmployeeCountOption = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export interface CreateOrganizationInput {
  name: string;
  legal_name: string;
  country: string;
  employee_count: EmployeeCountOption;
  is_active?: boolean;
  email?: string;
  phone?: string;
  website?: string;
  business_address?: string;
  business_city?: string;
  business_state?: string;
  business_postal_code?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_job_title?: string;
  industry?: string;
  description?: string;
}

