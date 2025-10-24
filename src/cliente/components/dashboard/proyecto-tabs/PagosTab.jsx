import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../../../lib/supabaseClient';
import PaymentMethodSelector from '../../payment/PaymentMethodSelector';
import UpfrontPayment from '../../payment/UpfrontPayment';

export default function PagosTab({ proyecto, onReload }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('summary'); // 'summary', 'select-method', 'upfront-payment'

  useEffect(() => {
    if (proyecto?.id) {
      loadPaymentData();
    }
  }, [proyecto?.id]);

  const loadPaymentData = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, payment_milestones(*)')
        .eq('proyecto_id', proyecto.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // data es un array, tomamos el primer elemento
      setPayment(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error loading payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelected = (method, result) => {
    if (method === 'upfront') {
      setView('upfront-payment');
    } else if (method === 'milestones') {
      // Refresh to show milestone tracking
      loadPaymentData();
      setView('summary');
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh payment data
    loadPaymentData();
    setView('summary');
    if (onReload) onReload();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className="text-sm text-gray-600 mt-4">Cargando información de pago...</Text>
      </View>
    );
  }

  // Show payment method selector
  if (view === 'select-method') {
    return (
      <View className="flex-1 bg-gray-50 p-4">
        <PaymentMethodSelector
          proyecto={proyecto}
          onMethodSelected={handleMethodSelected}
          onBack={() => setView('summary')}
        />
      </View>
    );
  }

  // Show upfront payment screen
  if (view === 'upfront-payment') {
    return (
      <View className="flex-1 bg-gray-50 p-4">
        <UpfrontPayment
          proyecto={proyecto}
          onSuccess={handlePaymentSuccess}
          onBack={() => setView('summary')}
        />
      </View>
    );
  }

  // Summary view - if payment exists
  if (payment) {
    return (
      <View className="flex-1 bg-gray-50 p-4">
        <View className="bg-white rounded-lg p-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-semibold text-ink">Método de Pago</Text>
            <View className={`px-3 py-1 rounded-full ${
              payment.status === 'completed' ? 'bg-green-100' :
              payment.status === 'pending' ? 'bg-yellow-100' :
              'bg-gray-100'
            }`}>
              <Text className={`text-sm ${
                payment.status === 'completed' ? 'text-green-700' :
                payment.status === 'pending' ? 'text-yellow-700' :
                'text-gray-700'
              }`}>
                {payment.status === 'completed' ? 'Pagado' :
                 payment.status === 'pending' ? 'Pendiente' :
                 payment.status}
              </Text>
            </View>
          </View>

          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Tipo de pago</Text>
              <Text className="text-sm font-medium text-ink">
                {payment.payment_method === 'upfront' ? 'Pago Completo' : 'Pago por Hitos'}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Monto total</Text>
              <Text className="text-sm font-medium text-ink">
                ${payment.total_amount?.toLocaleString('es-MX') || '0'} MXN
              </Text>
            </View>

            {payment.payment_method === 'upfront' && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Estado</Text>
                <Text className="text-sm font-medium text-ink">
                  {payment.status === 'completed' ? 'Pagado completamente' : 'Pendiente de pago'}
                </Text>
              </View>
            )}

            {payment.payment_method === 'milestones' && payment.payment_milestones && (
              <View className="mt-4 pt-4 border-t border-gray-200">
                <Text className="text-sm font-medium text-ink mb-3">
                  Hitos configurados: {payment.payment_milestones.length}
                </Text>
                {payment.payment_milestones.map((milestone) => (
                  <View key={milestone.id} className="flex-row justify-between mb-2">
                    <Text className="text-sm text-gray-600">
                      Hito {milestone.milestone_number}: {milestone.title}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-sm text-gray-600 mr-2">
                        ${milestone.amount?.toLocaleString('es-MX')}
                      </Text>
                      <View className={`w-2 h-2 rounded-full ${
                        milestone.status === 'paid' ? 'bg-green-500' :
                        milestone.status === 'completed' ? 'bg-blue-500' :
                        milestone.status === 'in_progress' ? 'bg-yellow-500' :
                        'bg-gray-300'
                      }`} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {payment.status === 'pending' && payment.payment_method === 'upfront' && (
            <TouchableOpacity
              onPress={() => setView('upfront-payment')}
              className="mt-6 bg-brand py-3 rounded-lg"
            >
              <Text className="text-sm font-medium text-white text-center">
                Proceder al Pago
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Summary view - no payment configured
  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-lg p-6 shadow-sm">
        <Text className="text-base font-semibold text-ink mb-2">
          Configurar Método de Pago
        </Text>
        <Text className="text-sm text-gray-600 mb-6">
          Para continuar con tu proyecto, selecciona cómo te gustaría realizar el pago.
        </Text>

        <View className="space-y-4 mb-6">
          <View className="border border-gray-200 rounded-lg p-4">
            <Text className="text-sm font-medium text-ink mb-2">Pago Completo</Text>
            <Text className="text-sm text-gray-600 mb-2">
              Paga el total del proyecto de una sola vez
            </Text>
            <Text className="text-sm font-semibold text-brand">
              ${proyecto?.costo_total?.toLocaleString('es-MX') || '0'} MXN
            </Text>
          </View>

          <View className="border border-gray-200 rounded-lg p-4">
            <Text className="text-sm font-medium text-ink mb-2">Pago por Hitos</Text>
            <Text className="text-sm text-gray-600 mb-2">
              Divide el pago en hitos según avance el proyecto
            </Text>
            <Text className="text-sm text-gray-500 italic">
              (Configurable en el siguiente paso)
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setView('select-method')}
          className="bg-brand py-3 rounded-lg"
        >
          <Text className="text-sm font-medium text-white text-center">
            Seleccionar Método de Pago
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}