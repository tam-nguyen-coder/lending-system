'use server'

import { createServerClient } from '@/lib/supabase/server'
import { requestSubmissionSchema } from '@/lib/schemas'
import { processRequestWithRules } from '@/lib/rules-engine'
import { revalidatePath } from 'next/cache'

/**
 * Server Action to submit a new request
 * Validates the input, processes it with the rules engine, and saves to database
 */
export async function submitRequestAction(formData) {
  try {
    // Validate input
    const validatedData = requestSubmissionSchema.parse(formData)

    // Get authenticated user
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'User profile not found' }
    }

    // Process request with rules engine
    const result = await processRequestWithRules({
      ...validatedData,
      user_id: user.id,
      user_role: profile.role,
    })

    // Save request to database
    const { data: request, error: saveError } = await supabase
      .from('requests')
      .insert({
        user_id: user.id,
        type: validatedData.type,
        amount: validatedData.amount,
        reason: validatedData.reason,
        status: result.status,
      })
      .select()
      .single()

    if (saveError) {
      return { success: false, error: 'Failed to save request' }
    }

    // Revalidate dashboard
    revalidatePath('/dashboard')

    return { success: true, data: request }
  } catch (error) {
    if (error.name === 'ZodError') {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: error.message || 'An error occurred' }
  }
}

