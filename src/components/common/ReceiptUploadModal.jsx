import React, { useState, useRef } from 'react';

export default function ReceiptUploadModal({ isOpen, onClose, onSubmit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (file) => {
    if (file && (file.type === 'application/pdf' || file.type === 'image/png' || file.type === 'image/jpeg')) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
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
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (selectedFile && onSubmit) {
      onSubmit(selectedFile);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Upload Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-gray-800 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-800">
              <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 20H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
          Sube tu recibo de CFE
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 mb-8">
          Selecciona o arrastra tu recibo
        </p>

        {/* File Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : selectedFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFile ? (
            <div className="text-green-600">
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          ) : (
            <div className="text-gray-500">
              <div className="text-sm">
                Arrastra tu archivo aquí o
              </div>
            </div>
          )}
        </div>

        {/* File Format Info */}
        <p className="text-xs text-gray-400 text-center mt-3">
          Formatos aceptados: pdf, png o jpg
        </p>

        {/* Browse Files Button */}
        <div className="mt-6">
          <button
            onClick={handleBrowseFiles}
            className="w-full bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Explorar archivos
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className={`flex-1 font-medium py-3 px-6 rounded-lg transition-all ${
              selectedFile
                ? 'text-white hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            style={selectedFile ? {
              background: "linear-gradient(180deg, #F59E0B 0%, #FBBF24 100%)",
              boxShadow: "0 4px 12px rgba(245,158,11,.3)",
              backgroundImage: "linear-gradient(180deg, #F59E0B 0%, #FBBF24 100%)"
            } : {
              background: "#e5e7eb"
            }}
          >
            Subir
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}