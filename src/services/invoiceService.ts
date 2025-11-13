import { supabase } from '../lib/supabase'

export interface Invoice {
  invoice_id: string
  org_legal_name: string
  date: string
  due_date: string | null
  amount: number
  tax_amount: number
  status: string
  currency: string
}

export const getAllInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('zoho_invoices')
    .select(
      'invoice_id, org_legal_name, date, due_date, amount, tax_amount, status, currency',
    )
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching invoices from Supabase:', error)
    throw error
  }

  return (data ?? []) as Invoice[]
}

