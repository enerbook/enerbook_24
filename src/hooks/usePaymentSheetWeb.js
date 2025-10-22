import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key not found');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export const usePaymentSheetWeb = () => {
  const [loading, setLoading] = useState(false);
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    getStripe().then(setStripe);
  }, []);

  const processPayment = async (clientSecret) => {
    setLoading(true);

    try {
      if (!stripe) {
        throw new Error('Stripe not loaded yet. Please try again.');
      }

      if (!clientSecret) {
        throw new Error('Client secret is required');
      }

      // Confirm the payment using stripe.js
      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-complete`,
        },
        redirect: 'if_required', // Only redirect if required by payment method
      });

      if (error) {
        // Payment failed
        if (error.type === 'card_error' || error.type === 'validation_error') {
          return { error: error.message };
        }
        return { error: 'An unexpected error occurred.' };
      }

      // Payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        return { success: true, paymentIntent };
      }

      // Payment requires additional action (will be handled by redirect)
      if (paymentIntent && paymentIntent.status === 'requires_action') {
        return { error: 'Payment requires additional authentication' };
      }

      return { success: true, paymentIntent };
    } catch (error) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return { processPayment, loading, stripe };
};