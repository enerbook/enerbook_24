/**
 * API Configuration Constants
 * Centralized configuration for API endpoints, payment methods, and error messages
 */

// HTTP Configuration
export const HTTP_CONFIG = {
  METHOD: {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE'
  },
  HEADERS: {
    CONTENT_TYPE_JSON: 'application/json'
  }
};

// Payment Webhook Endpoints
export const PAYMENT_ENDPOINTS = {
  UPFRONT: '/webhook/payment-upfront',
  MILESTONES_SETUP: '/webhook/payment-milestones-setup',
  MILESTONE_COMPLETE: '/webhook/milestone-complete',
  MILESTONE_PAY: '/webhook/milestone-pay'
};

// Payment Methods
export const PAYMENT_METHODS = {
  UPFRONT: 'upfront',
  MILESTONES: 'milestones',
  CARD: 'card',
  TRANSFER: 'transfer'
};

// Error Messages
export const ERROR_MESSAGES = {
  PAYMENT_CREATION_FAILED: 'Payment creation failed',
  MILESTONE_SETUP_FAILED: 'Milestone setup failed',
  MILESTONE_COMPLETE_FAILED: 'Failed to mark milestone complete',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_RESPONSE: 'Invalid response from server'
};