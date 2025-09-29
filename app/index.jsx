import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import Navbar from "../src/features/shared/components/landing/Navbar";
import Hero from "../src/features/shared/components/landing/Hero";
import Stats from "../src/features/shared/components/landing/Stats";
import Partners from "../src/features/shared/components/landing/Partners";
import Reviews from "../src/features/shared/components/landing/Reviews";
import HowItWorks from "../src/features/shared/components/landing/HowItWorks";
import Experts from "../src/features/shared/components/landing/Experts";
import Footer from "../src/features/shared/components/landing/Footer";
import InstallersCTA from "../src/features/shared/components/landing/InstallersCTA";
import ReceiptUploadModal from "../src/features/lead/components/camera/ReceiptUploadModal";
import { useOcr } from "../src/features/lead/hooks/useOcr";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { ocrData, isLoading, setOcrData, handleReceiptUpload } = useOcr();

  const navigateToDashboard = (page) => {
    if (page === 'dashboard') {
      router.push('/leads-users-dashboard');
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
