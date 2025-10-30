'use server'

import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/**
 * Server Action to update request status (admin only)
 */
export async function updateRequestStatusAction(requestId, newStatus) {
  try {
    await requireAdmin()

    const supabase = await createServerClient()
    
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', requestId)

    if (error) {
      return { success: false, error: 'Failed to update request' }
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message || 'Unauthorized' }
  }
}

