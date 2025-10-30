/**
 * Rules Engine Integration
 * Uses json-rules-engine to process requests based on dynamic business rules
 */

import { Engine, Rule } from 'json-rules-engine'
import { createServerClient } from './supabase/server'

/**
 * Default approval rules (used if no rules exist in database)
 */
const DEFAULT_RULES = [
  {
    name: 'Auto-approve small expenses',
    priority: 10,
    conditions: {
      all: [
        {
          fact: 'amount',
          operator: 'lessThan',
          value: 100,
        },
        {
          fact: 'type',
          operator: 'equal',
          value: 'expense',
        },
      ],
    },
    event: {
      type: 'auto-approve',
      params: {
        message: 'Auto-approved: small expense',
      },
    },
  },
  {
    name: 'Auto-approve small loans',
    priority: 10,
    conditions: {
      all: [
        {
          fact: 'amount',
          operator: 'lessThan',
          value: 500,
        },
        {
          fact: 'type',
          operator: 'equal',
          value: 'loan',
        },
      ],
    },
    event: {
      type: 'auto-approve',
      params: {
        message: 'Auto-approved: small loan',
      },
    },
  },
]

/**
 * Fetch active rules from the database
 */
async function fetchRules() {
  try {
    const supabase = await createServerClient()
    
    const { data: rules, error } = await supabase
      .from('rules')
      .select('*')
      .order('priority', { ascending: false })

    if (error || !rules || rules.length === 0) {
      console.warn('No rules found in database, using default rules')
      return DEFAULT_RULES
    }

    return rules
  } catch (error) {
    console.error('Error fetching rules:', error)
    return DEFAULT_RULES
  }
}

/**
 * Process a request through the rules engine
 * @param {Object} requestData - The request data including amount, type, user info
 * @returns {Promise<Object>} - The result with status and message
 */
export async function processRequestWithRules(requestData) {
  try {
    // Fetch active rules
    const rules = await fetchRules()

    // Create engine and add rules
    const engine = new Engine()

    for (const rule of rules) {
      engine.addRule(
        new Rule({
          conditions: rule.conditions,
          event: rule.event,
          priority: rule.priority,
          name: rule.name,
        })
      )
    }

    // Prepare facts for the engine
    const facts = {
      amount: requestData.amount,
      type: requestData.type,
      user_role: requestData.user_role,
    }

    // Run the engine
    const { events } = await engine.run(facts)

    // Determine the result based on events
    if (events.length > 0) {
      const event = events[0] // Use the highest priority event
      
      if (event.type === 'auto-approve') {
        return {
          status: 'approved',
          message: event.params?.message || 'Auto-approved by rule engine',
        }
      } else if (event.type === 'auto-reject') {
        return {
          status: 'rejected',
          message: event.params?.message || 'Auto-rejected by rule engine',
        }
      }
    }

    // Default to pending if no rules matched
    return {
      status: 'pending',
      message: 'Requires admin review',
    }
  } catch (error) {
    console.error('Error processing rules:', error)
    
    // On error, default to pending
    return {
      status: 'pending',
      message: 'Error processing rules, requires admin review',
    }
  }
}

