import React, { useMemo } from "react";
import type { ExtendedClient } from "@/types/client";
import { UserRound, FileText, Building2, ShieldCheck, FileSignature, Users, Check, CheckCircle, MapPin, Mail, CreditCard, Folder, ExternalLink, Copy } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";

export function OverviewTab({ client }: { client: ExtendedClient }) {
  const { toast } = useToast();

  // Format created_at date to DD/MM/YYYY
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Copy bank details to clipboard
  const copyBankDetails = async () => {
    const bankDetails = `Account Holder: ${client.bank_account_holder || '-'}
Account Number: ${client.bank_account_number || '-'}
Bank Name: ${client.bank_name || '-'}
IFSC Code: ${client.bank_ifsc_code || '-'}
Virtual Account: ${client.virtual_account_id || '-'}`;

    try {
      await navigator.clipboard.writeText(bankDetails);
      toast({
        title: "✅ Bank details copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "❌ Failed to copy",
        variant: "destructive",
      });
    }
  };

  const steps = useMemo(
    () => [
      {
        title: "User Profile Created",
        description: "Basic account setup completed",
        meta: formatDate(client.created_at),
        completed: true,
        Icon: UserRound,
      },
      {
        title: "Basic Information Completed",
        description: "Personal and contact details provided",
        meta: client.basic_info_status === "completed" ? "Completed" : "Pending",
        completed: client.basic_info_status === "completed",
        Icon: FileText,
      },
      {
        title: "Company Profile Completed",
        description: "Company information and details added",
        meta: client.company_info_status === "completed" ? "Completed" : "Pending",
        completed: client.company_info_status === "completed",
        Icon: Building2,
      },
      {
        title: "Compliance Declarations Completed",
        description: "Legal and compliance requirements met",
        meta: client.compliance_status === "completed" ? "Completed" : "Pending",
        completed: client.compliance_status === "completed",
        Icon: ShieldCheck,
      },
      {
        title: "MSA Signed",
        description: "Master Service Agreement executed",
        meta: client.msa_status === "completed" ? "Completed" : "Pending",
        completed: client.msa_status === "completed",
        Icon: FileSignature,
      },
      {
        title: "Employee Added",
        description: "First employee added to the system",
        meta: client.employee_added_status === "completed" ? "Completed" : "Pending",
        completed: client.employee_added_status === "completed",
        Icon: Users,
      },
    ],
    [client.created_at, client.basic_info_status, client.company_info_status, client.compliance_status, client.msa_status, client.employee_added_status]
  );

  const total = steps.length;
  const completed = steps.filter(s => s.completed).length;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="space-y-6">
      {/* Onboarding Progress Box */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Onboarding Progress</h3>
          <span className="text-sm text-slate-500">{percent}%</span>
        </div>
        <p className="text-sm text-slate-500 mb-4">{completed} of {total} steps completed</p>

        {/* Progress bar */}
        <div className="mb-8 h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-indigo-600"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-3 top-0 h-full w-px bg-slate-200" />
          <ul className="space-y-6">
            {steps.map(({ title, description, meta, completed, Icon }, idx) => (
              <li key={idx} className="relative pl-10">
                <div className="absolute left-0 top-0.5">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${completed ? "bg-indigo-50 border-indigo-300" : "bg-white border-slate-300"}`}>
                    {completed ? (
                      <Check className="h-3 w-3 text-indigo-600" />
                    ) : (
                      <div className="h-2 w-2 rounded-full border border-slate-300" />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-base font-semibold flex items-center gap-2">
                    <Icon className="h-4 w-4 text-indigo-600" />
                    {title}
                  </div>
                  <div className="text-slate-600 text-sm">{description}</div>
                  {meta && <div className="text-slate-400 text-sm">{meta}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Collapsible details - separate boxes */}
      <div className="space-y-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="basic" className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <AccordionTrigger className="px-4 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <UserRound className="h-4 w-4 text-indigo-600" />
                Basic Information (User Details)
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-slate-500">First Name</div>
                  <div className="font-medium">{client.contact_first_name || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Contact Email</div>
                  <div className="font-medium">{client.email}</div>
                </div>
                <div>
                  <div className="text-slate-500">Last Name</div>
                  <div className="font-medium">{client.contact_last_name || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Contact Phone</div>
                  <div className="font-medium">{client.phone}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-slate-500">Job Title / Designation</div>
                  <div className="font-medium">{client.contact_job_title || '-'}</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="company" className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <AccordionTrigger className="px-4 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <Building2 className="h-4 w-4 text-indigo-600" />
                Company Registration & Legal Info
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-slate-500">Company Name</div>
                  <div className="font-medium">{client.name}</div>
                </div>
                {/* Right column starts with Status */}
                <div>
                  <div className="text-slate-500">Status</div>
                  <div className="mt-1">
                    <StatusBadge variant={client.status}>{client.status}</StatusBadge>
                  </div>
                </div>
                {/* Left column additional fields */}
                <div>
                  <div className="text-slate-500">Legal Name</div>
                  <div className="font-medium">{client.legal_name || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Country of Incorporation</div>
                  <div className="font-medium">{client.country_of_incorporation || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Entity Type</div>
                  <div className="font-medium">{client.entity_type || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Registered Country</div>
                  <div className="font-medium">{client.country || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Employee Count</div>
                  <div className="font-medium">{client.employee_count || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Tax Residency Country</div>
                  <div className="font-medium">{client.country || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Registered Address</div>
                  <div className="font-medium">{client.address || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">External Client ID</div>
                  <div className="font-medium tracking-wide">{client.external_client_id || '-'}</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="business-address" className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <AccordionTrigger className="px-4 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <MapPin className="h-4 w-4 text-indigo-600" />
                Business Address & Billing
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-4 pb-6">
              <div className="relative">
                <div className="absolute right-0 -top-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Same as Business</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
                  {/* Business Address */}
                  <div className="space-y-4">
                    <div className="text-slate-900 font-semibold">Business Address</div>
                    <div>
                      <div className="text-slate-500">Street Address</div>
                      <div className="font-medium">{client.business_address || '-'}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <div className="text-slate-500">City</div>
                        <div className="font-medium">{client.business_city || '-'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">State/Province</div>
                        <div className="font-medium">{client.business_state || '-'}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Postal Code</div>
                      <div className="font-medium">{client.business_postal_code || '-'}</div>
                    </div>
                  </div>

                  {/* Billing Information */}
                  <div className="space-y-4">
                    <div className="text-slate-900 font-semibold">Billing Information</div>
                    <div>
                      <div className="text-slate-500">Billing Currency</div>
                      <div className="font-medium">{client.billing_currency || '-'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Billing Contact</div>
                      <div className="flex items-center gap-2 font-medium">
                        {client.billing_contact_name || '-'}
                        {client.billing_contact_name && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">Primary Contact</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Billing Email</div>
                      <div className="font-medium">{client.billing_contact_email || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="compliance-ownership" className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <AccordionTrigger className="px-4 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                Compliance & Ownership
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-4 pb-6">
              <div className="space-y-8 text-sm">
                {/* Organization Information */}
                <div>
                  <div className="text-slate-900 font-semibold mb-4">Organization Information</div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-slate-500">Entity Type</div>
                      <div className="font-medium">{client.entity_type || '-'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Business Activities</div>
                      <div className="font-medium">{client.business_activities_description || '-'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Tax Certificate</div>
                      {client.Tax_certificate_url ? (
                        <a href={client.Tax_certificate_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:underline focus:underline active:underline font-medium">
                          View Document
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <div className="font-medium text-amber-600">⚠️ Pending upload</div>
                      )}
                    </div>
                  </div>
                </div>
                <hr className="border-slate-200" />

                {/* Ownership & Management */}
                <div>
                  <div className="text-slate-900 font-semibold mb-4">Ownership & Management</div>
                  <div className="space-y-6">
                    {/* Directors and Beneficial Owners Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <div className="text-slate-500 mb-2">Directors</div>
                        <ul className="list-disc pl-5 space-y-1 text-slate-900">
                          {client.director_name ? (
                            <li className="font-medium">{client.director_name}</li>
                          ) : (
                            <li className="font-medium text-slate-400">-</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <div className="text-slate-500 mb-2">Beneficial Owners (&gt;25%)</div>
                        <ul className="list-disc pl-5 space-y-1 text-slate-900">
                          {client.beneficial_owner_1 && (
                            <li className="font-medium">{client.beneficial_owner_1}</li>
                          )}
                          {client.beneficial_owner_2 && (
                            <li className="font-medium">{client.beneficial_owner_2}</li>
                          )}
                          {!client.beneficial_owner_1 && !client.beneficial_owner_2 && (
                            <li className="font-medium text-slate-400">-</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    {/* Documents Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <div className="text-slate-500">Certificate of Incorporation</div>
                        <a href="#" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:underline focus:underline active:underline font-medium">
                          View Document
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div>
                        <div className="text-slate-500">Proof of Address</div>
                        <a href="#" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:underline focus:underline active:underline font-medium">
                          View Document
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="border-slate-200" />

                {/* Compliance Declarations */}
                <div>
                  <div className="text-slate-900 font-semibold mb-4">Compliance Declarations</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Legitimate Business Funds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Not on Sanctions List</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">AML Compliance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">No PEPs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Prohibited Industries Declaration</span>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="tax-compliance" className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <AccordionTrigger className="px-4 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <FileText className="h-4 w-4 text-indigo-600" />
                Tax & Compliance
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
                <div className="space-y-4">
                  <div>
                    <div className="text-slate-500">GST Status</div>
                    <div className="mt-1">
                      {client.gst_status ? (
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                          {client.gst_status}
                        </span>
                      ) : (
                        <span className="font-medium">-</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">GSTIN</div>
                    <div className="font-medium">{client.gstin || '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">GST State</div>
                    <div className="font-medium">{client.gst_state || '-'}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-slate-500">Withholding Tax</div>
                    <div className="mt-1">
                      {client.withholding_percentage !== null && client.withholding_percentage !== undefined ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {client.withholding_percentage}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          Not Applicable
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Billing Currency</div>
                    <div className="font-medium">{client.billing_currency || '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Invoice Currency Preference</div>
                    <div className="font-medium">{client.invoice_currency_preference || '-'}</div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="ap-contact" className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <AccordionTrigger className="px-4 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <Mail className="h-4 w-4 text-indigo-600" />
                AP Contact & Communications
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
                <div className="space-y-4">
                  <div>
                    <div className="text-slate-500">Primary Contact</div>
                    <div className="font-medium">{client.primary_contact_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Email</div>
                    <div className="font-medium">{client.primary_contact_email || '-'}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-slate-500">Additional Recipients</div>
                    <div className="mt-1">
                      {client.additional_recipients ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {client.additional_recipients}
                        </span>
                      ) : (
                        <span className="font-medium">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="payment-terms" className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <AccordionTrigger className="px-4 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                Payment Terms & Banking
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
                <div className="space-y-4">
                  <div>
                    <div className="text-slate-500">Invoice Issue Date</div>
                    <div className="font-medium">{client.invoice_issue_date || '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Payment Due Date</div>
                    <div className="font-medium">{client.payment_due_date || '-'}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-slate-500">Invoicing Frequency</div>
                    <div className="font-medium">{client.invoicing_frequency || '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Payment Method</div>
                    <div className="font-medium">{client.payment_method || '-'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-slate-900 font-semibold mb-3">Banking Details</div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 font-medium">
                        INR Bank Details
                        <button
                          onClick={copyBankDetails}
                          className="h-4 w-4 text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors"
                          title="Copy bank details"
                          aria-label="Copy bank details to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <div className="text-slate-500">Account Holder:</div>
                        <div className="font-medium">{client.bank_account_holder || '-'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">IFSC Code:</div>
                        <div className="font-medium">{client.bank_ifsc_code || '-'}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-slate-500">Account Number:</div>
                        <div className="font-medium">{client.bank_account_number || '-'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Bank Name:</div>
                        <div className="font-medium">{client.bank_name || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-slate-500">Virtual Account</div>
                  <div className="font-medium">{client.virtual_account_id || '-'}</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="document-management" className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <AccordionTrigger className="px-4 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <Folder className="h-4 w-4 text-indigo-600" />
                Document Management
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-4 pb-6">
              <div className="max-w-md">
                {/* MSA/Service Agreement */}
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-slate-900">MSA/Service Agreement</div>
                    {client.msa_status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        pending
                      </span>
                    )}
                  </div>
                  <div className="mb-2">
                    {client.msa_document_url ? (
                      <a 
                        href={client.msa_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline focus:underline active:underline font-medium flex items-center gap-1"
                      >
                        View Document
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <div className="text-sm text-slate-500">Pending upload</div>
                    )}
                  </div>
                  {client.msa_signed_date && (
                    <div className="text-sm text-slate-600">
                      Signed: {formatDate(client.msa_signed_date)}
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}


