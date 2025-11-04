import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Search, Calendar, Building, Clock, ChevronDown, MoreVertical, Check, FileText, X } from "lucide-react";
import { format } from "date-fns";

// Mock prospects data
const mockProspects = [
  {
    id: "1",
    name: "Sarah Mitchell",
    company: "TechCorp Industries",
    email: "sarah.mitchell@techcorp.com",
    signupDate: "14/10/2025",
    lastActive: "18 days ago",
    productUsage: "User Profile Created",
  },
  {
    id: "2",
    name: "James Rodriguez",
    company: "Innovate Solutions",
    email: "j.rodriguez@innovate.io",
    signupDate: "13/10/2025",
    lastActive: "19 days ago",
    productUsage: "Basic Information Completed",
  },
  {
    id: "3",
    name: "Emily Chen",
    company: "Startup Ventures LLC",
    email: "emily.chen@startupventures.com",
    signupDate: "12/10/2025",
    lastActive: "18 days ago",
    productUsage: "Company Profile Completed",
  },
  {
    id: "4",
    name: "Michael Johnson",
    company: "GlobalTech Networks",
    email: "mike.j@globaltech.net",
    signupDate: "11/10/2025",
    lastActive: "20 days ago",
    productUsage: "Basic Information Completed",
  },
  {
    id: "5",
    name: "Lisa Anderson",
    company: "Data Systems Inc",
    email: "l.anderson@datasystems.com",
    signupDate: "10/10/2025",
    lastActive: "18 days ago",
    productUsage: "User Profile Created",
  },
  {
    id: "6",
    name: "David Park",
    company: "Cloud Services Pro",
    email: "david.park@cloudservices.io",
    signupDate: "09/10/2025",
    lastActive: "19 days ago",
    productUsage: "Compliance Declarations Completed",
  },
];

// Company list for filter
const companyList = [
  "Cloud Services Pro",
  "Construction Co Ltd",
  "Data Systems Inc",
  "EduTech Solutions",
  "Financial Group Holdings",
  "GlobalTech Networks",
  "Health Systems Group",
  "Innovate Solutions",
  "Marketing Pro Agency",
  "RetailPlus Corp",
  "Startup Ventures LLC",
  "TechCorp Industries",
];

export default function Prospects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [signupDateRange, setSignupDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<string>("");
  const [noteText, setNoteText] = useState("");

  // Filter prospects
  const filteredProspects = mockProspects.filter(prospect => {
    const matchesSearch = 
      prospect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Company filter
    const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(prospect.company);
    
    // Date range filter
    let matchesDateRange = true;
    if (signupDateRange.from || signupDateRange.to) {
      const prospectDate = new Date(prospect.signupDate.split('/').reverse().join('-'));
      if (signupDateRange.from && signupDateRange.to) {
        matchesDateRange = prospectDate >= signupDateRange.from && prospectDate <= signupDateRange.to;
      } else if (signupDateRange.from) {
        matchesDateRange = prospectDate >= signupDateRange.from;
      } else if (signupDateRange.to) {
        matchesDateRange = prospectDate <= signupDateRange.to;
      }
    }
    
    return matchesSearch && matchesCompany && matchesDateRange;
  });
  
  const handleAddNote = (prospectName: string) => {
    setSelectedProspect(prospectName);
    setNoteDialogOpen(true);
  };
  
  const handleSaveNote = () => {
    // Save note logic here
    console.log(`Note for ${selectedProspect}:`, noteText);
    setNoteDialogOpen(false);
    setNoteText("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Prospects</h1>
        <p className="text-sm text-slate-500">
          Manage website sign-ups and track leads.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none shrink-0" />
          <Input 
            placeholder="Search prospects..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-10 relative z-0 h-9 text-sm" 
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs">
              <Calendar className="h-4 w-4 mr-2" />
              {signupDateRange.from && signupDateRange.to
                ? `${format(signupDateRange.from, "MMM dd")} - ${format(signupDateRange.to, "MMM dd")}`
                : "Signup Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 shadow-lg" align="start">
            <CalendarComponent
              mode="range"
              selected={{ from: signupDateRange.from, to: signupDateRange.to }}
              onSelect={(range: any) => setSignupDateRange({ from: range?.from, to: range?.to })}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs">
              <Building className="h-4 w-4 mr-2" />
              {selectedCompanies.length > 0 ? `${selectedCompanies.length} selected` : "Company"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            <div className="max-h-[280px] overflow-y-auto">
              {companyList.map((company) => (
                <DropdownMenuItem
                  key={company}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCompanies(prev => 
                      prev.includes(company) 
                        ? prev.filter(c => c !== company)
                        : [...prev, company]
                    );
                  }}
                  className="cursor-pointer text-sm py-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                      selectedCompanies.includes(company) 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'border-slate-300'
                    }`}>
                      {selectedCompanies.includes(company) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span>{company}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-2 pb-2">
              <button
                onClick={() => setSelectedCompanies([])}
                className="w-full text-center text-xs text-slate-600 hover:text-slate-900 cursor-pointer py-1"
              >
                Clear All
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs">
              <Clock className="h-4 w-4 mr-2" />
              {timeFilter}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            {["All", "Today", "This Week", "This Month", "Older than 30 days"].map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => setTimeFilter(option)}
                className="cursor-pointer text-sm py-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option}</span>
                  {timeFilter === option && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs">
              {stageFilter}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px]">
            {["All Stages", "User Profile Created", "Basic Info Completed", "Company Profile Completed", "Compliance Completed", "MSA Signed", "Employee Added"].map((stage) => (
              <DropdownMenuItem
                key={stage}
                onClick={() => setStageFilter(stage)}
                className="cursor-pointer text-sm py-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{stage}</span>
                  {stageFilter === stage && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Prospects Table */}
      <div className="rounded-lg border border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="h-10 bg-slate-50">
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Name</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Company</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Contact</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Sign-up Date</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Last Active</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs">Product Usage</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProspects.length === 0 ? (
                <TableRow className="h-12">
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No prospects found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProspects.map((prospect) => (
                  <TableRow 
                    key={prospect.id} 
                    className="cursor-pointer hover:bg-slate-50 h-12 transition-colors"
                  >
                    <TableCell className="py-2 px-4 text-slate-900 text-xs">
                      {prospect.name}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-slate-600 text-xs">
                      {prospect.company}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-xs">
                      <a href={`mailto:${prospect.email}`} className="text-indigo-600 hover:text-indigo-700 hover:underline">
                        {prospect.email}
                      </a>
                    </TableCell>
                    <TableCell className="py-2 px-4 text-slate-600 text-xs">
                      {prospect.signupDate}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-slate-600 text-xs">
                      {prospect.lastActive}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-slate-600 text-xs">
                      {prospect.productUsage}
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6"
                            >
                              <MoreVertical className="h-3.5 w-3.5 text-slate-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[120px]">
                            <DropdownMenuItem 
                              className="cursor-pointer text-sm py-2 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleAddNote(prospect.name)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-2" />
                              Add Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add Note</DialogTitle>
            <DialogDescription className="text-sm">
              Add a note for {selectedProspect}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[150px] resize-none focus:border-indigo-500 focus:ring-indigo-500 bg-white"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setNoteDialogOpen(false);
                setNoteText("");
              }}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNote}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
