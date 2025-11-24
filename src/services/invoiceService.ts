import { supabase } from '../lib/supabase'

export interface Invoice {
  invoice_id: string
  org_legal_name: string
  date: string
  due_date?: string | null
  amount: number
  tax_amount?: number
  status: string
  currency?: string
  preview_link?: string | null
  download_link?: string | null
}

export const getAllInvoices = async (): Promise<Invoice[]> => {
  try {
    // Select all columns - Supabase will return what exists
    const { data, error } = await supabase
      .from('zoho_invoices')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching invoices from Supabase:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw error
    }

    console.log('✅ Successfully fetched invoices:', data?.length || 0, 'records')
    if (data && data.length > 0) {
      console.log('Sample invoice:', data[0])
    }
    
    return (data ?? []) as Invoice[]
  } catch (err) {
    console.error('Failed to fetch invoices:', err)
    throw err
  }
}

