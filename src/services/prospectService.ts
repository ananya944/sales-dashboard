import { supabase } from '../lib/supabase';

export interface Prospect {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  last_login_at: string | null;
  organization_id: string | null;
  basic_info_completed: boolean | null;
  company_info_completed: boolean | null;
  address_completed: boolean | null;
  compliance_completed: boolean | null;
  msa_signed: boolean | null;
  onboarding_completed: boolean | null;
  organization?: {
    id: string;
    name: string;
    employee_count: string | number | null;
    phone: string | null;
    business_address: string | null;
    business_city: string | null;
    business_state: string | null;
    business_postal_code: string | null;
  } | null;
}

export interface ProspectDisplay {
  id: string;
  name: string;
  company: string;
  email: string;
  signupDate: string;
  lastActive: string;
  productUsage: string;
  organizationId: string | null;
  companyName?: string | null;
}

// Get onboarding progress label from completion flags
function getProductUsageLabel(profile: any): string {
  if (profile.onboarding_completed) return 'Employee Added';
  if (profile.compliance_completed) return 'Compliance Declarations Completed';
  if (profile.msa_signed) return 'MSA Signed';
  if (profile.address_completed) return 'Address Completed';
  if (profile.company_info_completed) return 'Company Profile Completed';
  if (profile.basic_info_completed) return 'Basic Information Completed';
  return 'User Profile Created';
}

// Calculate time ago from a date
function getTimeAgo(dateString: string | null): string {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

// Format date to DD/MM/YYYY
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function getProspects(): Promise<ProspectDisplay[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        created_at,
        last_login_at,
        organization_id,
        basic_info_completed,
        company_info_completed,
        address_completed,
        msa_signed,
        compliance_completed,
        onboarding_completed,
        organization:organizations (
          id,
          name,
          employee_count
        )
      `)
      .or('setup_completed.is.null,setup_completed.eq.false')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    console.log('✅ Raw prospects fetched from Supabase:', data)

    const prospects: ProspectDisplay[] = (data || []).map((profile: any) => {
      const fullName = [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(' ') || profile.email.split('@')[0] || 'Unknown User'

      return {
        id: profile.id,
        name: fullName,
        company: profile.organization?.name || 'No Company',
        email: profile.email,
        signupDate: formatDate(profile.created_at),
        lastActive: getTimeAgo(profile.last_login_at),
        productUsage: getProductUsageLabel(profile),
        organizationId: profile.organization_id,
        companyName: profile.organization?.name ?? null,
      }
    })

    console.log('✅ Normalized prospects:', prospects)

    return prospects
  } catch (error) {
    console.error('Error fetching prospects:', error)
    throw error
  }
}

export async function getProspectById(id: string): Promise<Prospect | null> {
  try {
    let { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        created_at,
        last_login_at,
        organization_id,
        basic_info_completed,
        company_info_completed,
        address_completed,
        msa_signed,
        compliance_completed,
        onboarding_completed,
        organization:organizations (
          id,
          name,
          employee_count,
          phone,
          business_address,
          business_city,
          business_state,
          business_postal_code
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Supabase error fetching prospect:', error)
      throw error
    }

    let normalized: any = data

    if (Array.isArray(normalized?.organization)) {
      normalized = {
        ...normalized,
        organization: normalized.organization[0] ?? null,
      }
    }

    normalized = {
      ...normalized,
      onboarding_completed: normalized?.onboarding_completed ?? false,
    }

    if (normalized?.organization_id && !normalized?.organization) {
      try {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, employee_count, phone, business_address, business_city, business_state, business_postal_code')
          .eq('id', normalized.organization_id)
          .single()

        if (!orgError && orgData) {
          normalized = {
            ...normalized,
            organization: orgData,
          }
        }
      } catch (orgFetchError) {
        console.warn('⚠️ Unable to fetch organization details:', orgFetchError)
      }
    }

    console.log('✅ Prospect detail fetched:', normalized)

    return normalized as Prospect
  } catch (error) {
    console.error('💥 Fatal error fetching prospect by ID:', error)
    throw error
  }
}