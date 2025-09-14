import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import Navbar from "../src/components/landing/Navbar";
import Hero from "../src/components/landing/Hero";
import Stats from "../src/components/landing/Stats";
import Partners from "../src/components/landing/Partners";
import Reviews from "../src/components/landing/Reviews";
import HowItWorks from "../src/components/landing/HowItWorks";
import Experts from "../src/components/landing/Experts";
import Footer from "../src/components/landing/Footer";
import InstallersCTA from "../src/components/landing/InstallersCTA";
import ReceiptUploadModal from "../src/components/common/ReceiptUploadModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigateToDashboard = (page) => {
    if (page === 'dashboard') {
      router.push('/dashboard');
    } else if (page === 'signup') {
      router.push('/signup');
    }
  };

  const handleReceiptUpload = (file) => {
    console.log('Receipt uploaded:', file);
    setIsModalOpen(false);
    // Here you can add logic to process the uploaded file
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
      />
    </>
  );
}