export type ClientStatus = "active" | "onboarding" | "terminated" | "pending" | "draft";

export interface Subscription {
	id: string;
	name: string;
	planName: string;
	price: number; // cents or integer
	status: "active" | "paused" | "cancelled";
	createdDate: string;
	eorFee: number;
	billing: string;
	employees: number;
	monthlyPayroll: string;
	fxConfig: {
		baseRate: number;
		fxSpread: number;
		gstOnEorFee: boolean;
	};
	equipment: number;
	benefits: number;
}

export interface Client {
	id: string;
	name: string;
	salesSpoc: string;
	accountManager: string;
	clientAdmin: string;
	email: string;
	status: ClientStatus;
	mrr: string; // formatted string in mock data (e.g., "$1,200")
	subscriptions: Subscription[];
}

export interface ExtendedClient extends Client {
	address?: string;
	phone?: string;
	notes?: string;
	lastActivity?: string;
	total_employees?: number;
	invoices?: Array<{ id: string; amount: number; status: string }>;
	employees?: Array<{
		name: string;
		role: string;
		department: string;
		salaryInr: number;
		startDate: string; // ISO or dd/mm/yyyy
		status: ClientStatus | "inactive";
		billable: boolean;
	}>;
	created_at?: string;
	msa_status?: string | null;
	business_address?: string;
	business_city?: string;
	business_state?: string;
	business_postal_code?: string;
	// Onboarding status fields
	basic_info_status?: string | null;
	company_info_status?: string | null;
	compliance_status?: string | null;
	employee_added_status?: string | null;
	// Contact details fields
	contact_first_name?: string | null;
	contact_last_name?: string | null;
	contact_job_title?: string | null;
	// Company registration fields
	legal_name?: string | null;
	entity_type?: string | null;
	employee_count?: string | null;
	country_of_incorporation?: string | null;
	country?: string | null;
	external_client_id?: string | null;
	website?: string | null;
	industry?: string | null;
	description?: string | null;
	// Billing fields
	billing_currency?: string | null;
	billing_contact_name?: string | null;
	billing_contact_email?: string | null;
	// Compliance & Ownership fields
	business_activities_description?: string | null;
	Tax_certificate_url?: string | null;
	director_name?: string | null;
	beneficial_owner_1?: string | null;
	beneficial_owner_2?: string | null;
	has_25_ownership?: boolean | null;
	tax_registration_number?: string | null;
	// Tax & Compliance fields
	gst_status?: string | null;
	gstin?: string | null;
	gst_state?: string | null;
	withholding_percentage?: number | null;
	invoice_currency_preference?: string | null;
	// AP Contact fields
	primary_contact_name?: string | null;
	primary_contact_email?: string | null;
	additional_recipients?: string | null;
	// Payment Terms & Banking fields
	invoice_issue_date?: string | null;
	payment_due_date?: string | null;
	invoicing_frequency?: string | null;
	payment_method?: string | null;
	bank_account_holder?: string | null;
	bank_account_number?: string | null;
	bank_name?: string | null;
	bank_ifsc_code?: string | null;
	virtual_account_id?: string | null;
	// Document Management fields
	msa_document_url?: string | null;
	msa_signed_date?: string | null;
}
