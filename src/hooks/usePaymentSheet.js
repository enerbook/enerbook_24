import { useState } from 'react';
import { Platform } from 'react-native';
import { useStripe } from './useStripeNative';
import { usePaymentSheetWeb } from './usePaymentSheetWeb';

export const usePaymentSheet = () => {
  const [loading, setLoading] = useState(false);

  // Get stripe hooks - platform-specific implementation
  const stripeHooks = Platform.OS !== 'web' ? useStripe() : null;

  // Get web payment hook if on web
  const webPaymentHook = Platform.OS === 'web' ? usePaymentSheetWeb() : null;

  const processPayment = async (clientSecret) => {
    // On web, delegate to web-specific implementation
    if (Platform.OS === 'web') {
      if (!webPaymentHook) {
        return { error: 'Web payment system not initialized' };
      }
      return webPaymentHook.processPayment(clientSecret);
    }

    // Native implementation
    setLoading(true);

    try {
      if (!stripeHooks) {
        throw new Error('Stripe not initialized');
      }

      const { initPaymentSheet, presentPaymentSheet } = stripeHooks;

      // 1. Initialize the sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Enerbook',
        style: 'automatic',
        returnURL: 'enerbook://payment-complete',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // 2. Present the sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return { canceled: true };
        }
        throw new Error(presentError.message);
      }

      return { success: true };
    } catch (error) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Return loading state from appropriate hook
  const currentLoading = Platform.OS === 'web'
    ? (webPaymentHook?.loading || false)
    : loading;

  return { processPayment, loading: currentLoading };
};