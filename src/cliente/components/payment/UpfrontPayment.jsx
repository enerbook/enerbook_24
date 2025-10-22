import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { createUpfrontPayment } from '../../../api/payments';
import { usePaymentSheet } from '../../../hooks/usePaymentSheet';
import { supabase } from '../../../lib/supabaseClient';

// Conditionally import web payment form
let StripePaymentFormWeb = null;
if (Platform.OS === 'web') {
  StripePaymentFormWeb = require('./StripePaymentFormWeb').default;
}

export default function UpfrontPayment({ proyecto, onSuccess, onBack }) {
  const { processPayment, loading: paymentLoading } = usePaymentSheet();
  const [creating, setCreating] = useState(false);
  const [payment, setPayment] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [showWebForm, setShowWebForm] = useState(false);

  useEffect(() => {
    // Check if payment already exists
    loadExistingPayment();
  }, [proyecto?.id]);

  useEffect(() => {
    // Subscribe to payment updates
    if (payment?.id && !subscribed) {
      const subscription = supabase
        .channel(`payment-${payment.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `id=eq.${payment.id}`
        }, (payload) => {
          console.log('Payment updated:', payload.new);
          if (payload.new.status === 'completed') {
            onSuccess();
          }
        })
        .subscribe();

      setSubscribed(true);

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [payment?.id, subscribed]);

  const loadExistingPayment = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('proyecto_id', proyecto.id)
        .eq('payment_method', 'upfront')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setPayment(data);
    } catch (error) {
      console.error('Error loading payment:', error);
    }
  };

  const handlePayNow = async () => {
    setCreating(true);
    try {
      // Call W1 to create PaymentIntent
      const result = await createUpfrontPayment(proyecto);
      console.log('Payment created:', result);

      setPayment({ id: result.payment_id, status: 'pending' });
      setClientSecret(result.client_secret);

      // On web, show the payment form instead of processing immediately
      if (Platform.OS === 'web') {
        setShowWebForm(true);
        setCreating(false);
        return;
      }

      // Native: Show Stripe Payment Sheet
      const paymentResult = await processPayment(result.client_secret);

      if (paymentResult.success) {
        console.log('Payment submitted successfully');
        // W2 will update the payment status via webhook
        // We'll receive the update via Supabase realtime
      } else if (paymentResult.canceled) {
        console.log('Payment canceled by user');
        alert('Pago cancelado');
      } else if (paymentResult.error) {
        console.error('Payment error:', paymentResult.error);
        alert('Error al procesar el pago: ' + paymentResult.error);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error al crear el pago: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleWebPaymentSuccess = (paymentIntent) => {
    console.log('Web payment succeeded:', paymentIntent);
    setShowWebForm(false);
    // The realtime subscription will handle the success callback
  };

  const handleWebPaymentError = (error) => {
    console.error('Web payment error:', error);
    alert('Error al procesar el pago: ' + error.message);
  };

  const handleWebPaymentCancel = () => {
    setShowWebForm(false);
    setClientSecret(null);
  };

  const platformFee = (proyecto?.costo_total || 0) * 0.08;
  const installerAmount = (proyecto?.costo_total || 0) * 0.92;

  // Show web payment form if on web and form is active
  if (Platform.OS === 'web' && showWebForm && clientSecret && StripePaymentFormWeb) {
    return (
      <View className="flex-1">
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity onPress={handleWebPaymentCancel} className="mb-4">
            <Text className="text-sm text-brand">← Regresar</Text>
          </TouchableOpacity>

          <Text className="text-xl font-bold text-ink mb-2">Completar Pago</Text>
          <Text className="text-sm text-gray-600">{proyecto?.titulo}</Text>
        </View>

        {/* Payment Amount Summary */}
        <View className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <View className="flex-row justify-between">
            <Text className="text-base font-semibold text-ink">Total a pagar</Text>
            <Text className="text-base font-bold text-brand">
              ${proyecto?.costo_total?.toLocaleString('es-MX')} MXN
            </Text>
          </View>
        </View>

        {/* Stripe Elements Form */}
        <View className="bg-white rounded-lg p-6 shadow-sm">
          <StripePaymentFormWeb
            clientSecret={clientSecret}
            onSuccess={handleWebPaymentSuccess}
            onError={handleWebPaymentError}
            onCancel={handleWebPaymentCancel}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="mb-6">
        <TouchableOpacity onPress={onBack} className="mb-4">
          <Text className="text-sm text-brand">← Regresar</Text>
        </TouchableOpacity>

        <Text className="text-xl font-bold text-ink mb-2">Pago Completo</Text>
        <Text className="text-sm text-gray-600">{proyecto?.titulo}</Text>
      </View>

      {/* Payment Summary */}
      <View className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <Text className="text-base font-semibold text-ink mb-4">Resumen de Pago</Text>

        <View className="space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Costo del proyecto</Text>
            <Text className="text-sm font-medium text-ink">
              ${proyecto?.costo_total?.toLocaleString('es-MX')} MXN
            </Text>
          </View>

          <View className="border-t border-gray-200 pt-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500">Comisión plataforma (8%)</Text>
              <Text className="text-sm text-gray-500">
                ${platformFee.toLocaleString('es-MX')} MXN
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Al instalador (92%)</Text>
              <Text className="text-sm text-gray-500">
                ${installerAmount.toLocaleString('es-MX')} MXN
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-200 pt-3">
            <View className="flex-row justify-between">
              <Text className="text-base font-semibold text-ink">Total a pagar</Text>
              <Text className="text-base font-bold text-brand">
                ${proyecto?.costo_total?.toLocaleString('es-MX')} MXN
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Payment Status */}
      {payment?.status === 'pending' && (
        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <Text className="text-sm font-medium text-yellow-800 mb-1">
            Pago en proceso
          </Text>
          <Text className="text-sm text-yellow-700">
            Tu pago está siendo procesado. Esto puede tardar unos momentos...
          </Text>
        </View>
      )}

      {payment?.status === 'completed' && (
        <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <Text className="text-sm font-medium text-green-800 mb-1">
            ¡Pago completado!
          </Text>
          <Text className="text-sm text-green-700">
            Tu pago se ha procesado exitosamente
          </Text>
        </View>
      )}

      {/* Benefits */}
      <View className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <Text className="text-sm font-medium text-ink mb-3">Al pagar obtienes:</Text>
        <View className="space-y-2">
          <View className="flex-row items-start">
            <Text className="text-sm text-green-600 mr-2">✓</Text>
            <Text className="text-sm text-gray-600 flex-1">
              Inicio inmediato del proyecto
            </Text>
          </View>
          <View className="flex-row items-start">
            <Text className="text-sm text-green-600 mr-2">✓</Text>
            <Text className="text-sm text-gray-600 flex-1">
              Protección del comprador con Stripe
            </Text>
          </View>
          <View className="flex-row items-start">
            <Text className="text-sm text-green-600 mr-2">✓</Text>
            <Text className="text-sm text-gray-600 flex-1">
              Transferencia segura al instalador
            </Text>
          </View>
        </View>
      </View>

      {/* Pay Button */}
      <TouchableOpacity
        onPress={handlePayNow}
        disabled={creating || paymentLoading || payment?.status === 'completed'}
        className={`py-4 rounded-lg mb-4 ${
          creating || paymentLoading || payment?.status === 'completed'
            ? 'bg-gray-300'
            : 'bg-brand'
        }`}
      >
        {creating || paymentLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-sm font-semibold text-white text-center">
            {payment?.status === 'completed' ? 'Pago Completado' : 'Pagar Ahora'}
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-row items-center justify-center">
        <Text className="text-sm text-gray-500">Procesado de forma segura por </Text>
        <Text className="text-sm font-semibold text-gray-700">Stripe</Text>
      </View>
    </View>
  );
}