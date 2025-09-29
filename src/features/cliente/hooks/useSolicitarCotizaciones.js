import { useState } from 'react';

export const useSolicitarCotizaciones = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = (proyecto) => {
    console.log('Proyecto creado exitosamente:', proyecto);
    // Aquí podrías agregar más lógica como actualizar el estado global, etc.
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    handleSuccess
  };
};