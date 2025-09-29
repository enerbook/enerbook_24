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

              {/* Roof Study Section */}
              <div className="bg-orange-400 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Estudio Virtual del Techo</h3>

                {/* AI Image Placeholder */}
                <div className="bg-white/20 rounded-xl p-8 mb-4 text-center">
                  <div className="w-full h-64 bg-white/10 rounded-lg flex items-center justify-center border-2 border-dashed border-white/30">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="white" fillOpacity="0.7"/>
                        </svg>
                      </div>
                      <p className="text-white/80 text-sm">Imagen satelital del techo</p>
                      <p className="text-white/60 text-xs mt-1">Análisis de IA aquí</p>
                    </div>
                  </div>
                </div>

                {/* Roof Data */}
                <div className="space-y-2">
                  <div className="bg-gray-900 rounded-lg px-4 py-2 text-center">
                    <p className="text-white text-xs font-medium">Superficie disponible para paneles (m²)</p>
                    <p className="text-white text-sm font-bold">67.89 m²</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg px-4 py-2 text-center">
                    <p className="text-white text-xs font-medium">% de Sombra</p>
                    <p className="text-white text-sm font-bold">24%</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg px-4 py-2 text-center">
                    <p className="text-white text-xs font-medium">Inclinación/Orientación</p>
                    <p className="text-white text-sm font-bold">12° / 186° (Sur)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">Información Adicional del Proyecto</h3>
                <p className="text-sm text-gray-900 leading-relaxed">
                  Mi casa tiene el techo totalmente plano, por lo que no habría problemas por
                  sombras o necesidad de estructuras complejas. Mi casa tiene de altura 3.5 metros.
                </p>
              </div>

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

              {/* Consumption History */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Historial de Consumo</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 font-medium uppercase">
                    <span>PERIODO</span>
                    <span>CONSUMO (kWh)</span>
                    <span>% DEL PROMEDIO</span>
                  </div>
                  {[
                    { period: 'ABR25', consumption: '315', percent: '118.8%', color: 'red' },
                    { period: 'FEB25', consumption: '247', percent: '93.2%', color: 'orange' },
                    { period: 'DIC24', consumption: '280', percent: '102.3%', color: 'orange' },
                    { period: 'OCT24', consumption: '284', percent: '94.1%', color: 'orange' },
                    { period: 'AGO24', consumption: '256', percent: '97.3%', color: 'orange' },
                    { period: 'JUN24', consumption: '319', percent: '102.2%', color: 'orange' },
                    { period: 'ABR24', consumption: '267', percent: '93.2%', color: 'green' },
                    { period: 'FEB24', consumption: '225', percent: '96.0%', color: 'orange' },
                    { period: 'OCT23', consumption: '261', percent: '100.0%', color: 'orange' },
                    { period: 'AGO23', consumption: '272', percent: '100.0%', color: 'orange' }
                  ].map((item, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 py-2 text-sm">
                      <span className="text-gray-900 font-medium">{item.period}</span>
                      <span className="text-gray-900">{item.consumption}</span>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${
                          item.color === 'red' ? 'bg-red-500' :
                          item.color === 'green' ? 'bg-green-500' : 'bg-orange-400'
                        }`}
                      >
                        {item.percent}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Get Site Data Button */}
              <button
                className="w-full py-3 px-4 text-white rounded-2xl text-sm font-medium transition-colors"
                style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
              >
                Obtener Datos del Sitio - $14.99 MXN
              </button>

              <p className="text-xs text-gray-500 leading-relaxed">
                Al pagar, recibirás información satelital y técnica del sitio a través de Google Solar API,
                incluyendo superficie útil estimada, orientación, inclinación y proyección solar anual. Esto te
                permitirá dimensionar el sistema sin realizar una visita física.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
