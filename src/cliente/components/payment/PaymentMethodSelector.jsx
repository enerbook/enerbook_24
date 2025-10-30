import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabaseClient';
import { setupMilestones } from '../../../api/payments';
import { COLORS } from '../../../shared/config/colors';

export default function PaymentMethodSelector({ proyecto, onMethodSelected, onBack }) {
  const [templates, setTemplates] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null); // 'upfront' or 'milestones'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (proyecto?.instalador_id) {
      loadTemplates();
    }
  }, [proyecto?.instalador_id]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('installer_milestone_templates')
        .select('*')
        .eq('instalador_id', proyecto.instalador_id)
        .eq('is_active', true);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedMethod) return;

    setProcessing(true);
    try {
      if (selectedMethod === 'upfront') {
        onMethodSelected('upfront');
      } else if (selectedMethod === 'milestones') {
        if (!selectedTemplate) {
          alert('Por favor selecciona un plan de hitos');
          setProcessing(false);
          return;
        }

        // Call W3 to setup milestone plan
        const result = await setupMilestones(proyecto, selectedTemplate);
        console.log('Milestone setup result:', result);

        onMethodSelected('milestones', result);
      }
    } catch (error) {
      console.error('Error setting up payment:', error);
      alert('Error al configurar el método de pago: ' + error.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="text-sm text-gray-600 mt-4">Cargando opciones de pago...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      {/* Header */}
      <View className="mb-6">
        <TouchableOpacity onPress={onBack} className="mb-4">
          <Text className="text-sm text-brand">← Regresar</Text>
        </TouchableOpacity>

        <Text className="text-xl font-bold text-ink mb-2">
          Selecciona Método de Pago
        </Text>
        <Text className="text-sm text-gray-600">{proyecto?.titulo}</Text>
        <Text className="text-base font-semibold text-ink mt-2">
          Total: ${proyecto?.costo_total?.toLocaleString('es-MX') || '0'} MXN
        </Text>
      </View>

      {/* Upfront Payment Option */}
      <TouchableOpacity
        onPress={() => setSelectedMethod('upfront')}
        className={`bg-white rounded-lg p-6 mb-4 border-2 ${
          selectedMethod === 'upfront' ? 'border-brand' : 'border-gray-200'
        }`}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-base font-semibold text-ink mb-2">Pago Completo</Text>
            <Text className="text-sm text-gray-600 mb-3">
              Paga el total del proyecto de una sola vez
            </Text>
          </View>
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            selectedMethod === 'upfront' ? 'border-brand bg-brand' : 'border-gray-300'
          }`}>
            {selectedMethod === 'upfront' && <View className="w-3 h-3 rounded-full bg-white" />}
          </View>
        </View>

        <View className="bg-gray-50 rounded-lg p-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Monto total</Text>
            <Text className="text-sm font-semibold text-ink">
              ${proyecto?.costo_total?.toLocaleString('es-MX')} MXN
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Comisión plataforma (8%)</Text>
            <Text className="text-sm text-gray-600">
              ${((proyecto?.costo_total || 0) * 0.08).toLocaleString('es-MX')} MXN
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center">
          <Text className="text-sm text-green-600">✓</Text>
          <Text className="text-sm text-gray-600 ml-2">Pago único y rápido</Text>
        </View>
      </TouchableOpacity>

      {/* Milestone Payment Option */}
      <TouchableOpacity
        onPress={() => setSelectedMethod('milestones')}
        className={`bg-white rounded-lg p-6 mb-4 border-2 ${
          selectedMethod === 'milestones' ? 'border-brand' : 'border-gray-200'
        }`}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-base font-semibold text-ink mb-2">Pago por Hitos</Text>
            <Text className="text-sm text-gray-600 mb-3">
              Divide el pago según avance del proyecto
            </Text>
          </View>
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            selectedMethod === 'milestones' ? 'border-brand bg-brand' : 'border-gray-300'
          }`}>
            {selectedMethod === 'milestones' && <View className="w-3 h-3 rounded-full bg-white" />}
          </View>
        </View>

        {selectedMethod === 'milestones' && (
          <View className="mt-4">
            <Text className="text-sm font-medium text-ink mb-3">Selecciona un plan:</Text>

            {templates.length === 0 ? (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <Text className="text-sm text-yellow-800">
                  Este instalador no tiene planes de hitos. Selecciona "Pago Completo".
                </Text>
              </View>
            ) : (
              templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => setSelectedTemplate(template.id)}
                  className={`border rounded-lg p-4 mb-3 ${
                    selectedTemplate === template.id ? 'border-brand bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-sm font-medium text-ink flex-1">
                      {template.template_name}
                    </Text>
                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      selectedTemplate === template.id ? 'border-brand bg-brand' : 'border-gray-300'
                    }`}>
                      {selectedTemplate === template.id && (
                        <View className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </View>
                  </View>

                  {template.description && (
                    <Text className="text-sm text-gray-600 mb-3">{template.description}</Text>
                  )}

                  <View className="space-y-2">
                    {template.milestones?.map((milestone, index) => {
                      const amount = (proyecto?.costo_total || 0) * (milestone.percentage / 100);
                      return (
                        <View key={index} className="flex-row justify-between">
                          <Text className="text-sm text-gray-600">
                            {milestone.title} ({milestone.percentage}%)
                          </Text>
                          <Text className="text-sm text-gray-700">
                            ${amount.toLocaleString('es-MX')} MXN
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Continue Button */}
      <TouchableOpacity
        onPress={handleContinue}
        disabled={!selectedMethod || processing || (selectedMethod === 'milestones' && templates.length === 0)}
        className={`py-4 rounded-lg mb-4 ${
          selectedMethod && !processing && (selectedMethod === 'upfront' || (selectedMethod === 'milestones' && templates.length > 0))
            ? 'bg-brand'
            : 'bg-gray-300'
        }`}
      >
        {processing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-sm font-semibold text-white text-center">Continuar</Text>
        )}
      </TouchableOpacity>

      <Text className="text-sm text-gray-500 text-center mb-4">
        Procesamiento seguro con Stripe
      </Text>
    </ScrollView>
  );
}