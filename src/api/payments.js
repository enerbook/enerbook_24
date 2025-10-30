import {
  HTTP_CONFIG,
  PAYMENT_ENDPOINTS,
  PAYMENT_METHODS,
  ERROR_MESSAGES
} from './config/constants';

const N8N_BASE_URL = process.env.EXPO_PUBLIC_N8N_WEBHOOK_BASE_URL || 'https://services.enerbook.mx';

// W1: Create upfront payment
export const createUpfrontPayment = async (proyectoData) => {
  const response = await fetch(`${N8N_BASE_URL}${PAYMENT_ENDPOINTS.UPFRONT}`, {
    method: HTTP_CONFIG.METHOD.POST,
    headers: {
      'Content-Type': HTTP_CONFIG.HEADERS.CONTENT_TYPE_JSON,
    },
    body: JSON.stringify({
      proyecto_id: proyectoData.id,
      cliente_id: proyectoData.cliente_id,
      instalador_id: proyectoData.instalador_id,
      total_amount: proyectoData.costo_total,
      payment_method: PAYMENT_METHODS.UPFRONT
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || ERROR_MESSAGES.PAYMENT_CREATION_FAILED);
  }

  return response.json(); // { client_secret, payment_id }
};

// W3: Setup milestone payment plan
export const setupMilestones = async (proyectoData, templateId) => {
  const response = await fetch(`${N8N_BASE_URL}${PAYMENT_ENDPOINTS.MILESTONES_SETUP}`, {
    method: HTTP_CONFIG.METHOD.POST,
    headers: {
      'Content-Type': HTTP_CONFIG.HEADERS.CONTENT_TYPE_JSON,
    },
    body: JSON.stringify({
      proyecto_id: proyectoData.id,
      cliente_id: proyectoData.cliente_id,
      instalador_id: proyectoData.instalador_id,
      template_id: templateId,
      total_amount: proyectoData.costo_total
    })
  });

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.MILESTONE_SETUP_FAILED);
  }

  return response.json(); // { success, payment_id, milestones_created, total_amount }
};

// W4: Mark milestone as completed (instalador)
export const completeMilestone = async (milestoneId) => {
  const response = await fetch(`${N8N_BASE_URL}${PAYMENT_ENDPOINTS.MILESTONE_COMPLETE}`, {
    method: HTTP_CONFIG.METHOD.POST,
    headers: {
      'Content-Type': HTTP_CONFIG.HEADERS.CONTENT_TYPE_JSON,
    },
    body: JSON.stringify({
      milestone_id: milestoneId
    })
  });

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.MILESTONE_COMPLETE_FAILED);
  }

  return response.json(); // { success, milestone_id, status: "completed" }
};

// W5: Generate payment for individual milestone (cliente)
export const payMilestone = async (milestoneId) => {
  const response = await fetch(`${N8N_BASE_URL}${PAYMENT_ENDPOINTS.MILESTONE_PAY}`, {
    method: HTTP_CONFIG.METHOD.POST,
    headers: {
      'Content-Type': HTTP_CONFIG.HEADERS.CONTENT_TYPE_JSON,
    },
    body: JSON.stringify({
      milestone_id: milestoneId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || ERROR_MESSAGES.PAYMENT_CREATION_FAILED);
  }

  return response.json(); // { client_secret, payment_id, amount }
};