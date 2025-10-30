/**
 * Authentication utilities
 */

import { createServerClient } from './supabase/server'

/**
 * Get the current authenticated user
 * @returns {Promise<{user: any, profile: any}>}
 */
export async function getCurrentUser() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { user: null, profile: null }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { user, profile: null }
  }

  return { user, profile }
}

/**
 * Check if current user is an admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const { profile } = await getCurrentUser()
  return profile?.role === 'admin'
}

/**
 * Require admin access - throws if not admin
 * @throws {Error} If user is not an admin
 */
export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
}

