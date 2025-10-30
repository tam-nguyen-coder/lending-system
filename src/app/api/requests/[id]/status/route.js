import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Public API endpoint to get request status
 * Requires API key authentication
 */
export async function GET(request, { params }) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('x-api-key')
    const expectedApiKey = process.env.API_KEY

    if (!apiKey || !expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()
    
    const { data: request, error } = await supabase
      .from('requests')
      .select('id, status, type, amount')
      .eq('id', id)
      .single()

    if (error || !request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: request.status,
      type: request.type,
      amount: request.amount,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

