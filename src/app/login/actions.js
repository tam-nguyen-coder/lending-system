'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
}

