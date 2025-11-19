import { supabase } from '../lib/supabase';

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string;
  department: string;
  employment_type: string;
  salary: number | null;
  start_date: string;
  status: string | null;
  organization_id: string;
  currency: string | null;
  seniority: string | null;
  work_location: string | null;
  billable?: boolean | null;
}

export const getEmployeesByOrganization = async (organizationId: string): Promise<Employee[]> => {
  try {
    console.log('Fetching employees for organization:', organizationId);
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('Employees fetched:', data?.length || 0);
    return data as Employee[];
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    console.log('Fetching all employees...');
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('All employees fetched:', data?.length || 0);
    return data as Employee[];
  } catch (error) {
    console.error('Error fetching all employees:', error);
    throw error;
  }
};

export const getEmployeeById = async (employeeId: string): Promise<Employee> => {
  try {
    console.log('Fetching employee with ID:', employeeId);
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (error) {
      console.error('Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('Employee fetched:', data);
    return data as Employee;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
};

export const createEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
  try {
    console.log('Creating new employee:', employeeData);
    
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating employee:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('Employee created successfully:', data);
    return data as Employee;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

export const updateEmployee = async (employeeId: string, updates: Partial<Employee>): Promise<Employee> => {
  try {
    const updateData = updates;
    
    console.log('Attempting to update employee:', {
      employeeId,
      updateFields: updateData,
      timestamp: new Date().toISOString()
    });

    console.log('=== SENDING TO SUPABASE ===');
    console.log('Employee ID:', employeeId);
    console.log('Update Data:', JSON.stringify(updateData, null, 2));
    console.log('Status value:', updateData.status, 'Type:', typeof updateData.status);
    console.log('Seniority value:', updateData.seniority);
    console.log('Work Location value:', updateData.work_location);

    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', employeeId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating employee:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: error,
        employeeId,
        attemptedUpdates: updates
      });
      throw error;
    }

    console.log('Employee updated successfully:', data);
    return data as Employee;
  } catch (error: any) {
    console.error('Error updating employee - Full details:', {
      errorCode: error?.code,
      errorMessage: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint,
      employeeId,
      updateData: updates,
      fullErrorObject: error,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

