/**
 * Type definitions for the Internal Approval System
 */

export const RequestType = {
  EXPENSE: 'expense',
  LOAN: 'loan',
}

export const RequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const UserRole = {
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
}

/**
 * @typedef {Object} Profile
 * @property {string} id - User ID (UUID)
 * @property {string} email - User email
 * @property {string} role - User role (employee or admin)
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} Request
 * @property {string} id - Request ID (UUID)
 * @property {string} user_id - User ID (UUID)
 * @property {string} type - Request type (expense or loan)
 * @property {number} amount - Request amount
 * @property {string} reason - Request reason
 * @property {string} status - Request status (pending, approved, rejected)
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Rule
 * @property {string} id - Rule ID (UUID)
 * @property {string} name - Rule name
 * @property {number} priority - Execution priority
 * @property {Object} conditions - Rule conditions (jsonb)
 * @property {Object} event - Rule event (jsonb)
 */

/**
 * @typedef {Object} ActionResponse
 * @property {boolean} success - Whether the action succeeded
 * @property {*} [data] - Success data
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} RequestFormData
 * @property {string} type - Request type (expense or loan)
 * @property {number} amount - Request amount
 * @property {string} reason - Request reason
 */

