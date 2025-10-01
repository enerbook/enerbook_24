import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import Navbar from '../src/landing/components/Navbar';
import Hero from '../src/landing/components/Hero';
import Stats from '../src/landing/components/Stats';
import Partners from '../src/landing/components/Partners';
import Reviews from '../src/landing/components/Reviews';
import HowItWorks from '../src/landing/components/HowItWorks';
import Experts from '../src/landing/components/Experts';
import Footer from '../src/landing/components/Footer';
import InstallersCTA from '../src/landing/components/InstallersCTA';
import ReceiptUploadModal from '../src/lead/components/camera/ReceiptUploadModal';
import { useOcr } from '../src/lead/hooks/useOcr';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { ocrData, isLoading, setOcrData, handleReceiptUpload } = useOcr();

  const navigateToDashboard = (page) => {
    if (page === 'dashboard') {
      router.push('/lead-panel');
    } else if (page === 'signup') {
      router.push('/signup');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1 }}>
          <Navbar onNavigate={navigateToDashboard} />
          <Hero onNavigate={navigateToDashboard} onOpenModal={() => setIsModalOpen(true)} />
          <Stats />
          <Partners />
          <Reviews />
          <HowItWorks onNavigate={navigateToDashboard} onOpenModal={() => setIsModalOpen(true)} />
          <Experts />
          <InstallersCTA />
          <Footer />
        </View>
      </ScrollView>
      
      <ReceiptUploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReceiptUpload}
        ocrData={ocrData}
        setOcrData={setOcrData}
        isLoading={isLoading}
      />
    </>
  );
}
