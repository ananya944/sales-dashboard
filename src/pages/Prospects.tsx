import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Search, Calendar, Building, Clock, ChevronDown, Check, MoreVertical, FileText, UserPlus, XCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { getProspects, type ProspectDisplay, findClientByProspectId } from "@/services/prospectService";

export default function Prospects() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [signupDateRange, setSignupDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [prospects, setProspects] = useState<ProspectDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteProspect, setNoteProspect] = useState<ProspectDisplay | null>(null);
  const [noteText, setNoteText] = useState("");
  const openNoteModal = (prospect: ProspectDisplay) => {
    setNoteProspect(prospect);
    setNoteText("");
    setNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteProspect) return;
    console.log("Saving note for prospect:", noteProspect.id, noteText);
    setNoteModalOpen(false);
    setNoteProspect(null);
    setNoteText("");
  };


  // Load prospects from Supabase
  useEffect(() => {
    async function loadProspects() {
      try {
        setLoading(true);
        const data = await getProspects();
        console.log('📥 Prospects fetched in component:', data);
        setProspects(data);
      } catch (error) {
        console.error('Error loading prospects:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProspects();
  }, []);

  const companyList = Array.from(new Set(prospects.map(p => p.company))).sort();

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = 
      prospect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(prospect.company);
    
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
    
    let matchesStage = true;
    if (stageFilter === "MSA Signed") {
      matchesStage = prospect.msaSigned === true;
    } else if (stageFilter === "Compliance Declarations Completed") {
      matchesStage = prospect.complianceCompleted === true;
    } else if (stageFilter !== "All Stages") {
      matchesStage = prospect.productUsage === stageFilter;
    }
    
    let matchesTime = true;
    if (timeFilter !== "All") {
      const now = new Date();
      const prospectDate = new Date(prospect.signupDate.split('/').reverse().join('-'));
      const diffDays = Math.floor((now.getTime() - prospectDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (timeFilter === "Today") {
        matchesTime = diffDays === 0;
      } else if (timeFilter === "This Week") {
        matchesTime = diffDays <= 7;
      } else if (timeFilter === "This Month") {
        matchesTime = diffDays <= 30;
      } else if (timeFilter === "Older than 30 days") {
        matchesTime = diffDays > 30;
      }
    }
    
    return matchesSearch && matchesCompany && matchesDateRange && matchesStage && matchesTime;
  });

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
          <PopoverContent className="p-0 w-[440px] rounded-lg border border-slate-200 shadow-lg" align="start">
            <div className="p-3">
              <CalendarComponent
                className="w-full"
                mode="range"
                selected={{ from: signupDateRange.from, to: signupDateRange.to }}
                onSelect={(range: any) => setSignupDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
              />
            </div>
            <div className="border-t border-slate-200 px-3 py-2 flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSignupDateRange({ from: undefined, to: undefined })}
                className="h-7 px-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Clear Selection
              </Button>
            </div>
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
            {stageFilter !== "All Stages" && (
              <>
                <DropdownMenuItem
                  onClick={() => setStageFilter("All Stages")}
                  className="cursor-pointer text-sm py-2 text-indigo-600 font-medium flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Clear All Filters
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {["All Stages", "User Profile Created", "Basic Information Completed", "Company Profile Completed", "Compliance Declarations Completed", "MSA Signed", "Employee Added"].map((stage) => (
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
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs align-middle">Name</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs align-middle">Company</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs align-middle">Contact</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs align-middle whitespace-nowrap">Sign-up Date</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs align-middle whitespace-nowrap">Last Active</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs align-middle whitespace-nowrap">Product Usage</TableHead>
                <TableHead className="py-2 px-4 font-semibold text-slate-700 text-xs text-right align-middle">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="h-12">
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Loading prospects...
                  </TableCell>
                </TableRow>
              ) : filteredProspects.length === 0 ? (
                <TableRow className="h-12">
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No prospects found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProspects.map((prospect) => (
                  <TableRow 
                    key={prospect.id} 
                    className="cursor-pointer hover:bg-slate-50 h-12 transition-colors"
                    onClick={() => navigate(`/prospects/${prospect.id}`)}
                  >
                    <TableCell className="py-2 px-4 text-slate-900 text-xs align-middle">
                      {prospect.name}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-slate-600 text-xs align-middle">
                      {prospect.company}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-xs align-middle">
                      <a 
                        href={`mailto:${prospect.email}`} 
                        className="text-indigo-600 hover:text-indigo-700 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prospect.email}
                      </a>
                    </TableCell>
                    <TableCell className="py-2 px-4 text-slate-600 text-xs align-middle">
                      {prospect.signupDate}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-slate-600 text-xs align-middle">
                      {prospect.lastActive}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-slate-600 text-xs align-middle">
                      {prospect.productUsage}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-right align-middle">
                      {stageFilter === "MSA Signed" && prospect.onboardingCompleted ? (
                        <div className="flex items-center gap-2 justify-end h-7">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 whitespace-nowrap">
                            Converted to Client
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs whitespace-nowrap"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const clientId = await findClientByProspectId(prospect.id);
                              if (clientId) {
                                navigate(`/clients/${clientId}`);
                              } else {
                                console.error("Client ID not found for prospect");
                              }
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Client
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end h-7">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openNoteModal(prospect);
                                }}
                                className="cursor-pointer text-sm py-2 text-slate-800"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-slate-800" />
                                  <span>Add Note</span>
                                </div>
                              </DropdownMenuItem>
                              {(stageFilter === "MSA Signed" || stageFilter === "Employee Added") && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/clients/${prospect.id}/new-subscription`, {
                                      state: { from: "prospects" },
                                    });
                                  }}
                                  className="cursor-pointer text-sm py-2 text-slate-800"
                                >
                                  <div className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4 text-slate-800" />
                                    <span>Onboard as a Client</span>
                                  </div>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              {noteProspect ? `Add a note for ${noteProspect.name}` : "Add a note"}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter your note here..."
            className="min-h-[140px] text-sm"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setNoteModalOpen(false);
                setNoteProspect(null);
                setNoteText("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={handleSaveNote}
              disabled={!noteText.trim()}
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
