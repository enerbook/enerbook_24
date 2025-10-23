import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { quotationService } from '../../services/quotationService';

const SendQuoteModal = ({ project, setShowQuoteModal, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState({
    upfront: true,
    milestones: true,
    financing: true
  });

  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    paneles_marca: '',
    paneles_modelo: '',
    paneles_cantidad: '',
    paneles_potencia_wp: '',
    paneles_precio: '',
    paneles_garantia: '',
    inversores_marca: '',
    inversores_modelo: '',
    inversores_tipo: '',
    inversores_potencia_kw: '',
    inversores_precio: '',
    inversores_garantia: '',
    estructura_tipo: '',
    estructura_material: '',
    estructura_precio: '',
    sistema_electrico_descripcion: '',
    sistema_electrico_precio: '',
    tiempo_instalacion_dias: '',
    garantia_instalacion: '',
    produccion_anual_kwh: '',
    precio_total: '',
    notas_proveedor: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitQuote = async () => {
    try {
      setLoading(true);
      console.log('[SendQuoteModal] Iniciando envío...');

      // Validar campos requeridos
      if (!formData.paneles_marca || !formData.inversores_marca || !formData.precio_total) {
        alert('Por favor, completa al menos los campos de Paneles, Inversor y Precio Final');
        return;
      }

      // Preparar opciones de pago
      const opciones_pago = [];
      if (paymentOptions.upfront) {
        opciones_pago.push({
          tipo: 'upfront',
          precio: parseFloat(formData.precio_total) || 0,
          descripcion: 'Pago único al inicio del proyecto'
        });
      }
      if (paymentOptions.milestones) {
        opciones_pago.push({
          tipo: 'milestones',
          descripcion: 'Pago por hitos del proyecto',
          config: [
            { nombre: 'Acepta oferta', porcentaje: 30 },
            { nombre: 'Inicio instalación', porcentaje: 40 },
            { nombre: 'Entrega final', porcentaje: 30 }
          ]
        });
      }
      if (paymentOptions.financing) {
        opciones_pago.push({
          tipo: 'financing',
          disponible: true,
          descripcion: 'Financiamiento a través de entidad externa'
        });
      }

      const quotationData = {
        ...formData,
        opciones_pago
      };

      console.log('[SendQuoteModal] Datos preparados:', quotationData);

      // Enviar cotización
      const result = await quotationService.submitQuotation(project.id, quotationData);

      console.log('[SendQuoteModal] Éxito:', result);

      alert('¡Cotización enviada exitosamente! El cliente podrá revisarla en su dashboard.');
      if (onSuccess) {
        onSuccess(result);
      }
      setShowQuoteModal(false);
    } catch (error) {
      console.error('[SendQuoteModal] Error completo:', error);
      console.error('[SendQuoteModal] Error.message:', error?.message);
      console.error('[SendQuoteModal] Error.code:', error?.code);

      const errorMsg = error?.message || 'Error desconocido';

      if (errorMsg.includes('Ya has enviado una cotización')) {
        alert('Ya has enviado una cotización para este proyecto.');
      } else if (errorMsg.includes('Usuario no autenticado')) {
        alert('Usuario no autenticado. Inicia sesión nuevamente.');
      } else if (errorMsg.includes('No se encontró perfil de proveedor')) {
        alert('No se encontró tu perfil de proveedor. Contacta a soporte.');
      } else {
        alert(`Error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Enviar Cotización</h2>
            <p className="text-sm text-gray-600 mt-1">{project?.titulo || 'Proyecto'}</p>
          </div>
          <button onClick={() => setShowQuoteModal(false)} disabled={loading} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Paneles, Inversores, Estructura */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Paneles Solares</h3>
                <div className="space-y-3">
                  <input type="text" name="paneles_marca" value={formData.paneles_marca} onChange={handleInputChange} placeholder="Marca (ej: JA Solar) *" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  <input type="text" name="paneles_modelo" value={formData.paneles_modelo} onChange={handleInputChange} placeholder="Modelo (ej: JAM72S30)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" name="paneles_cantidad" value={formData.paneles_cantidad} onChange={handleInputChange} placeholder="Cantidad" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                    <input type="number" name="paneles_potencia_wp" value={formData.paneles_potencia_wp} onChange={handleInputChange} placeholder="Potencia (W)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" name="paneles_precio" value={formData.paneles_precio} onChange={handleInputChange} placeholder="Precio (MXN)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                    <input type="number" name="paneles_garantia" value={formData.paneles_garantia} onChange={handleInputChange} placeholder="Garantía (años)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Inversor</h3>
                <div className="space-y-3">
                  <input type="text" name="inversores_marca" value={formData.inversores_marca} onChange={handleInputChange} placeholder="Marca (ej: Huawei) *" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  <input type="text" name="inversores_modelo" value={formData.inversores_modelo} onChange={handleInputChange} placeholder="Modelo (ej: SUN2000-5KTL-M1)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="inversores_tipo" value={formData.inversores_tipo} onChange={handleInputChange} placeholder="Tipo" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                    <input type="number" step="0.1" name="inversores_potencia_kw" value={formData.inversores_potencia_kw} onChange={handleInputChange} placeholder="Potencia (kW)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" name="inversores_precio" value={formData.inversores_precio} onChange={handleInputChange} placeholder="Precio (MXN)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                    <input type="number" name="inversores_garantia" value={formData.inversores_garantia} onChange={handleInputChange} placeholder="Garantía (años)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Estructura</h3>
                <div className="space-y-3">
                  <input type="text" name="estructura_tipo" value={formData.estructura_tipo} onChange={handleInputChange} placeholder="Tipo (ej: Coplanar, techo de lámina)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="estructura_material" value={formData.estructura_material} onChange={handleInputChange} placeholder="Material" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                    <input type="number" name="estructura_precio" value={formData.estructura_precio} onChange={handleInputChange} placeholder="Precio (MXN)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Sistema Eléctrico e Instalación</h3>
                <div className="space-y-3">
                  <textarea rows="3" name="sistema_electrico_descripcion" value={formData.sistema_electrico_descripcion} onChange={handleInputChange} placeholder="Descripción" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none"></textarea>
                  <input type="number" name="sistema_electrico_precio" value={formData.sistema_electrico_precio} onChange={handleInputChange} placeholder="Precio (MXN)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" name="tiempo_instalacion_dias" value={formData.tiempo_instalacion_dias} onChange={handleInputChange} placeholder="Tiempo (días)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                    <input type="number" name="garantia_instalacion" value={formData.garantia_instalacion} onChange={handleInputChange} placeholder="Garantía (años)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Producción y Precio Final</h3>
                <div className="space-y-3">
                  <input type="number" name="produccion_anual_kwh" value={formData.produccion_anual_kwh} onChange={handleInputChange} placeholder="Producción Estimada (kWh/año)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  <input type="number" name="precio_total" value={formData.precio_total} onChange={handleInputChange} placeholder="Precio Final (MXN) *" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Opciones de Pago</label>
                <div className="flex flex-wrap gap-4">
                  {['upfront', 'milestones', 'financing'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                        style={paymentOptions[option] ? {background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'} : {backgroundColor: '#d1d5db'}}
                        onClick={() => setPaymentOptions(prev => ({...prev, [option]: !prev[option]}))}
                      >
                        {paymentOptions[option] && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="ml-2 text-sm text-gray-900">
                        {option === 'upfront' && 'Pago Total'}
                        {option === 'milestones' && 'Pagos por Hitos'}
                        {option === 'financing' && 'Financiamiento'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notas Adicionales</label>
                <textarea rows="4" name="notas_proveedor" value={formData.notas_proveedor} onChange={handleInputChange} placeholder="Información adicional sobre el sistema..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none"></textarea>
              </div>

              <button
                onClick={handleSubmitQuote}
                disabled={loading}
                className="w-full py-4 px-6 text-white rounded-2xl text-sm font-medium transition-colors"
                style={{background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
              >
                {loading ? 'Enviando cotización...' : 'Enviar Cotización'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendQuoteModal;