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
    // Log the data being sent to Supabase
    console.log('Attempting to update organization:', {
      organizationId: id,
      updateFields: updates,
      timestamp: new Date().toISOString()
    })

    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Log full error details from Supabase
      console.error('Supabase error updating organization:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: error,
        organizationId: id,
        attemptedUpdates: updates
      })
      throw error
    }

    return data
  } catch (error: any) {
    // Log comprehensive error information
    console.error('Error updating organization - Full details:', {
      errorCode: error?.code,
      errorMessage: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint,
      organizationId: id,
      updateData: updates,
      fullErrorObject: error,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}

