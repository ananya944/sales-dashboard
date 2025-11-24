import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building, Mail, Phone, MapPin, Calendar, Clock, Users, Check, CalendarDays, UserPlus, FileText, Briefcase, Globe } from "lucide-react";
import { getProspectById, type Prospect } from "@/services/prospectService";
import { hasEmployeesForOrganization } from "@/services/employeeService";
import { getProspectNotes, type ProspectNote } from "@/services/prospectNotesStore";
import { format } from "date-fns";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function ProspectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("progress");
  const [prospectNotes, setProspectNotes] = useState<ProspectNote[]>([]);
  const [hasEmployees, setHasEmployees] = useState(false);

  useEffect(() => {
    async function loadProspect() {
      if (!id) {
        setError("Prospect ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getProspectById(id);

        if (!data) {
          setError("Prospect not found");
          setLoading(false);
          return;
        }

        setProspect(data);
      } catch (err) {
        console.error("Error loading prospect:", err);
        setError("Failed to load prospect details");
      } finally {
        setLoading(false);
      }
    }

    loadProspect();
  }, [id]);

  useEffect(() => {
    if (!prospect?.id) return;
    const notes = getProspectNotes(prospect.id);
    setProspectNotes(notes);
  }, [prospect?.id]);

  useEffect(() => {
    const checkEmployees = async () => {
      if (!prospect?.organization_id && !prospect?.organization?.id) {
        setHasEmployees(false);
        return;
      }

      const hasEmployeeRecords = await hasEmployeesForOrganization(
        prospect.organization_id || prospect.organization?.id || null
      );
      setHasEmployees(hasEmployeeRecords);
    };

    checkEmployees();
  }, [prospect?.organization_id, prospect?.organization?.id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-slate-500">Loading prospect details...</span>
      </div>
    );
  }

  if (error || !prospect) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/prospects")} className="gap-2">
          ← Back to Prospects
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-slate-500">{error || "Prospect not found"}</CardContent>
        </Card>
      </div>
    );
  }

  const fullName = [prospect.first_name, prospect.last_name]
    .filter(Boolean)
    .join(" ") || prospect.email.split("@")[0] || "Unknown User";

  const companyName = prospect.organization?.name || "Not provided";
  const contactPhone = prospect.phone || prospect.organization?.phone || "Not provided";
  const rawEmployeeCount = prospect.organization?.employee_count;
  
  // Format company size to match design (e.g., "50-100 employees")
  const formatCompanySize = (count: string | number | null): string => {
    if (count == null || count === "") return "Not provided";
    const countStr = String(count);
    // If it already contains a range or "employees", return as is
    if (countStr.includes("-") || countStr.toLowerCase().includes("employee")) {
      return countStr;
    }
    // Otherwise, format as "X employees"
    return `${countStr} employees`;
  };
  
  const companySize = formatCompanySize(rawEmployeeCount ?? null);

  const organizationLocation = prospect.organization
    ? [
        prospect.organization.business_address,
        prospect.organization.business_city,
        prospect.organization.business_state,
        prospect.organization.business_postal_code,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const formattedAddress = organizationLocation || "Not provided";
  const companyWebsite = prospect.organization?.website || null;
  const companyIndustry = prospect.organization?.industry || null;
  
  // Format address for contact details (same as organization location)
  const contactAddress = formattedAddress;

  const timelineEvents = (() => {
    type TimelineEvent = {
      title: string;
      description: string;
      dateValue: Date | null;
      dateLabel: string;
      order: number;
    };

    const events: TimelineEvent[] = [];

    const formatLabel = (dateString: string | null) =>
      dateString ? format(new Date(dateString), "MMM d, yyyy") : "Date unavailable";

    const pushEvent = (title: string, description: string, dateString: string | null, order: number) => {
      events.push({
        title,
        description,
        dateValue: dateString ? new Date(dateString) : null,
        dateLabel: formatLabel(dateString),
        order,
      });
    };

    pushEvent("Sign Up", "Created account via website", prospect.created_at, 1);

    if (prospect.basic_info_completed) {
      pushEvent("Basic Information Completed", "Personal and contact details provided", prospect.created_at, 2);
    }

    if (prospect.company_info_completed) {
      pushEvent("Company Profile Completed", "Company information and details added", prospect.created_at, 3);
    }

    if (prospect.address_completed) {
      pushEvent("Address Completed", "Business address submitted", prospect.created_at, 4);
    }

    if (prospect.compliance_completed) {
      pushEvent("Compliance Completed", "Compliance declarations completed", prospect.created_at, 5);
    }

    if (prospect.msa_signed) {
      pushEvent("MSA Signed", "Master Service Agreement executed", prospect.created_at, 6);
    }

    if (prospect.onboarding_completed) {
      pushEvent("Onboarding Completed", "Employee added", prospect.created_at, 7);
    }

    if (prospect.last_login_at) {
      pushEvent("Last Active", "Last seen in product", prospect.last_login_at, 99);
    }

    if (prospectNotes.length) {
      prospectNotes.forEach((note, index) => {
        events.push({
          title: `Note by ${note.author || "Unknown user"}`,
          description: note.content,
          dateValue: note.createdAt ? new Date(note.createdAt) : null,
          dateLabel: formatLabel(note.createdAt),
          order: 150 + index,
        });
      });
    }

    events.sort((a, b) => {
      if (a.dateValue && b.dateValue) {
        const diff = b.dateValue.getTime() - a.dateValue.getTime();
        if (diff !== 0) return diff;
      } else if (a.dateValue && !b.dateValue) {
        return -1;
      } else if (!a.dateValue && b.dateValue) {
        return 1;
      }
      return a.order - b.order;
    });

    return events;
  })();

  const onboardingSteps: OnboardingStep[] = [
    {
      id: "profile",
      title: "User Profile Created",
      description: "Basic account setup completed",
      completed: true,
    },
    {
      id: "basic_info",
      title: "Basic Information Completed",
      description: "Personal and contact details provided",
      completed: prospect.basic_info_completed || false,
    },
    {
      id: "company_info",
      title: "Company Profile Completed",
      description: "Company information and details added",
      completed: prospect.company_info_completed || false,
    },
    {
      id: "compliance",
      title: "Compliance Declarations Completed",
      description: "Legal and compliance requirements met",
      completed: prospect.compliance_completed || false,
    },
    {
      id: "msa",
      title: "MSA Signed",
      description: "Master Service Agreement executed",
      completed: prospect.msa_signed || false,
    },
    {
      id: "employee",
      title: "Employee Added",
      description: "First employee added to the system",
      completed: hasEmployees,
    },
  ];

  const completedSteps = onboardingSteps.filter((step) => step.completed).length;
  const progressPercent = Math.round((completedSteps / onboardingSteps.length) * 100);

  const signupDate = new Date(prospect.created_at);
  const daysSinceSignup = Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/prospects">Prospects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{fullName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{fullName}</h1>
          <div className="mt-2 flex items-center gap-2 text-slate-600">
            <Building className="h-4 w-4" />
            <span>{companyName}</span>
          </div>
        </div>
        {prospect.msa_signed && (
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            onClick={() =>
              navigate(`/clients/${prospect.id}/new-subscription`, {
                state: { from: "prospects" },
              })
            }
          >
            <UserPlus className="h-4 w-4" />
            Onboard as Client
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <a href={`mailto:${prospect.email}`} className="text-sm text-blue-600 hover:text-blue-700">
                  {prospect.email}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm text-slate-900">{contactPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-50 p-2">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm text-slate-900">{formattedAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-50 p-2">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Days Since Signup</p>
                <p className="text-2xl font-bold text-slate-900">{daysSinceSignup}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-cyan-50 p-2">
                <Clock className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Active</p>
                <p className="text-lg font-semibold text-slate-900">{getTimeAgo(prospect.last_login_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-indigo-50 p-2">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Company Size</p>
                <p className="text-sm text-slate-900">{companySize}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {completedSteps} of {onboardingSteps.length} steps completed
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>

              <div className="space-y-8">
                {onboardingSteps.map((step, index) => (
                  <div key={step.id} className="relative flex items-start gap-4">
                    <div className="relative flex flex-col items-center">
                      {step.completed ? (
                        <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 bg-white" />
                      )}
                      {index < onboardingSteps.length - 1 && (
                        <div className="absolute top-6 left-1/2 h-12 w-0.5 -translate-x-1/2 bg-slate-200" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <h4 className="mb-1 text-sm font-bold text-slate-900">{step.title}</h4>
                      <p className="text-sm text-slate-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <FileText className="h-5 w-5" />
                  <CardTitle className="text-xl font-semibold">Company Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company Name</dt>
                    <dd className="text-sm font-medium text-slate-900">{companyName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Industry</dt>
                    <dd className="text-sm text-slate-900">{companyIndustry || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company Size</dt>
                    <dd className="text-sm text-slate-900">{companySize}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Website</dt>
                    <dd className="text-sm text-slate-900">
                      {companyWebsite ? (
                        <a 
                          href={companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          {companyWebsite}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <Briefcase className="h-5 w-5" />
                  <CardTitle className="text-xl font-semibold">Contact Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</dt>
                    <dd className="text-sm font-medium text-slate-900">{fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email Address</dt>
                    <dd className="text-sm">
                      <a href={`mailto:${prospect.email}`} className="text-blue-600 hover:text-blue-700">
                        {prospect.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</dt>
                    <dd className="text-sm text-slate-900">{contactPhone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</dt>
                    <dd className="text-sm text-slate-900">{contactAddress}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <FileText className="h-5 w-5" />
                  <CardTitle className="text-xl font-semibold">Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {prospectNotes.length === 0 ? (
                  <p className="text-sm text-slate-500">No notes have been added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {prospectNotes.map((note) => (
                      <div key={note.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-semibold text-slate-900">{note.author}</span>
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {format(new Date(note.createdAt), "MMM d, yyyy • h:mm a")}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-slate-900">
                <CalendarDays className="h-5 w-5" />
                <CardTitle className="text-xl font-semibold">Activity Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {timelineEvents.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No activity recorded yet.</p>
              ) : (
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => (
                    <div key={`${event.title}-${index}`} className="relative flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <span className="mt-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-blue-600" />
                        {index !== timelineEvents.length - 1 && (
                          <span className="absolute top-4 left-1/2 h-[calc(100%-0.5rem)] w-px -translate-x-1/2 bg-slate-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                            <p className="text-xs text-slate-500">{event.description}</p>
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{event.dateLabel}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

