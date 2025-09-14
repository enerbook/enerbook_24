import React, { useState } from 'react';
import QuotationsView from './QuotationsView';
import ContractsView from './ContractsView';
import ReviewsView from './ReviewsView';

const ProjectsTab = ({ setSelectedProject, setShowProjectModal, setShowQuoteModal }) => {
  const [activeSubTab, setActiveSubTab] = useState('disponibles');
  const projects = [
    {
      id: 1,
      name: 'Proyecto 1',
      power: '5.2 kW (14 paneles de 370W)',
      consumption: '8,500 kWh',
      tariff: 'Tarifa DAC',
      location: '72474',
      irradiation: '5.2 kWh/m²/día',
      deadline: '15 de agosto 2025',
      capacity: '5.6 kWp',
      panels: 'JA Solar 545W',
      inverter: 'Huawei SUN2000-3/4/5/6/8/10KTL-M1',
      production: '8,250 kWh/año',
      price: '$102,000 MXN',
      structure: 'Coplanar, techo de lámina'
    },
    {
      id: 2,
      name: 'Proyecto 2',
      power: '3.4 kW (6 paneles de 560W)',
      consumption: '2,530 kWh',
      tariff: 'Tarifa 01',
      location: '87472',
      irradiation: '3.3 kWh/m²/día',
      deadline: '24 de agosto 2025',
      capacity: '3.4 kWp',
      panels: 'Canadian Solar 560W',
      inverter: 'SolarEdge SE3000H-RW',
      production: '4,180 kWh/año',
      price: '$75,000 MXN',
      structure: 'Coplanar, techo de concreto'
    },
    {
      id: 3,
      name: 'Proyecto 3',
      power: '7.8 kW (18 paneles de 435W)',
      consumption: '12,800 kWh',
      tariff: 'Tarifa 02',
      location: '64000',
      irradiation: '6.1 kWh/m²/día',
      deadline: '10 de septiembre 2025',
      capacity: '7.8 kWp',
      panels: 'Trina Solar 435W',
      inverter: 'Fronius Primo 8.2-1',
      production: '12,500 kWh/año',
      price: '$145,000 MXN',
      structure: 'Elevada, techo inclinado'
    }
  ];

  return (
    <div className="w-full mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveSubTab('disponibles')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeSubTab === 'disponibles' 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Proyectos Disponibles
        </button>
        <button 
          onClick={() => setActiveSubTab('cotizaciones')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeSubTab === 'cotizaciones' 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Mis cotizaciones
        </button>
        <button 
          onClick={() => setActiveSubTab('contratos')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeSubTab === 'contratos' 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Contratos
        </button>
        <button 
          onClick={() => setActiveSubTab('resenas')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeSubTab === 'resenas' 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Mis Reseñas
        </button>
      </div>

      {/* Content based on active subtab */}
      {activeSubTab === 'disponibles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {projects.map((project) => (
            <div key={project.id} className="p-8 rounded-2xl border border-gray-100" style={{backgroundColor: '#fcfcfc'}}>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
              <p className="text-sm text-gray-600 mb-4">Potencia y Dimensionamiento sugerido</p>
              <p className="text-sm text-gray-800 mb-6">{project.power}</p>

              {/* Project Details */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Consumo Anual Histórico</span>
                  <span className="text-sm text-gray-900">{project.consumption}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Tipo de Tarifa</span>
                  <span className="text-sm text-gray-900">{project.tariff}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Ubicación General</span>
                  <span className="text-sm text-gray-900">{project.location}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Irradiación Promedio</span>
                  <span className="text-sm text-gray-900">{project.irradiation}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Fecha Límite para Cotizar</span>
                  <span className="text-sm text-gray-900">{project.deadline}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowProjectModal(true);
                  }}
                  className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-2xl text-sm font-medium hover:bg-black transition-colors"
                >
                  Ver Detalles
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowQuoteModal(true);
                  }}
                  className="flex-1 py-3 px-4 text-white rounded-2xl text-sm font-medium transition-colors"
                  style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
                >
                  Enviar Cotización
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'cotizaciones' && (
        <QuotationsView />
      )}

      {activeSubTab === 'contratos' && (
        <ContractsView />
      )}

      {activeSubTab === 'resenas' && (
        <ReviewsView />
      )}
    </div>
  );
};

export default ProjectsTab;
