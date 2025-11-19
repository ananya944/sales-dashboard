import { supabase } from "@/lib/supabase";
import type { CreateOrganizationInput } from "@/types/organization";
import { getProspectById } from "@/services/prospectService";

export async function addClient(organization: CreateOrganizationInput) {
  const payload = {
    ...organization,
    is_active: organization.is_active ?? true,
  };

  // Remove empty string values so Supabase stores null instead
  Object.keys(payload).forEach((key) => {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim() === "") {
      (payload as Record<string, unknown>)[key] = null;
    }
  });

  const { data, error } = await supabase
    .from("organizations")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error inserting organization:", error);
    throw error;
  }

  return data;
}

export async function convertProspectToClient(prospectId: string): Promise<string> {
  try {
    // Fetch prospect data
    const prospect = await getProspectById(prospectId);
    
    if (!prospect) {
      throw new Error("Prospect not found");
    }

    // Check if prospect already has an organization
    if (prospect.organization_id) {
      // Check if organization exists and is active
      const { data: existingOrg, error: orgError } = await supabase
        .from("organizations")
        .select("id, is_active")
        .eq("id", prospect.organization_id)
        .single();

      if (!orgError && existingOrg) {
        // Organization exists, activate it if needed
        if (!existingOrg.is_active) {
          await supabase
            .from("organizations")
            .update({ is_active: true })
            .eq("id", existingOrg.id);
        }
        return existingOrg.id;
      }
    }

    // Create new organization from prospect data
    const orgData: any = {
      name: prospect.organization?.name || `${prospect.first_name || ''} ${prospect.last_name || ''}`.trim() || prospect.email.split('@')[0],
      email: prospect.email,
      phone: prospect.phone || prospect.organization?.phone || null,
      is_active: true,
    };

    // Copy organization data if it exists
    if (prospect.organization) {
      orgData.business_address = prospect.organization.business_address;
      orgData.business_city = prospect.organization.business_city;
      orgData.business_state = prospect.organization.business_state;
      orgData.business_postal_code = prospect.organization.business_postal_code;
      orgData.employee_count = prospect.organization.employee_count;
    }

    // Remove empty string values
    Object.keys(orgData).forEach((key) => {
      const value = orgData[key];
      if (typeof value === "string" && value.trim() === "") {
        orgData[key] = null;
      }
    });

    const { data: newClient, error: insertError } = await supabase
      .from("organizations")
      .insert([orgData])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating client from prospect:", insertError);
      throw insertError;
    }

    console.log("✅ Client created from prospect:", newClient.id);
    return newClient.id;
  } catch (error) {
    console.error("Error converting prospect to client:", error);
    throw error;
  }
}

