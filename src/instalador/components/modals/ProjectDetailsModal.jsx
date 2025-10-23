import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const ProjectDetailsModal = ({ project, setShowProjectModal }) => {
  const [requiresTechnicalVisit, setRequiresTechnicalVisit] = useState(true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detalles del Proyecto</h2>
          <button
            onClick={() => setShowProjectModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Project Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Potencia y Dimensionamiento Sugerido</h3>
                <p className="text-sm text-gray-900">Potencia recomendada: {project.power}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Consumo Anual Histórico</h3>
                <p className="text-sm text-gray-900">{project.consumption}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Tipo de Tarifa</h3>
                <p className="text-sm text-gray-900">{project.tariff}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Ubicación General</h3>
                <p className="text-sm text-gray-900">{project.location}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Irradiación Promedio</h3>
                <p className="text-sm text-gray-900">{project.irradiation}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Estado</h3>
                <p className="text-sm text-gray-900">Abierto para cotizar</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Fecha Límite para Cotizar</h3>
                <p className="text-sm text-gray-900">{project.deadline}</p>
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-6">
              {project.description && project.description !== 'Sin descripción' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Información Adicional del Proyecto</h3>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">¿Requiere visita técnica para mejorar cotización?</span>
                <div
                  className="relative cursor-pointer"
                  onClick={() => setRequiresTechnicalVisit(!requiresTechnicalVisit)}
                >
                  <div className={`w-11 h-6 rounded-full shadow-inner transition-colors ${
                    requiresTechnicalVisit ? 'bg-orange-400' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-all duration-200 ${
                    requiresTechnicalVisit ? 'right-1' : 'left-1'
                  }`}></div>
                </div>
              </div>

              {/* Consumption History - Datos dinámicos desde consumo_kwh_historico */}
              {project.rawData?.cotizaciones_inicial?.consumo_kwh_historico &&
               project.rawData.cotizaciones_inicial.consumo_kwh_historico.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Historial de Consumo</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 font-medium uppercase">
                      <span>PERIODO</span>
                      <span>CONSUMO (kWh)</span>
                      <span>% DEL PROMEDIO</span>
                    </div>
                    {project.rawData.cotizaciones_inicial.consumo_kwh_historico.map((item, index) => {
                      const promedio = project.rawData.cotizaciones_inicial.resumen_energetico?.consumo_promedio || 1;
                      const porcentaje = ((item.kwh / promedio) * 100).toFixed(1);
                      const porcentajeNum = parseFloat(porcentaje);
                      const color = porcentajeNum > 110 ? 'red' : porcentajeNum < 95 ? 'green' : 'orange';

                      return (
                        <div key={index} className="grid grid-cols-3 gap-4 py-2 text-sm">
                          <span className="text-gray-900 font-medium">{item.periodo}</span>
                          <span className="text-gray-900">{item.kwh}</span>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${
                              color === 'red' ? 'bg-red-500' :
                              color === 'green' ? 'bg-green-500' : 'bg-orange-400'
                            }`}
                          >
                            {porcentaje}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
