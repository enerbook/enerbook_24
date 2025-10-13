import React from 'react';
import { View, Text } from 'react-native';

const ConfiguracionTab = () => {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="max-w-4xl mx-auto w-full px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Configuración
        </Text>

        <View className="bg-white rounded-lg shadow-sm p-6">
          <Text className="text-sm text-gray-600 mb-4">
            Panel de configuración en desarrollo
          </Text>

          <View className="space-y-4">
            <View className="border-b border-gray-200 pb-4">
              <Text className="text-sm font-medium text-gray-900 mb-1">
                Notificaciones
              </Text>
              <Text className="text-sm text-gray-500">
                Gestiona tus preferencias de notificaciones
              </Text>
            </View>

            <View className="border-b border-gray-200 pb-4">
              <Text className="text-sm font-medium text-gray-900 mb-1">
                Privacidad
              </Text>
              <Text className="text-sm text-gray-500">
                Controla tu información personal
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-900 mb-1">
                Cuenta
              </Text>
              <Text className="text-sm text-gray-500">
                Gestiona los detalles de tu cuenta
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ConfiguracionTab;
