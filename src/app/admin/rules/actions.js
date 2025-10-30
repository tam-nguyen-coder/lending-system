'use server'

import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/**
 * Server Action to save/update rules
 */
export async function saveRulesAction(rules) {
  try {
    await requireAdmin()

    const supabase = await createServerClient()
    
    // Delete all existing rules
    await supabase.from('rules').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Insert new rules
    if (rules.length > 0) {
      // Filter out rules without a name (new empty rules)
      const validRules = rules.filter(rule => rule.name && rule.name.trim() !== '')
      
      if (validRules.length > 0) {
        const { error } = await supabase
          .from('rules')
          .insert(validRules)

        if (error) {
          return { success: false, error: 'Failed to save rules' }
        }
      }
    }

    revalidatePath('/admin/rules')

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message || 'Unauthorized' }
  }
}

