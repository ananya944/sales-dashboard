import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, User, Edit, Building, Mail, Phone, MapPin, Calendar, Wallet, FileText, Briefcase } from "lucide-react";
import { getEmployeeById, updateEmployee } from "@/services/employeeService";
import { getOrganizationById } from "@/services/organizationService";
import { EditEmployeeModal } from "@/components/modals/EditEmployeeModal";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "@/services/employeeService";

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadEmployeeDetails() {
      if (!id) {
        setError("Employee ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const employeeData = await getEmployeeById(id);
        setEmployee(employeeData);

        // Fetch organization details
        if (employeeData.organization_id) {
          const orgData = await getOrganizationById(employeeData.organization_id);
          setOrganization(orgData);
        }
      } catch (err) {
        console.error('Error loading employee details:', err);
        setError(err instanceof Error ? err.message : "Failed to load employee details");
      } finally {
        setLoading(false);
      }
    }

    loadEmployeeDetails();
  }, [id]);

  // Handle employee update
  const handleUpdateEmployee = async (updates: any) => {
    if (!id) return;
    
    try {
      await updateEmployee(id, updates);
      
      // Refresh employee data
      const employeeData = await getEmployeeById(id);
      setEmployee(employeeData);
      
      toast({
        title: "✅ Employee updated successfully",
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "❌ Failed to update employee",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Employee Not Found</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/employees")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  const employeeName = `${employee.first_name} ${employee.last_name}`;
  // Database stores status with capital first letter, keep as is for display
  const status = employee.status || 'Active';

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/employees">Employees</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{employeeName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Employee Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{employeeName}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge variant={status.toLowerCase() as any}>{status}</StatusBadge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{employee.job_title}</span>
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
                Edit Employee
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {employee.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              {employee.phone || '-'}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Joined {new Date(employee.start_date).toLocaleDateString('en-GB')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Information Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">First Name</div>
              <div className="text-sm font-medium">{employee.first_name}</div>
              
              <div className="text-sm text-muted-foreground">Last Name</div>
              <div className="text-sm font-medium">{employee.last_name}</div>
              
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-sm font-medium">{employee.email}</div>
              
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="text-sm font-medium">{employee.phone || '-'}</div>
              
              <div className="text-sm text-muted-foreground">Employee ID</div>
              <div className="text-sm font-medium">{employee.employee_id}</div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Job Title</div>
              <div className="text-sm font-medium">{employee.job_title}</div>
              
              <div className="text-sm text-muted-foreground">Department</div>
              <div className="text-sm font-medium">{employee.department}</div>
              
              <div className="text-sm text-muted-foreground">Employment Type</div>
              <div className="text-sm font-medium">{employee.employment_type}</div>
              
              <div className="text-sm text-muted-foreground">Start Date</div>
              <div className="text-sm font-medium">
                {new Date(employee.start_date).toLocaleDateString('en-GB')}
              </div>
              
              <div className="text-sm text-muted-foreground">Seniority</div>
              <div className="text-sm font-medium">{employee.seniority || '-'}</div>
              
              <div className="text-sm text-muted-foreground">Work Location</div>
              <div className="text-sm font-medium">{employee.work_location || '-'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Organization</div>
              <div className="text-sm font-medium">
                {organization ? (
                  <Link 
                    to={`/clients/${organization.id}`}
                    className="text-primary hover:underline"
                  >
                    {organization.name}
                  </Link>
                ) : (
                  '-'
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">Organization ID</div>
              <div className="text-sm font-medium text-muted-foreground text-xs">
                {employee.organization_id}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary & Compensation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Salary & Compensation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Salary</div>
              <div className="text-sm font-medium">
                {employee.salary ? `₹${employee.salary.toLocaleString('en-IN')}` : '-'}
              </div>
              
              <div className="text-sm text-muted-foreground">Currency</div>
              <div className="text-sm font-medium">{employee.currency || 'INR'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Employee Modal */}
      {employee && (
        <EditEmployeeModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          employee={employee}
          onUpdate={handleUpdateEmployee}
        />
      )}
    </div>
  );
}

