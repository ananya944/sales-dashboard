import { supabase } from '../lib/supabase'

export async function getAllOrganizations() {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching organizations:', error)
    throw error
  }
}

export async function getOrganizationById(id: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching organization by ID:', error)
    throw error
  }
}

export async function updateOrganization(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error updating organization:', error)
    throw error
  }
}

