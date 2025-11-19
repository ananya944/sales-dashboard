import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Plus, Search, Users, Calendar, MoreVertical, Check, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { getAllEmployees } from "@/services/employeeService";
import { getAllOrganizations } from "@/services/organizationService";
import type { Employee } from "@/services/employeeService";
import type { DateRange } from "react-day-picker";
import { AddEmployeeModal } from "@/components/modals/AddEmployeeModal";

export default function Employees() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [selectedClient, setSelectedClient] = useState("All Clients");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgMap, setOrgMap] = useState<Record<string, string>>({});
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);

  // Fetch employees and organizations
  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesData, orgsData] = await Promise.all([
        getAllEmployees(),
        getAllOrganizations(),
      ]);
      
      setEmployees(employeesData);
      setOrganizations(orgsData);
      
      // Create organization ID to name mapping
      const mapping: Record<string, string> = {};
      orgsData.forEach((org: any) => {
        mapping[org.id] = org.name;
      });
      setOrgMap(mapping);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle successful employee addition
  const handleEmployeeAdded = () => {
    fetchData(); // Refresh the employee list
  };

  // Calculate tab counts based on selected client filter
  const statusCounts = employees
    .filter(employee => {
      const matchesClient = !selectedClientId || employee.organization_id === selectedClientId;
      return matchesClient;
    })
    .reduce((acc, employee) => {
      const status = employee.status?.toLowerCase() || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Filter employees based on search, client filter, and active tab
  const filteredEmployees = employees.filter(employee => {
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    const orgName = orgMap[employee.organization_id] || '';
    const status = employee.status?.toLowerCase() || 'active';
    
    const matchesSearch = 
      employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orgName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClient = !selectedClientId || employee.organization_id === selectedClientId;
    const matchesTab = activeTab === "all" || status === activeTab;
    
    // Date range filter - normalize dates to midnight for accurate comparison
    let matchesDateRange = true;
    if (dateRange?.from || dateRange?.to) {
      const employeeDate = new Date(employee.start_date);
      employeeDate.setHours(0, 0, 0, 0);
      
      if (dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        matchesDateRange = employeeDate >= fromDate && employeeDate <= toDate;
        console.log(`Checking ${employeeName}: ${employee.start_date} between ${fromDate.toDateString()} and ${toDate.toDateString()} = ${matchesDateRange}`);
      } else if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        matchesDateRange = employeeDate >= fromDate;
      } else if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        matchesDateRange = employeeDate <= toDate;
      }
    }
    
    return matchesSearch && matchesClient && matchesTab && matchesDateRange;
  });
  
  // Debug: Log filter state
  console.log('Filter state:', { 
    dateRange, 
    totalEmployees: employees.length, 
    filteredCount: filteredEmployees.length,
    activeTab,
    selectedClientId
  });

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500">
            Manage your workforce and employee lifecycle
          </p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setAddEmployeeModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none shrink-0" />
          <Input 
            placeholder="Search employees..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-10 relative z-0" 
          />
        </div>
        
        {/* All Clients Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              {selectedClient}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[250px] max-h-[300px] overflow-y-auto">
            <DropdownMenuItem
              onClick={() => {
                setSelectedClient("All Clients");
                setSelectedClientId(null);
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>All Clients</span>
                {selectedClient === "All Clients" && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </DropdownMenuItem>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => {
                  setSelectedClient(org.name);
                  setSelectedClientId(org.id);
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{org.name}</span>
                  {selectedClient === org.name && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Join Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={dateRange?.from ? "bg-blue-50 border-blue-300" : ""}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                : dateRange?.from
                ? format(dateRange.from, "MMM dd, yyyy")
                : "Join Date Range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={(range: DateRange | undefined) => {
                console.log('Date range selected:', range);
                setDateRange(range);
              }}
              numberOfMonths={2}
              defaultMonth={dateRange?.from || new Date()}
            />
          </PopoverContent>
        </Popover>
        
        {/* Clear Filters Button */}
        {(dateRange?.from || dateRange?.to || selectedClientId || searchQuery) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDateRange(undefined);
              setSelectedClientId(null);
              setSelectedClient("All Clients");
              setSearchQuery("");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 rounded-lg p-1 w-full grid grid-cols-4 gap-2">
          <TabsTrigger className="rounded-md" value="active">Active ({statusCounts.active || 0})</TabsTrigger>
          <TabsTrigger className="rounded-md" value="preboarding">Preboarding ({statusCounts.preboarding || 0})</TabsTrigger>
          <TabsTrigger className="rounded-md" value="onboarding">Onboarding ({statusCounts.onboarding || 0})</TabsTrigger>
          <TabsTrigger className="rounded-md" value="exit">Exit ({statusCounts.exit || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="rounded-lg border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="h-12">
                    <TableHead className="py-3 px-6 min-w-[200px]">Name</TableHead>
                    <TableHead className="py-3 px-6">Email</TableHead>
                    <TableHead className="py-3 px-6">Role</TableHead>
                    <TableHead className="py-3 px-6">Client</TableHead>
                    <TableHead className="py-3 px-6">Join Date</TableHead>
                    <TableHead className="py-3 px-6 w-32">Status</TableHead>
                    <TableHead className="py-3 px-6 text-right">Salary</TableHead>
                    <TableHead className="py-3 px-4 w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="h-12">
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                          <p className="ml-3 text-slate-500">Loading employees...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredEmployees.length === 0 ? (
                    <TableRow className="h-12">
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => {
                      const employeeName = `${employee.first_name} ${employee.last_name}`;
                      const orgName = orgMap[employee.organization_id] || '-';
                      const status = employee.status?.toLowerCase() || 'active';
                      
                      return (
                        <TableRow 
                          key={employee.id} 
                          className="cursor-pointer hover:bg-slate-50 h-12 transition-colors"
                          onClick={() => navigate(`/employees/${employee.id}`)}
                        >
                          <TableCell className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                                  {getInitials(employeeName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-slate-900">{employeeName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-6 text-slate-600">
                            {employee.email || "-"}
                          </TableCell>
                          <TableCell className="py-3 px-6 text-slate-600">
                            {employee.job_title}
                          </TableCell>
                          <TableCell className="py-3 px-6 text-slate-600">
                            {orgName}
                          </TableCell>
                          <TableCell className="py-3 px-6 text-slate-600">
                            {new Date(employee.start_date).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell className="py-3 px-6">
                            <StatusBadge variant={status as any}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="py-3 px-6 font-semibold text-slate-900 text-right">
                            {employee.salary ? formatCurrency(employee.salary) : '-'}
                          </TableCell>
                          <TableCell className="py-3 px-4">
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
                              <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuItem 
                                  className="cursor-pointer text-sm py-2"
                                  onClick={() => navigate(`/employees/${employee.id}`)}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-sm py-2">
                                  Edit Employee
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-sm py-2">
                                  View Equipment
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-sm py-2">
                                  Performance Review
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-sm py-2 text-amber-600">
                                  Initiate Exit Process
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-sm py-2 text-red-600">
                                  Deactivate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        open={addEmployeeModalOpen}
        onClose={() => setAddEmployeeModalOpen(false)}
        onSuccess={handleEmployeeAdded}
        organizations={organizations}
      />
    </div>
  );
}
