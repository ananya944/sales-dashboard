import { useState } from "react";
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

// Mock client data for filter
const mockClients = [
  "All Clients",
  "TechCorp Inc.",
  "Digital Solutions Ltd.",
  "Innovation Labs",
  "Global Dynamics",
  "Creative Agency",
  "Analytics Corp",
];

// Mock employee data
const mockEmployees = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Software Engineer",
    client: "TechCorp Inc.",
    joinDate: "2023-01-15",
    status: "active",
    salary: 1200000,
  },
  {
    id: "2",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    role: "Product Manager",
    client: "Digital Solutions Ltd.",
    joinDate: "2022-08-20",
    status: "active",
    salary: 1500000,
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.davis@company.com",
    role: "Marketing Manager",
    client: "Digital Solutions Ltd.",
    joinDate: "2023-06-15",
    status: "active",
    salary: 1400000,
  },
  {
    id: "4",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    role: "Senior Developer",
    client: "TechCorp Inc.",
    joinDate: "2024-01-10",
    status: "preboarding",
    salary: 1300000,
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa.anderson@company.com",
    role: "UI/UX Designer",
    client: "Creative Agency",
    joinDate: "2023-11-20",
    status: "onboarding",
    salary: 1100000,
  },
  {
    id: "6",
    name: "David Chen",
    email: "david.chen@company.com",
    role: "Data Analyst",
    client: "Analytics Corp",
    joinDate: "2023-03-15",
    status: "exit",
    salary: 900000,
  },
];

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [selectedClient, setSelectedClient] = useState("All Clients");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Calculate tab counts
  const statusCounts = mockEmployees.reduce((acc, employee) => {
    acc[employee.status] = (acc[employee.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter employees based on search, client filter, and active tab
  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = selectedClient === "All Clients" || employee.client === selectedClient;
    const matchesTab = activeTab === "all" || employee.status === activeTab;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRange.from || dateRange.to) {
      const employeeDate = new Date(employee.joinDate);
      if (dateRange.from && dateRange.to) {
        matchesDateRange = employeeDate >= dateRange.from && employeeDate <= dateRange.to;
      } else if (dateRange.from) {
        matchesDateRange = employeeDate >= dateRange.from;
      } else if (dateRange.to) {
        matchesDateRange = employeeDate <= dateRange.to;
      }
    }
    
    return matchesSearch && matchesClient && matchesTab && matchesDateRange;
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
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
          <DropdownMenuContent align="start" className="w-[200px]">
            {mockClients.map((client) => (
              <DropdownMenuItem
                key={client}
                onClick={() => setSelectedClient(client)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{client}</span>
                  {selectedClient === client && (
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
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              {dateRange.from && dateRange.to
                ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                : "Join Date Range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 shadow-lg" align="start">
            <CalendarComponent
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
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
                  {filteredEmployees.length === 0 ? (
                    <TableRow className="h-12">
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow 
                        key={employee.id} 
                        className="cursor-pointer hover:bg-slate-50 h-12 transition-colors"
                      >
                        <TableCell className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                                {getInitials(employee.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900">{employee.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-6 text-slate-600">
                          {employee.email}
                        </TableCell>
                        <TableCell className="py-3 px-6 text-slate-600">
                          {employee.role}
                        </TableCell>
                        <TableCell className="py-3 px-6 text-slate-600">
                          {employee.client}
                        </TableCell>
                        <TableCell className="py-3 px-6 text-slate-600">
                          {employee.joinDate}
                        </TableCell>
                        <TableCell className="py-3 px-6">
                          <StatusBadge variant={employee.status as any}>
                            {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="py-3 px-6 font-semibold text-slate-900 text-right">
                          {formatCurrency(employee.salary)}
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
                              <DropdownMenuItem className="cursor-pointer text-sm py-2">
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
