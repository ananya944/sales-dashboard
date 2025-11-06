import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, Building, Mail, Phone, MapPin, Edit, Plus, FileText, Users, Receipt } from "lucide-react";
import type { ExtendedClient } from "@/types/client";
import { getOrganizationById, updateOrganization } from "@/services/organizationService";
import { getEmployeesByOrganization } from "@/services/employeeService";
import type { Employee } from "@/services/employeeService";
import { OverviewTab } from "@/components/client-details/OverviewTab";
import { InvoicesTab } from "@/components/client-details/InvoicesTab";
import { SubscriptionsTab } from "@/components/client-details/SubscriptionsTab";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { useToast } from "@/hooks/use-toast";
export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [client, setClient] = useState<ExtendedClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const { toast } = useToast();

  // Handle client update
  const handleUpdateClient = async (updates: any) => {
    if (!id) return;
    
    try {
      await updateOrganization(id, updates);
      
      // Refresh client data
      const orgData = await getOrganizationById(id);
      const businessAddress = [
        orgData.business_address,
        orgData.business_city,
        orgData.business_state
      ].filter(Boolean).join(', ');
      
      const clientData: ExtendedClient = {
        id: orgData.id,
        name: orgData.name || 'Unknown Organization',
        email: orgData.email || '-',
        phone: orgData.phone || '-',
        address: businessAddress || orgData.country || '-',
        status: orgData.msa_status === 'completed' ? 'active' : 'pending',
        salesSpoc: orgData.sales_spoc || '-',
        accountManager: orgData.account_manager || '-',
        clientAdmin: orgData.client_admin || '-',
        mrr: orgData.mrr ? `$${orgData.mrr}` : '-',
        lastActivity: new Date().toISOString().split('T')[0],
        total_employees: orgData.employee_count ? parseInt(orgData.employee_count) : 0,
        subscriptions: [],
        employees: [],
        invoices: [],
        created_at: orgData.created_at,
        msa_status: orgData.msa_status,
        business_address: orgData.business_address,
        business_city: orgData.business_city,
        business_state: orgData.business_state,
        business_postal_code: orgData.business_postal_code,
        basic_info_status: orgData.basic_info_status,
        company_info_status: orgData.company_info_status,
        compliance_status: orgData.compliance_status,
        employee_added_status: orgData.employee_added_status,
        contact_first_name: orgData.contact_first_name,
        contact_last_name: orgData.contact_last_name,
        contact_job_title: orgData.contact_job_title,
        legal_name: orgData.legal_name,
        entity_type: orgData.entity_type,
        employee_count: orgData.employee_count,
        country_of_incorporation: orgData.country_of_incorporation,
        country: orgData.country,
        external_client_id: orgData.external_client_id,
        billing_currency: orgData.billing_currency,
        billing_contact_name: orgData.billing_contact_name,
        billing_contact_email: orgData.billing_contact_email,
        business_activities_description: orgData.business_activities_description,
        Tax_certificate_url: orgData.Tax_certificate_url,
        director_name: orgData.director_name,
        beneficial_owner_1: orgData.beneficial_owner_1,
        beneficial_owner_2: orgData.beneficial_owner_2,
        gst_status: orgData.gst_status,
        gstin: orgData.gstin,
        gst_state: orgData.gst_state,
        withholding_percentage: orgData.withholding_percentage,
        invoice_currency_preference: orgData.invoice_currency_preference,
        primary_contact_name: orgData.primary_contact_name,
        primary_contact_email: orgData.primary_contact_email,
        additional_recipients: orgData.additional_recipients,
        invoice_issue_date: orgData.invoice_issue_date,
        payment_due_date: orgData.payment_due_date,
        invoicing_frequency: orgData.invoicing_frequency,
        payment_method: orgData.payment_method,
        bank_account_holder: orgData.bank_account_holder,
        bank_account_number: orgData.bank_account_number,
        bank_name: orgData.bank_name,
        bank_ifsc_code: orgData.bank_ifsc_code,
        virtual_account_id: orgData.virtual_account_id,
        msa_document_url: orgData.msa_document_url,
        msa_signed_date: orgData.msa_signed_date,
        has_25_percent_ownership: orgData.has_25_percent_ownership,
        tax_registration_number: orgData.tax_registration_number,
        website: orgData.website,
        industry: orgData.industry,
        description: orgData.description
      };
      
      setClient(clientData);
      
      toast({
        title: "✅ Client updated successfully",
      });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "❌ Failed to update client",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Fetch employees for the current client
  const fetchEmployees = async () => {
    if (!client?.id) return;
    try {
      setLoadingEmployees(true);
      const data = await getEmployeesByOrganization(client.id);
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    async function loadClientDetails() {
      console.log('🔍 Loading client with ID:', id);
      if (!id) {
        setError("Client ID not provided");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const orgData = await getOrganizationById(id);
        console.log('✅ Got organization data:', orgData);
        console.log('🔍 Organization data:', orgData);
        console.log('👥 Profiles found:', orgData.profiles);
        
        // Combine business address fields into a single string
        const businessAddress = [
          orgData.business_address,
          orgData.business_city,
          orgData.business_state
        ].filter(Boolean).join(', ');
        
        // Map Supabase organization data to ExtendedClient format
        const clientData: ExtendedClient = {
          id: orgData.id,
          name: orgData.name || 'Unknown Organization',
          email: orgData.email || '-',
          phone: orgData.phone || '-',
          address: businessAddress || orgData.country || '-',
          status: orgData.msa_status === 'completed' ? 'active' : 'pending',
          salesSpoc: orgData.sales_spoc || '-',
          accountManager: orgData.account_manager || '-',
          clientAdmin: orgData.client_admin || '-',
          mrr: orgData.mrr ? `$${orgData.mrr}` : '-',
          lastActivity: new Date().toISOString().split('T')[0],
          total_employees: orgData.employee_count ? parseInt(orgData.employee_count) : 0,
          subscriptions: [],
          employees: [],
          invoices: [],
          created_at: orgData.created_at,
          msa_status: orgData.msa_status,
          business_address: orgData.business_address,
          business_city: orgData.business_city,
          business_state: orgData.business_state,
          business_postal_code: orgData.business_postal_code,
          basic_info_status: orgData.basic_info_status,
          company_info_status: orgData.company_info_status,
          compliance_status: orgData.compliance_status,
          employee_added_status: orgData.employee_added_status,
          contact_first_name: orgData.contact_first_name,
          contact_last_name: orgData.contact_last_name,
          contact_job_title: orgData.contact_job_title,
          legal_name: orgData.legal_name,
          entity_type: orgData.entity_type,
          employee_count: orgData.employee_count,
          country_of_incorporation: orgData.country_of_incorporation,
          country: orgData.country,
          external_client_id: orgData.external_client_id,
          billing_currency: orgData.billing_currency,
          billing_contact_name: orgData.billing_contact_name,
          billing_contact_email: orgData.billing_contact_email,
          business_activities_description: orgData.business_activities_description,
          Tax_certificate_url: orgData.Tax_certificate_url,
          director_name: orgData.director_name,
          beneficial_owner_1: orgData.beneficial_owner_1,
          beneficial_owner_2: orgData.beneficial_owner_2,
          gst_status: orgData.gst_status,
          gstin: orgData.gstin,
          gst_state: orgData.gst_state,
          withholding_percentage: orgData.withholding_percentage,
          invoice_currency_preference: orgData.invoice_currency_preference,
          primary_contact_name: orgData.primary_contact_name,
          primary_contact_email: orgData.primary_contact_email,
          additional_recipients: orgData.additional_recipients,
          invoice_issue_date: orgData.invoice_issue_date,
          payment_due_date: orgData.payment_due_date,
          invoicing_frequency: orgData.invoicing_frequency,
          payment_method: orgData.payment_method,
          bank_account_holder: orgData.bank_account_holder,
          bank_account_number: orgData.bank_account_number,
          bank_name: orgData.bank_name,
          bank_ifsc_code: orgData.bank_ifsc_code,
          virtual_account_id: orgData.virtual_account_id,
          msa_document_url: orgData.msa_document_url,
          msa_signed_date: orgData.msa_signed_date,
          has_25_percent_ownership: orgData.has_25_percent_ownership,
          tax_registration_number: orgData.tax_registration_number,
          website: orgData.website,
          industry: orgData.industry,
          description: orgData.description
        };
        
        setClient(clientData);
      } catch (err) {
        console.error('❌ Error details:', err);
        console.error('❌ Error message:', err instanceof Error ? err.message : err);
        setError(err instanceof Error ? err.message : "Failed to load client details");
      } finally {
        setLoading(false);
      }
    }
    loadClientDetails();
  }, [id]);

  // Update active tab when URL search params change and refetch data
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "employees", "invoices", "subscriptions"].includes(tab)) {
      setActiveTab(tab);
      // Refetch client data when navigating to subscriptions tab to show new subscriptions
      if (tab === "subscriptions" && id) {
        getOrganizationById(id).then((orgData) => {
          // Combine business address fields into a single string
          const businessAddress = [
            orgData.business_address,
            orgData.business_city,
            orgData.business_state
          ].filter(Boolean).join(', ');
          
          const clientData: ExtendedClient = {
            id: orgData.id,
            name: orgData.name || 'Unknown Organization',
            email: orgData.email || '-',
            phone: orgData.phone || '-',
            address: businessAddress || orgData.country || '-',
            status: orgData.msa_status === 'completed' ? 'active' : 'pending',
            salesSpoc: orgData.sales_spoc || '-',
            accountManager: orgData.account_manager || '-',
            clientAdmin: orgData.client_admin || '-',
            mrr: orgData.mrr ? `$${orgData.mrr}` : '-',
            lastActivity: new Date().toISOString().split('T')[0],
            total_employees: orgData.employee_count ? parseInt(orgData.employee_count) : 0,
            subscriptions: [],
            employees: [],
            invoices: [],
            created_at: orgData.created_at,
            msa_status: orgData.msa_status,
            business_address: orgData.business_address,
            business_city: orgData.business_city,
            business_state: orgData.business_state,
            business_postal_code: orgData.business_postal_code,
            basic_info_status: orgData.basic_info_status,
            company_info_status: orgData.company_info_status,
            compliance_status: orgData.compliance_status,
            employee_added_status: orgData.employee_added_status,
            contact_first_name: orgData.contact_first_name,
            contact_last_name: orgData.contact_last_name,
            contact_job_title: orgData.contact_job_title,
            legal_name: orgData.legal_name,
            entity_type: orgData.entity_type,
            employee_count: orgData.employee_count,
            country_of_incorporation: orgData.country_of_incorporation,
            country: orgData.country,
            external_client_id: orgData.external_client_id,
            billing_currency: orgData.billing_currency,
            billing_contact_name: orgData.billing_contact_name,
            billing_contact_email: orgData.billing_contact_email,
            business_activities_description: orgData.business_activities_description,
            Tax_certificate_url: orgData.Tax_certificate_url,
            director_name: orgData.director_name,
            beneficial_owner_1: orgData.beneficial_owner_1,
            beneficial_owner_2: orgData.beneficial_owner_2,
            gst_status: orgData.gst_status,
            gstin: orgData.gstin,
            gst_state: orgData.gst_state,
            withholding_percentage: orgData.withholding_percentage,
            invoice_currency_preference: orgData.invoice_currency_preference,
            primary_contact_name: orgData.primary_contact_name,
            primary_contact_email: orgData.primary_contact_email,
            additional_recipients: orgData.additional_recipients,
            invoice_issue_date: orgData.invoice_issue_date,
            payment_due_date: orgData.payment_due_date,
            invoicing_frequency: orgData.invoicing_frequency,
            payment_method: orgData.payment_method,
            bank_account_holder: orgData.bank_account_holder,
            bank_account_number: orgData.bank_account_number,
            bank_name: orgData.bank_name,
            bank_ifsc_code: orgData.bank_ifsc_code,
            virtual_account_id: orgData.virtual_account_id,
            msa_document_url: orgData.msa_document_url,
            msa_signed_date: orgData.msa_signed_date,
            has_25_percent_ownership: orgData.has_25_percent_ownership,
            tax_registration_number: orgData.tax_registration_number,
            website: orgData.website,
            industry: orgData.industry,
            description: orgData.description
          };
          setClient(clientData);
        }).catch(() => {});
      }
    }
  }, [searchParams, id]);

  // Fetch employees when Employees tab is active
  useEffect(() => {
    if (client?.id && activeTab === 'employees') {
      fetchEmployees();
    }
  }, [client?.id, activeTab]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </div>;
  }
  if (error || !client) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Client Not Found</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{client.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Client Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{client.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge variant={client.status}>{client.status}</StatusBadge>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      Last activity: {client.lastActivity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={() => setEditModalOpen(true)}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit Client
              </Button>
              <Button 
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => navigate(`/clients/${id}/new-subscription`)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Subscription
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {client.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              {client.phone}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {client.address}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">{client.total_employees}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold text-success">{client.invoices?.length ?? 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending Invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Receipt className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold text-warning">{client.mrr}</span>
            </div>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building className="h-5 w-5 text-info" />
              <span className="text-2xl font-bold text-info">{client.subscriptions.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab client={client} />
        </TabsContent>

        <TabsContent value="employees">
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-6 pt-4 pb-4 mb-4">
                <h3 className="text-xl font-semibold">Employee Details</h3>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>

              <div className="overflow-x-auto px-6 pb-6">
                {loadingEmployees ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="ml-3 text-slate-500">Loading employees...</p>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Users className="h-16 w-16 text-slate-300 mb-4" strokeWidth={1.5} />
                    <p className="text-slate-500 text-sm">No employees found</p>
                  </div>
                ) : (
                  <Table className="w-full table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[14.28%] text-left">Name</TableHead>
                        <TableHead className="w-[14.28%] text-left">Role</TableHead>
                        <TableHead className="w-[14.28%] text-left">Department</TableHead>
                        <TableHead className="w-[14.28%] text-left">Salary (INR)</TableHead>
                        <TableHead className="w-[14.28%] text-left">Start Date</TableHead>
                        <TableHead className="w-[14.28%] text-left">Status</TableHead>
                        <TableHead className="w-[14.28%] text-left">Billable</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee.id} className="h-14">
                          <TableCell className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </TableCell>
                          <TableCell>{employee.job_title}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>
                            {employee.salary ? `₹${employee.salary.toLocaleString('en-IN')}` : '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(employee.start_date).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell>
                            <StatusBadge variant={employee.status?.toLowerCase() === 'active' ? 'active' : 'pending'}>
                              {employee.status || 'Active'}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                              Yes
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesTab client={client} />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionsTab client={client} />
        </TabsContent>
      </Tabs>

      {/* Edit Client Modal */}
      {client && (
        <EditClientModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          client={client}
          onUpdate={handleUpdateClient}
        />
      )}
    </div>;
}