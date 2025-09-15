import React, { useState, useRef, useEffect } from 'react';
import CameraCapture from '../camera/CameraCapture';

const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
);

export default function ReceiptUploadModal({ isOpen, onClose, onSubmit, ocrData, setOcrData, isLoading }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setOcrData(null);
      setShowCamera(false);
    }
  }, [isOpen, setOcrData]);

  if (!isOpen) return null;

  const handleFilesSelect = (fileList) => {
    const newFiles = Array.from(fileList);
    const allFiles = [...selectedFiles, ...newFiles];

    const pdfs = allFiles.filter(f => f.type === 'application/pdf');
    const images = allFiles.filter(f => f.type.startsWith('image/'));

    if (pdfs.length > 1) {
      alert('Solo puedes subir un archivo PDF.');
      return;
    }
    if (images.length > 2) {
      alert('Solo puedes subir hasta dos imágenes.');
      return;
    }
    if (pdfs.length > 0 && images.length > 0) {
      alert('No puedes mezclar PDFs e imágenes.');
      return;
    }

    setSelectedFiles(allFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFilesSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    handleFilesSelect(e.target.files);
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  const handleCameraCapture = (capturedFiles) => {
    setSelectedFiles(capturedFiles);
    setShowCamera(false);
    // Auto-submit después de capturar
    if (capturedFiles.length > 0 && onSubmit) {
      onSubmit(capturedFiles);
    }
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0 && onSubmit) {
      onSubmit(selectedFiles);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setOcrData(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <Spinner />
          <p className="text-gray-600 mt-4">Analizando tu recibo...</p>
        </div>
      );
    }

    if (ocrData) {
      return (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos Extraídos</h3>
          <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(ocrData, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : selectedFiles.length > 0
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFiles.length > 0 ? (
            <div>
              {selectedFiles.map((file, i) => (
                <div key={i} className="text-green-600">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ))}
              <button onClick={handleClear} className="text-red-500 text-xs mt-2">Limpiar</button>
            </div>
          ) : (
            <div className="text-gray-500">
              <div className="text-sm">Arrastra tus archivos aquí o</div>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">
          Formatos aceptados: pdf, png o jpg
        </p>
        <div className="mt-6 space-y-3">
          <button
            onClick={handleOpenCamera}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium py-3 px-6 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Tomar foto
          </button>
          <button
            onClick={handleBrowseFiles}
            className="w-full bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Explorar archivos
          </button>
        </div>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-gray-800 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-800">
              <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 20H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
          {ocrData ? 'Resultados del Análisis' : 'Sube tu recibo de CFE'}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {ocrData ? 'Hemos extraído los siguientes datos de tu recibo.' : 'Selecciona o arrastra tu recibo (1 PDF o hasta 2 imágenes)'}
        </p>

        {renderContent()}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {ocrData ? 'Cerrar' : 'Cancelar'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0 || isLoading}
            className={`flex-1 font-medium py-3 px-6 rounded-lg transition-all ${
              selectedFiles.length > 0 && !isLoading
                ? 'text-white hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            style={selectedFiles.length > 0 && !isLoading ? {
              background: "linear-gradient(180deg, #F59E0B 0%, #FBBF24 100%)",
              boxShadow: "0 4px 12px rgba(245,158,11,.3)",
            } : {
              background: "#e5e7eb"
            }}
          >
            {isLoading ? 'Procesando...' : (ocrData ? 'Continuar' : 'Subir')}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={handleCameraClose}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
