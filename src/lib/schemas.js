/**
 * Zod schemas for validation
 */

import { z } from 'zod'

// Request submission schema
export const requestSubmissionSchema = z.object({
  type: z.enum(['expense', 'loan'], {
    required_error: 'Request type is required',
  }),
  amount: z.number({
    required_error: 'Amount is required',
  }).positive('Amount must be greater than 0'),
  reason: z.string({
    required_error: 'Reason is required',
  }).min(1, 'Reason cannot be empty').max(1000, 'Reason is too long'),
})

/**
 * @typedef {Object} RequestSubmissionInput
 * @property {'expense' | 'loan'} type
 * @property {number} amount
 * @property {string} reason
 */

// Rule update schema
export const ruleUpdateSchema = z.object({
  id: z.string().uuid('Invalid rule ID'),
  name: z.string().min(1, 'Rule name is required'),
  priority: z.number().int().min(0, 'Priority must be non-negative'),
  conditions: z.record(z.any()),
  event: z.record(z.any()),
})

/**
 * @typedef {Object} RuleUpdateInput
 * @property {string} id
 * @property {string} name
 * @property {number} priority
 * @property {Object} conditions
 * @property {Object} event
 */

