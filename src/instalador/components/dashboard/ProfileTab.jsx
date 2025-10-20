import React, { useState, useEffect } from 'react';
import { FiUser, FiEdit3, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import DocumentsTab from './DocumentsTab';
import CertificationsTab from './CertificationsTab';
import UploadDocumentModal from '../modals/UploadDocumentModal';
import UploadCertificationModal from '../modals/UploadCertificationModal';

const ProfileTab = ({ userProfile: initialProfile }) => {
  const { user } = useAuth();

  // Estados para modo edición
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para valores de los campos
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    nombre_contacto: '',
    email: '',
    telefono: '',
    rfc: '',
    direccion_fiscal: '',
    descripcion_empresa: '',
    fecha_fundacion: '',
    curp_representante: '',
    estados_operacion: ''
  });

  // Estados para documentos y certificaciones (usando los componentes existentes)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [uploadAction, setUploadAction] = useState('');
  const [certificationAction, setCertificationAction] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [selectedCertification, setSelectedCertification] = useState('');

  // Estados para los datos de documentos y certificaciones
  const [documentStatus, setDocumentStatus] = useState({
    'Acta Constitutiva': { uploaded: false, filename: '' },
    'RFC de la Empresa': { uploaded: false, filename: '' },
    'Comprobante de Domicilio Fiscal': { uploaded: false, filename: '' },
    'Identificación del Representante Legal': { uploaded: false, filename: '' },
    'CURP del Representante Legal': { uploaded: false, filename: '' },
  });

  const [certificationStatus, setCertificationStatus] = useState({
    'ISO 9001 - Gestión de Calidad': { filename: '', expirationDate: '' },
    'Certificación en Instalaciones Fotovoltaicas': { filename: '', expirationDate: '' },
  });

  // Cargar datos del proveedor desde Supabase
  useEffect(() => {
    const loadProveedorData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('proveedores')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            nombre_empresa: data.nombre_empresa || initialProfile?.companyName || '',
            nombre_contacto: data.nombre_contacto || '',
            email: data.email || initialProfile?.email || user.email || '',
            telefono: data.telefono || '',
            rfc: data.rfc || '',
            direccion_fiscal: data.direccion || '',
            descripcion_empresa: data.descripcion_empresa || '',
            fecha_fundacion: data.fecha_fundacion || '',
            curp_representante: data.curp_representante || '',
            estados_operacion: data.estados_operacion || ''
          });
        }
      } catch (error) {
        console.error('Error loading proveedor data:', error);
      }
    };

    loadProveedorData();
  }, [user, initialProfile]);

  // Manejar cambios en inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Guardar cambios en Supabase
  const handleSave = async () => {
    if (!user?.id) {
      setError('No se puede guardar: usuario no identificado');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updateData = {
        nombre_empresa: formData.nombre_empresa,
        nombre_contacto: formData.nombre_contacto,
        email: formData.email,
        telefono: formData.telefono,
        rfc: formData.rfc,
        direccion: formData.direccion_fiscal,
        descripcion_empresa: formData.descripcion_empresa,
        fecha_fundacion: formData.fecha_fundacion || null,
        curp_representante: formData.curp_representante,
        estados_operacion: formData.estados_operacion,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('proveedores')
        .update(updateData)
        .eq('auth_user_id', user.id);

      if (updateError) throw updateError;

      // Salir del modo edición
      setIsEditing(false);

    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al guardar los cambios: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar edición
  const handleCancel = async () => {
    // Recargar datos originales desde Supabase
    if (!user?.id) {
      setIsEditing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          nombre_empresa: data.nombre_empresa || initialProfile?.companyName || '',
          nombre_contacto: data.nombre_contacto || '',
          email: data.email || initialProfile?.email || user.email || '',
          telefono: data.telefono || '',
          rfc: data.rfc || '',
          direccion_fiscal: data.direccion || '',
          descripcion_empresa: data.descripcion_empresa || '',
          fecha_fundacion: data.fecha_fundacion || '',
          curp_representante: data.curp_representante || '',
          estados_operacion: data.estados_operacion || ''
        });
      }
    } catch (error) {
      console.error('Error reloading data:', error);
    }

    setIsEditing(false);
    setError('');
  };

  // Manejar acción de documento (Subir/Reemplazar)
  const handleDocumentAction = (docName, action) => {
    setSelectedDocument(docName);
    setUploadAction(action);
    setShowUploadModal(true);
  };

  // Manejar subida de documento
  const handleDocumentUpload = () => {
    // Aquí iría la lógica de subida real
    console.log('Subiendo documento:', selectedDocument);

    // Simular subida exitosa
    setDocumentStatus(prev => ({
      ...prev,
      [selectedDocument]: {
        uploaded: true,
        filename: `${selectedDocument}.pdf`
      }
    }));

    setShowUploadModal(false);
  };

  // Manejar acción de certificación (Agregar/Reemplazar)
  const handleCertificationAction = (certName, action) => {
    setSelectedCertification(certName);
    setCertificationAction(action);
    setShowCertificationModal(true);
  };

  // Manejar subida de certificación
  const handleCertificationUpload = () => {
    // Aquí iría la lógica de subida real
    console.log('Subiendo certificación:', selectedCertification);

    // Si es agregar nueva certificación
    if (certificationAction === 'Agregar') {
      setCertificationStatus(prev => ({
        ...prev,
        [selectedCertification]: {
          filename: `${selectedCertification}.pdf`,
          expirationDate: '2025-12-31'
        }
      }));
    } else {
      // Simular actualización
      setCertificationStatus(prev => ({
        ...prev,
        [selectedCertification]: {
          ...prev[selectedCertification],
          filename: `${selectedCertification}_updated.pdf`
        }
      }));
    }

    setShowCertificationModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Company Profile Card */}
      <div className="p-6 rounded-2xl border border-gray-100" style={{backgroundColor: '#fcfcfc'}}>
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-800 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Company Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mr-4">
              <FiUser className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{formData.nombre_empresa || initialProfile?.companyName}</h3>
              <p className="text-sm text-gray-600">{formData.email || initialProfile?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors flex items-center gap-2"
              >
                <FiEdit3 className="w-4 h-4" />
                Editar
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 flex items-center gap-1"
                >
                  <FiX className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-50 flex items-center gap-1"
                >
                  <FiCheck className="w-4 h-4" />
                  {isLoading ? 'Guardando...' : 'Aceptar'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Form Fields Grid - 2 columnas */}
        <div className="grid grid-cols-2 gap-6">
          {/* Nombre de la Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Nombre de la Empresa</label>
            <input
              type="text"
              value={formData.nombre_empresa}
              onChange={(e) => handleInputChange('nombre_empresa', e.target.value)}
              placeholder="Nombre de la Empresa"
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
            />
          </div>

          {/* Nombre del Representante Legal */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Nombre del Representante Legal</label>
            <input
              type="text"
              value={formData.nombre_contacto}
              onChange={(e) => handleInputChange('nombre_contacto', e.target.value)}
              placeholder="Nombre del Representante Legal"
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="correo@empresa.com"
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
            />
          </div>

          {/* Teléfono Celular */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Teléfono Celular</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              placeholder="Tu Teléfono Celular"
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
            />
          </div>

          {/* Registro Federal de Contribuyentes */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Registro Federal de Contribuyentes</label>
            <input
              type="text"
              value={formData.rfc}
              onChange={(e) => handleInputChange('rfc', e.target.value)}
              placeholder="Tu RFC"
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
            />
          </div>

          {/* CURP del Representante Legal */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">CURP del Representante Legal</label>
            <input
              type="text"
              value={formData.curp_representante}
              onChange={(e) => handleInputChange('curp_representante', e.target.value)}
              placeholder="Tu CURP"
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
            />
          </div>

          {/* Fecha de Fundación */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Fecha de Fundación</label>
            <input
              type="date"
              value={formData.fecha_fundacion}
              onChange={(e) => handleInputChange('fecha_fundacion', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
            />
          </div>

          {/* Dirección Fiscal */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Dirección Fiscal</label>
            <input
              type="text"
              value={formData.direccion_fiscal}
              onChange={(e) => handleInputChange('direccion_fiscal', e.target.value)}
              placeholder="Tu Dirección Fiscal"
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
            />
          </div>

          {/* Descripción de la Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Descripción de la Empresa</label>
            <textarea
              value={formData.descripcion_empresa}
              onChange={(e) => handleInputChange('descripcion_empresa', e.target.value)}
              placeholder="Escribe aquí más detalles de la empresa"
              rows="3"
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
            ></textarea>
          </div>

          {/* Estados de Operación */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Estados de Operación</label>
            <div className="relative">
              <select
                value={formData.estados_operacion}
                onChange={(e) => handleInputChange('estados_operacion', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
              >
                <option value="">Seleccionar</option>
                <option value="Ciudad de México">Ciudad de México</option>
                <option value="Estado de México">Estado de México</option>
                <option value="Jalisco">Jalisco</option>
                <option value="Nuevo León">Nuevo León</option>
                <option value="Puebla">Puebla</option>
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 10l5 5 5-5z" fill="#9CA3AF"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Documentos - Usando componente existente */}
      <div className="mt-8">
        <DocumentsTab
          documentStatus={documentStatus}
          handleDocumentAction={handleDocumentAction}
        />
      </div>

      {/* Sección de Certificaciones - Usando componente existente */}
      <div className="mt-8">
        <CertificationsTab
          certificationStatus={certificationStatus}
          handleCertificationAction={handleCertificationAction}
        />
      </div>

      {/* Modales */}
      {showUploadModal && (
        <UploadDocumentModal
          uploadAction={uploadAction}
          setShowUploadModal={setShowUploadModal}
          handleDocumentUpload={handleDocumentUpload}
        />
      )}

      {showCertificationModal && (
        <UploadCertificationModal
          certificationAction={certificationAction}
          setShowCertificationModal={setShowCertificationModal}
          handleCertificationUpload={handleCertificationUpload}
        />
      )}
    </div>
  );
};

export default ProfileTab;
