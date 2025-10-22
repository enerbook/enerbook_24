import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { loadStripe } from '@stripe/stripe-js';

// This component only works on web
if (Platform.OS !== 'web') {
  throw new Error('StripePaymentFormWeb can only be used on web platform');
}

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

const StripePaymentFormWeb = ({ clientSecret, onSuccess, onError, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripe = await getStripe();
        if (!stripe) {
          throw new Error('Failed to initialize Stripe');
        }

        // Create the payment element
        const appearance = {
          theme: 'stripe',
          variables: {
            colorPrimary: '#090e1a',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '12px',
          },
        };

        const elements = stripe.elements({
          clientSecret,
          appearance,
        });

        const paymentElement = elements.create('payment', {
          layout: 'tabs',
        });

        paymentElement.mount('#payment-element');

        // Handle form submission
        const form = document.getElementById('payment-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          setProcessing(true);
          setError(null);

          try {
            const { error: submitError, paymentIntent } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: `${window.location.origin}/payment-complete`,
              },
              redirect: 'if_required',
            });

            if (submitError) {
              setError(submitError.message);
              setProcessing(false);
              if (onError) {
                onError(submitError);
              }
              return;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
              setProcessing(false);
              if (onSuccess) {
                onSuccess(paymentIntent);
              }
            }
          } catch (err) {
            setError(err.message);
            setProcessing(false);
            if (onError) {
              onError(err);
            }
          }
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (onError) {
          onError(err);
        }
      }
    };

    if (clientSecret) {
      initializeStripe();
    }
  }, [clientSecret, onSuccess, onError]);

  if (loading) {
    return (
      <View className="flex items-center justify-center py-12">
        <ActivityIndicator size="large" color="#090e1a" />
        <Text className="text-sm text-gray-600 mt-4">Cargando formulario de pago...</Text>
      </View>
    );
  }

  return (
    <View className="w-full">
      <form id="payment-form">
        <div id="payment-element" className="mb-6" />

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <Text className="text-sm text-red-600">{error}</Text>
          </div>
        )}

        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={processing}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={processing || loading}
            className="flex-1 py-3 px-4 bg-[#090e1a] text-white rounded-xl text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
          >
            {processing ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                <span>Procesando...</span>
              </>
            ) : (
              'Pagar'
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        #payment-element {
          min-height: 200px;
        }

        #payment-form button[type="submit"]:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </View>
  );
};

export default StripePaymentFormWeb;