const N8N_BASE_URL = process.env.EXPO_PUBLIC_N8N_WEBHOOK_BASE_URL || 'https://services.enerbook.mx';

// W1: Create upfront payment
export const createUpfrontPayment = async (proyectoData) => {
  const response = await fetch(`${N8N_BASE_URL}/webhook/payment-upfront`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      proyecto_id: proyectoData.id,
      cliente_id: proyectoData.cliente_id,
      instalador_id: proyectoData.instalador_id,
      total_amount: proyectoData.costo_total,
      payment_method: 'upfront'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment creation failed');
  }

  return response.json(); // { client_secret, payment_id }
};

// W3: Setup milestone payment plan
export const setupMilestones = async (proyectoData, templateId) => {
  const response = await fetch(`${N8N_BASE_URL}/webhook/payment-milestones-setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
    throw new Error('Milestone setup failed');
  }

  return response.json(); // { success, payment_id, milestones_created, total_amount }
};

// W4: Mark milestone as completed (instalador)
export const completeMilestone = async (milestoneId) => {
  const response = await fetch(`${N8N_BASE_URL}/webhook/milestone-complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      milestone_id: milestoneId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to mark milestone complete');
  }

  return response.json(); // { success, milestone_id, status: "completed" }
};

// W5: Generate payment for individual milestone (cliente)
export const payMilestone = async (milestoneId) => {
  const response = await fetch(`${N8N_BASE_URL}/webhook/milestone-pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      milestone_id: milestoneId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment creation failed');
  }

  return response.json(); // { client_secret, payment_id, amount }
};