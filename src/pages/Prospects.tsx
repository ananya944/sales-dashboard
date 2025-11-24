import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Search, Calendar, Building, Clock, ChevronDown, Check, MoreVertical, FileText, XCircle, Eye, Bell } from "lucide-react";
import { format } from "date-fns";
import { getProspects, type ProspectDisplay, findClientByProspectId, getProspectById, type Prospect } from "@/services/prospectService";
import { addProspectNote, getProspectNotes, type ProspectNote } from "@/services/prospectNotesStore";
import { useToast } from "@/hooks/use-toast";

export default function Prospects() {
  const navigate = useNavigate();
  const { toast } = useToast();
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
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityProspect, setActivityProspect] = useState<ProspectDisplay | null>(null);
  const [activityFilter, setActivityFilter] = useState("All Activities");
  const [prospectDetails, setProspectDetails] = useState<Prospect | null>(null);
  const [prospectNotes, setProspectNotes] = useState<ProspectNote[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [showAddNoteInActivity, setShowAddNoteInActivity] = useState(false);
  const [activityNoteText, setActivityNoteText] = useState("");
  const openNoteModal = (prospect: ProspectDisplay) => {
    setNoteProspect(prospect);
    setNoteText("");
    setNoteModalOpen(true);
  };

  const openActivityModal = async (prospect: ProspectDisplay) => {
    setActivityProspect(prospect);
    setActivityFilter("All Activities");
    setLoadingActivity(true);
    setActivityModalOpen(true);
    setShowAddNoteInActivity(false);
    setActivityNoteText("");
    
    try {
      const details = await getProspectById(prospect.id);
      const notes = getProspectNotes(prospect.id);
      setProspectDetails(details);
      setProspectNotes(notes);
    } catch (error) {
      console.error("Error loading prospect activity:", error);
      toast({
        title: "Error",
        description: "Failed to load activity timeline.",
        variant: "destructive",
      });
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleSaveNote = () => {
    if (!noteProspect || !noteText.trim()) return;
    addProspectNote({
      prospectId: noteProspect.id,
      content: noteText.trim(),
      author: "You",
    });
    console.log("Saved note for prospect:", noteProspect.id, noteText);
    toast({
      title: "Note added",
      description: `Your note was added for ${noteProspect.name}.`,
    });
    
    // Refresh activity modal if it's open for the same prospect
    if (activityModalOpen && activityProspect?.id === noteProspect.id) {
      const notes = getProspectNotes(noteProspect.id);
      setProspectNotes(notes);
    }
    
    setNoteModalOpen(false);
    setNoteProspect(null);
    setNoteText("");
  };

  const handleSaveNoteInActivity = () => {
    if (!activityProspect || !activityNoteText.trim()) return;
    addProspectNote({
      prospectId: activityProspect.id,
      content: activityNoteText.trim(),
      author: "You",
    });
    toast({
      title: "Note added",
      description: `Your note was added for ${activityProspect.name}.`,
    });
    
    // Refresh notes list
    const notes = getProspectNotes(activityProspect.id);
    setProspectNotes(notes);
    
    // Reset form and hide it
    setActivityNoteText("");
    setShowAddNoteInActivity(false);
    
    // Switch to "All Activities" to show the new note
    setActivityFilter("All Activities");
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
    if (stageFilter !== "All Stages") {
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

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "All Stages": prospects.length,
      "User Profile Created": prospects.length,
      "Basic Information Completed": 0,
      "Company Profile Completed": 0,
      "Compliance Declarations Completed": 0,
      "MSA Signed": 0,
      "Employee Added": 0,
    };

    prospects.forEach((prospect) => {
      if (prospect.basicInfoCompleted) counts["Basic Information Completed"]++;
      if (prospect.companyInfoCompleted) counts["Company Profile Completed"]++;
      if (prospect.complianceCompleted) counts["Compliance Declarations Completed"]++;
      if (prospect.msaSigned) counts["MSA Signed"]++;
      if (prospect.employeeAdded) counts["Employee Added"]++;
    });

    return counts;
  }, [prospects]);

  const stageOptions = useMemo(
    () => [
      { label: "All Stages", count: stageCounts["All Stages"] ?? 0 },
      { label: "User Profile Created", count: stageCounts["User Profile Created"] ?? 0 },
      { label: "Basic Information Completed", count: stageCounts["Basic Information Completed"] ?? 0 },
      { label: "Company Profile Completed", count: stageCounts["Company Profile Completed"] ?? 0 },
      { label: "Compliance Declarations Completed", count: stageCounts["Compliance Declarations Completed"] ?? 0 },
      { label: "MSA Signed", count: stageCounts["MSA Signed"] ?? 0 },
      { label: "Employee Added", count: stageCounts["Employee Added"] ?? 0 },
    ],
    [stageCounts]
  );

  const filteredCountLabel = `Showing ${filteredProspects.length} prospect${filteredProspects.length === 1 ? "" : "s"}`;

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
          <DropdownMenuContent align="end" className="w-[260px]">
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
            {stageOptions.map(({ label, count }) => (
              <DropdownMenuItem
                key={label}
                onClick={() => setStageFilter(label)}
                className="cursor-pointer text-sm py-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{label} ({count})</span>
                  {stageFilter === label && (
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
          <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500 border-b border-slate-100">
            {filteredCountLabel}
          </div>
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
                                  openActivityModal(prospect);
                                }}
                                className="cursor-pointer text-sm py-2 text-slate-800"
                              >
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-slate-800" />
                                  <span>View Activity</span>
                                </div>
                              </DropdownMenuItem>
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

      {/* Activity Timeline Modal */}
      <Dialog 
        open={activityModalOpen} 
        onOpenChange={(open) => {
          setActivityModalOpen(open);
          if (!open) {
            setShowAddNoteInActivity(false);
            setActivityNoteText("");
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Activity Timeline - {activityProspect?.name || "Unknown"}
            </DialogTitle>
          </DialogHeader>
          
          {/* Filter Dropdown */}
          <div className="mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {activityFilter}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full">
                {["All Activities", "Notes Only", "System Only", "Status Changes Only"].map((filter) => (
                  <DropdownMenuItem
                    key={filter}
                    onClick={() => {
                      setActivityFilter(filter);
                      if (filter !== "Notes Only") {
                        setShowAddNoteInActivity(false);
                        setActivityNoteText("");
                      }
                    }}
                    className="cursor-pointer text-sm py-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{filter}</span>
                      {activityFilter === filter && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Activity Timeline Content */}
          <div className="mt-4">
            {loadingActivity ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Loading activities...
              </div>
            ) : (() => {
              // Build activities list
              type Activity = {
                id: string;
                type: "system" | "note" | "status";
                title: string;
                description: string;
                actor: string;
                actorEmail: string;
                date: Date | null;
                dateLabel: string;
              };

              const activities: Activity[] = [];

              if (prospectDetails) {
                const getTimeAgo = (dateString: string | null): string => {
                  if (!dateString) return "Never";
                  const date = new Date(dateString);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  
                  if (diffDays === 0) return "Today";
                  if (diffDays === 1) return "1 day ago";
                  if (diffDays < 30) return `${diffDays} days ago`;
                  if (diffDays < 365) {
                    const months = Math.floor(diffDays / 30);
                    return months === 1 ? "1 month ago" : `about ${months} month${months > 1 ? 's' : ''} ago`;
                  }
                  const years = Math.floor(diffDays / 365);
                  return years === 1 ? "1 year ago" : `${years} years ago`;
                };

                // System events
                if (prospectDetails.created_at) {
                  activities.push({
                    id: "signup",
                    type: "system",
                    title: "Sign Up",
                    description: "Created account via website",
                    actor: "System",
                    actorEmail: "system@company.com",
                    date: new Date(prospectDetails.created_at),
                    dateLabel: getTimeAgo(prospectDetails.created_at),
                  });
                }

                // Product Usage - derive from completion flags
                const getProductUsage = () => {
                  if (prospectDetails.onboarding_completed) return "Employee Added";
                  if (prospectDetails.compliance_completed) return "Compliance Declarations Completed";
                  if (prospectDetails.msa_signed) return "MSA Signed";
                  if (prospectDetails.address_completed) return "Address Completed";
                  if (prospectDetails.company_info_completed) return "Company Profile Completed";
                  if (prospectDetails.basic_info_completed) return "Basic Information Completed";
                  return "User Profile Created";
                };

                const productUsage = getProductUsage();
                if (productUsage) {
                  activities.push({
                    id: "product-usage",
                    type: "system",
                    title: "Product Usage",
                    description: productUsage,
                    actor: "System",
                    actorEmail: "system@company.com",
                    date: prospectDetails.created_at ? new Date(prospectDetails.created_at) : null,
                    dateLabel: getTimeAgo(prospectDetails.created_at),
                  });
                }

                // Status changes
                if (prospectDetails.msa_signed) {
                  activities.push({
                    id: "msa-signed",
                    type: "status",
                    title: "MSA Signed",
                    description: "Master Service Agreement executed",
                    actor: "System",
                    actorEmail: "system@company.com",
                    date: prospectDetails.created_at ? new Date(prospectDetails.created_at) : null,
                    dateLabel: getTimeAgo(prospectDetails.created_at),
                  });
                }

                if (prospectDetails.compliance_completed) {
                  activities.push({
                    id: "compliance",
                    type: "status",
                    title: "Compliance Completed",
                    description: "Compliance declarations completed",
                    actor: "System",
                    actorEmail: "system@company.com",
                    date: prospectDetails.created_at ? new Date(prospectDetails.created_at) : null,
                    dateLabel: getTimeAgo(prospectDetails.created_at),
                  });
                }

                // Notes
                prospectNotes.forEach((note) => {
                  activities.push({
                    id: note.id,
                    type: "note",
                    title: "Note",
                    description: note.content,
                    actor: note.author || "Unknown",
                    actorEmail: note.author === "You" ? "you@company.com" : `${note.author.toLowerCase().replace(/\s+/g, '.')}@company.com`,
                    date: note.createdAt ? new Date(note.createdAt) : null,
                    dateLabel: getTimeAgo(note.createdAt),
                  });
                });
              }

              // Sort by date (newest first)
              activities.sort((a, b) => {
                if (a.date && b.date) {
                  return b.date.getTime() - a.date.getTime();
                }
                if (a.date) return -1;
                if (b.date) return 1;
                return 0;
              });

              // Filter activities
              const filteredActivities = activities.filter((activity) => {
                if (activityFilter === "All Activities") return true;
                if (activityFilter === "Notes Only") return activity.type === "note";
                if (activityFilter === "System Only") return activity.type === "system";
                if (activityFilter === "Status Changes Only") return activity.type === "status";
                return true;
              });

              // Empty states
              if (filteredActivities.length === 0) {
                if (activityFilter === "Notes Only") {
                  return (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-4">No activity recorded yet</p>
                      {!showAddNoteInActivity ? (
                        <Button
                          onClick={() => setShowAddNoteInActivity(true)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white"
                        >
                          + Add Note
                        </Button>
                      ) : (
                        <div className="mt-4 space-y-3 text-left max-w-md mx-auto">
                          <Textarea
                            placeholder="Enter your note here..."
                            className="min-h-[120px] text-sm"
                            value={activityNoteText}
                            onChange={(e) => setActivityNoteText(e.target.value)}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowAddNoteInActivity(false);
                                setActivityNoteText("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-indigo-500 hover:bg-indigo-600 text-white"
                              onClick={handleSaveNoteInActivity}
                              disabled={!activityNoteText.trim()}
                            >
                              Save Note
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Bell className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">No activities found for this filter</p>
                    </div>
                  );
                }
              }

              // Render activities
              return (
                <div className="space-y-6">
                  {filteredActivities.map((activity, index) => {
                    const getInitials = (name: string) => {
                      return name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                    };

                    return (
                      <div key={activity.id} className="relative flex gap-4">
                        <div className="relative flex flex-col items-center">
                          <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                            activity.type === "system" 
                              ? "bg-slate-200 text-slate-700"
                              : activity.type === "note"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-200 text-slate-700"
                          }`}>
                            {activity.type === "system" ? (
                              <Bell className="h-5 w-5 text-slate-600" />
                            ) : (
                              getInitials(activity.actor)
                            )}
                          </div>
                          {index !== filteredActivities.length - 1 && (
                            <span className="absolute top-12 left-1/2 h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-slate-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-slate-900">{activity.actor}</span>
                                {activity.type === "system" && (
                                  <>
                                    <Bell className="h-3.5 w-3.5 text-slate-500" />
                                    <span className="text-xs text-slate-500">System</span>
                                  </>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mb-1">{activity.actorEmail}</p>
                              <p className="text-sm font-semibold text-slate-900 mb-0.5">{activity.title}</p>
                              <p className="text-xs text-slate-500">{activity.description}</p>
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap">{activity.dateLabel}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
