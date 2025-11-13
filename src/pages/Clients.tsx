// Updated clients page with table layout
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getAllOrganizations, getOrganizationById, updateOrganization } from "@/services/organizationService";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { AddClientModal } from "@/components/modals/AddClientModal";
import { useToast } from "@/hooks/use-toast";
import type { ExtendedClient } from "@/types/client";

export default function Clients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [clients, setClients] = useState<Array<{
    id: string;
    name: string;
    country: string;
    employee_count: string;
    msa_status: string | null;
  }>>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ExtendedClient | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);

  const loadClients = async () => {
    try {
      console.log('Loading organizations from Supabase...');
      const organizations = await getAllOrganizations();
      
      if (organizations) {
        // Map Supabase organizations to client format
        const formattedClients = organizations.map((org: any) => ({
          id: org.id || '',
          name: org.name || '',
          country: org.country || '-',
          employee_count: org.employee_count || '-',
          msa_status: org.msa_status
        }));
        
        setClients(formattedClients);
        console.log('✅ Loaded', formattedClients.length, 'organizations from Supabase');
      }
    } catch (error) {
      console.error('❌ Error loading organizations:', error);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Handle opening edit modal
  const handleEditClient = async (clientId: string) => {
    setLoadingClient(true);
    try {
      const orgData = await getOrganizationById(clientId);
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
        billing_street_address: orgData.billing_street_address,
        billing_city: orgData.billing_city,
        billing_state_province: orgData.billing_state_province,
        billing_postal_code: orgData.billing_postal_code,
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
      
      setSelectedClient(clientData);
      setEditModalOpen(true);
    } catch (error) {
      console.error('Error loading client:', error);
      toast({
        title: "❌ Failed to load client data",
        variant: "destructive",
      });
    } finally {
      setLoadingClient(false);
    }
  };

  // Handle client update
  const handleUpdateClient = async (updates: any) => {
    if (!selectedClient) return;
    
    try {
      await updateOrganization(selectedClient.id, updates);
      
      // Refresh the clients list
      await loadClients();
      
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

  // Calculate tab counts based on MSA status
  const completedCount = clients.filter(c => c.msa_status === "completed").length;
  const pendingCount = clients.filter(c => !c.msa_status || c.msa_status === null).length;

  // Filter clients based on search and active tab
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === "completed") {
      matchesTab = client.msa_status === "completed";
    } else if (activeTab === "pending") {
      matchesTab = !client.msa_status || client.msa_status === null;
    }
    
    return matchesSearch && matchesTab;
  });

  // Helper function to get MSA status badge variant
  const getMsaStatusVariant = (msaStatus: string | null): "active" | "pending" => {
    return msaStatus === "completed" ? "active" : "pending";
  };

  // Helper function to get MSA status label
  const getMsaStatusLabel = (msaStatus: string | null): string => {
    return msaStatus === "completed" ? "Completed" : "Pending";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500">
            Manage your client accounts and relationships
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none shrink-0" />
          <Input 
            placeholder="Search clients..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-10 relative z-0" 
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 rounded-lg p-1">
          <TabsTrigger className="rounded-md" value="all">All ({clients.length})</TabsTrigger>
          <TabsTrigger className="rounded-md" value="completed">Completed ({completedCount})</TabsTrigger>
          <TabsTrigger className="rounded-md" value="pending">Pending ({pendingCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="rounded-lg border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="h-14">
                    <TableHead className="py-4 px-6 min-w-[200px]">Client Name</TableHead>
                    <TableHead className="py-4 px-6">Country</TableHead>
                    <TableHead className="py-4 px-6">Employee Count</TableHead>
                    <TableHead className="py-4 px-6 w-32">MSA Status</TableHead>
                    <TableHead className="py-4 px-4 w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow className="h-16">
                      <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                        No clients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow 
                        key={client.id} 
                        className="cursor-pointer hover:bg-slate-50 h-16 transition-colors"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <TableCell className="py-6 px-6 font-semibold text-slate-900">
                          {client.name}
                        </TableCell>
                        <TableCell className="py-6 px-6 text-slate-600">
                          {client.country}
                        </TableCell>
                        <TableCell className="py-6 px-6 text-slate-600">
                          {client.employee_count}
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <StatusBadge variant={getMsaStatusVariant(client.msa_status)}>
                            {getMsaStatusLabel(client.msa_status)}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/clients/${client.id}`);
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClient(client.id);
                                }}
                                disabled={loadingClient}
                              >
                                {loadingClient ? 'Loading...' : 'Edit Client'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Client Modal */}
      {selectedClient && (
        <EditClientModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
          onUpdate={handleUpdateClient}
        />
      )}

      <AddClientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={async () => {
          await loadClients();
          setAddModalOpen(false);
        }}
      />
    </div>
  );
}