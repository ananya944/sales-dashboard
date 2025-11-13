import { supabase } from "@/lib/supabase";
import type { CreateOrganizationInput } from "@/types/organization";

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

