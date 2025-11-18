import { supabase } from "@/lib/supabase";

export interface Subscription {
  id: string;
  client_id: string;
  plan: string;
  status: "active" | "paused" | "cancelled";
  billing_cycle: string;
  eor_fee_per_employee: number;
  invoice_currency: string;
  fx_base_rate: number;
  fx_spread: number;
  gst_on_eor_fee: boolean;
  employee_count: number;
  monthly_payroll_inr: number;
  monthly_eor_fee: number;
  start_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubscriptionInput {
  client_id: string;
  plan: string;
  status: "active" | "paused" | "cancelled";
  billing_cycle: string;
  eor_fee_per_employee: number;
  invoice_currency: string;
  fx_base_rate: number;
  fx_spread: number;
  gst_on_eor_fee: boolean;
  employee_count: number;
  monthly_payroll_inr: number;
  monthly_eor_fee: number;
  start_date: string;
}

export async function createSubscription(
  subscription: CreateSubscriptionInput
): Promise<Subscription> {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert([subscription])
      .select()
      .single();

    if (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }

    return data as Subscription;
  } catch (error) {
    console.error("Error in createSubscription:", error);
    throw error;
  }
}

export async function getSubscriptionsByClient(
  clientId: string
): Promise<Subscription[]> {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }

    return (data || []) as Subscription[];
  } catch (error) {
    console.error("Error in getSubscriptionsByClient:", error);
    throw error;
  }
}

export async function getSubscriptionById(
  subscriptionId: string
): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching subscription:", error);
      throw error;
    }

    return data as Subscription;
  } catch (error) {
    console.error("Error in getSubscriptionById:", error);
    throw error;
  }
}

