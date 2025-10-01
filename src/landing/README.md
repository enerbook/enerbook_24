# Landing Feature Module

This module contains all components for the public-facing landing page of the Enerbook platform.

## Overview

The Landing feature provides the main entry point for new visitors to learn about Enerbook's solar energy services. Key functions:
- Present value proposition and key benefits
- Showcase partner companies and statistics
- Display customer reviews and testimonials
- Explain how the platform works
- Highlight expert team members
- Call-to-action for installers to join
- Enable visitors to analyze their CFE receipt immediately

## Directory Structure

```
src/landing/
├── components/
│   ├── Navbar.jsx           # Top navigation with login/signup links
│   ├── Hero.jsx             # Hero section with main CTA
│   ├── Stats.jsx            # Key statistics showcase
│   ├── Partners.jsx         # Trusted partner logos
│   ├── Reviews.jsx          # Customer testimonials
│   ├── HowItWorks.jsx       # Process explanation
│   ├── Experts.jsx          # Team member showcase
│   ├── InstallersCTA.jsx    # Call-to-action for installers
│   ├── Footer.jsx           # Footer with links and info
│   └── Reveal.jsx           # Animation utility component
└── README.md
```

## Components

### Navbar
- **Purpose**: Main navigation bar with authentication links
- **Location**: `components/Navbar.jsx`
- **Props**: `{ onNavigate: Function }`
- **Features**:
  - Enerbook logo
  - Navigation links (Features, How it Works, Reviews, etc.)
  - Login button → redirects to `/login`
  - Signup button → redirects to `/signup`
  - Installer login link → redirects to `/installer-login`
  - Responsive mobile menu
- **Usage**:
  ```jsx
  import Navbar from '../src/landing/components/Navbar';
  <Navbar onNavigate={(page) => router.push(page)} />
  ```

### Hero
- **Purpose**: Main hero section with primary call-to-action
- **Location**: `components/Hero.jsx`
- **Props**: `{ onNavigate: Function, onOpenModal: Function }`
- **Features**:
  - Compelling headline: "Transforma tu Energía, Transforma tu Futuro"
  - Value proposition text
  - Primary CTA: "Analiza tu Recibo CFE" → opens ReceiptUploadModal
  - Secondary CTA: "Crea tu Cuenta" → redirects to `/signup`
  - Hero image/illustration
  - Animated entrance effects
- **Usage**:
  ```jsx
  import Hero from '../src/landing/components/Hero';
  <Hero
    onNavigate={(page) => router.push(page)}
    onOpenModal={() => setIsModalOpen(true)}
  />
  ```

### Stats
- **Purpose**: Display key platform statistics
- **Location**: `components/Stats.jsx`
- **Features**:
  - Total energy savings
  - Number of satisfied clients
  - Total solar installations completed
  - CO2 emissions reduced
  - Animated counter effects
  - Responsive grid layout
- **Example Data**:
  - "10+ GWh" - Energy Saved
  - "5,000+" - Satisfied Clients
  - "3,000+" - Installations Completed
  - "4,500 tons" - CO2 Reduced

### Partners
- **Purpose**: Showcase trusted partner companies
- **Location**: `components/Partners.jsx`
- **Features**:
  - Partner company logos
  - "Trusted by leading solar companies" section
  - Carousel/grid of partner logos
  - Hover effects
- **Example Partners**:
  - SolarTech
  - GreenEnergy
  - EcoSolar
  - SunPower México

### Reviews
- **Purpose**: Display customer testimonials and ratings
- **Location**: `components/Reviews.jsx`
- **Features**:
  - Customer name and photo
  - Star rating (1-5)
  - Review text/testimonial
  - Location/city
  - Carousel navigation
  - Responsive cards
- **Example Review**:
  ```
  "Excelente servicio, ahorro más del 70% en mi recibo de luz. ¡Totalmente recomendado!"
  - María González, Ciudad de México
  ⭐⭐⭐⭐⭐
  ```

### HowItWorks
- **Purpose**: Explain the platform process in steps
- **Location**: `components/HowItWorks.jsx`
- **Props**: `{ onNavigate: Function, onOpenModal: Function }`
- **Features**:
  - Step-by-step process breakdown
  - Icons for each step
  - Clear call-to-action buttons
  - Animations on scroll
- **Process Steps**:
  1. **Analiza tu Recibo CFE** - Upload your electricity bill
  2. **Recibe Cotizaciones** - Get quotes from verified installers
  3. **Compara y Elige** - Compare options and select best fit
  4. **Instalación Profesional** - Expert installation team
  5. **Ahorra y Disfruta** - Save money and reduce carbon footprint

### Experts
- **Purpose**: Showcase the team behind Enerbook
- **Location**: `components/Experts.jsx`
- **Features**:
  - Team member photos
  - Names and titles
  - Brief bios or expertise areas
  - Social media links
  - Grid layout with cards
- **Example Expert**:
  ```
  Ing. Carlos Rodríguez
  Director de Ingeniería Solar
  15+ años de experiencia en energía renovable
  ```

### InstallersCTA
- **Purpose**: Call-to-action to recruit installers
- **Location**: `components/InstallersCTA.jsx`
- **Features**:
  - Compelling headline for installers
  - Benefits of joining the platform
  - Primary CTA button → redirects to `/installer-signup`
  - Background with contrasting design
  - Statistics relevant to installers (e.g., "Join 500+ installers")
- **Benefits Listed**:
  - Access to pre-qualified leads
  - Automated quote management
  - Secure payment processing
  - Marketing support
  - Performance analytics

### Footer
- **Purpose**: Site footer with links and information
- **Location**: `components/Footer.jsx`
- **Features**:
  - Company information
  - Quick links (About, Contact, Terms, Privacy)
  - Social media icons
  - Newsletter signup
  - Copyright notice
  - Contact information (email, phone)
- **Sections**:
  - About Enerbook
  - Quick Links
  - Legal
  - Contact
  - Social Media

### Reveal
- **Purpose**: Utility component for scroll animations
- **Location**: `components/Reveal.jsx`
- **Props**: `{ children: ReactNode, delay?: number }`
- **Features**:
  - Fade-in animation on scroll
  - Configurable delay
  - Uses Intersection Observer
  - Reusable across all landing components
- **Usage**:
  ```jsx
  import Reveal from '../src/landing/components/Reveal';
  <Reveal delay={0.2}>
    <div>Content that animates in</div>
  </Reveal>
  ```

## Data Flow

### Visitor Journey
1. **Landing Page Load** → Visitor sees Hero, Stats, Partners
2. **Scroll Down** → Reveal animations trigger for Reviews, HowItWorks, Experts
3. **CTA Click** → Multiple paths:
   - "Analiza tu Recibo CFE" → Opens ReceiptUploadModal (Lead flow)
   - "Crea tu Cuenta" → Redirects to `/signup`
   - "Iniciar Sesión" → Redirects to `/login`
   - "Únete al PowerTeam" → Redirects to `/installer-signup`

### Receipt Upload Flow (Integration with Lead)
1. Visitor clicks "Analiza tu Recibo CFE" in Hero
2. `onOpenModal()` callback triggers
3. Parent page ([index.jsx](../../app/index.jsx)) opens ReceiptUploadModal (from Lead feature)
4. User uploads CFE receipt → OCR processing begins
5. Temporary lead created → redirect to `/lead-panel`
6. Lead can view analysis and optionally signup to save data

## Integration Points

### Cross-Feature Dependencies
- **Lead Feature**: Landing page integrates ReceiptUploadModal from Lead
  - Import path: `../src/lead/components/camera/ReceiptUploadModal`
  - Used in: [index.jsx](../../app/index.jsx)
- **AuthContext**: Navigation buttons use router to redirect to auth pages

### Pages Using Landing Components
- **[index.jsx](../../app/index.jsx)**: Main landing page
  ```jsx
  import Navbar from "../src/landing/components/Navbar";
  import Hero from "../src/landing/components/Hero";
  import Stats from "../src/landing/components/Stats";
  import Partners from "../src/landing/components/Partners";
  import Reviews from "../src/landing/components/Reviews";
  import HowItWorks from "../src/landing/components/HowItWorks";
  import Experts from "../src/landing/components/Experts";
  import Footer from "../src/landing/components/Footer";
  import InstallersCTA from "../src/landing/components/InstallersCTA";
  ```

## Styling

### Design System
- **Primary Color**: Orange gradient (`#F59E0B` → `#FFCB45`)
- **Typography**:
  - Headlines: Bold, large
  - Body text: 14px (text-sm)
  - Title case for buttons and headings
- **Layout**:
  - Max-width containers for content
  - Responsive grid/flex layouts
  - Mobile-first approach
- **Animations**:
  - Reveal on scroll (fade-in, slide-up)
  - Hover effects on buttons and cards
  - Smooth transitions

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Usage Example

### Complete Landing Page
```jsx
// app/index.jsx
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";

// Landing components
import Navbar from "../src/landing/components/Navbar";
import Hero from "../src/landing/components/Hero";
import Stats from "../src/landing/components/Stats";
import Partners from "../src/landing/components/Partners";
import Reviews from "../src/landing/components/Reviews";
import HowItWorks from "../src/landing/components/HowItWorks";
import Experts from "../src/landing/components/Experts";
import Footer from "../src/landing/components/Footer";
import InstallersCTA from "../src/landing/components/InstallersCTA";

// Lead modal for receipt upload
import ReceiptUploadModal from "../src/lead/components/camera/ReceiptUploadModal";
import { useOcr } from "../src/lead/hooks/useOcr";

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
          <Hero
            onNavigate={navigateToDashboard}
            onOpenModal={() => setIsModalOpen(true)}
          />
          <Stats />
          <Partners />
          <Reviews />
          <HowItWorks
            onNavigate={navigateToDashboard}
            onOpenModal={() => setIsModalOpen(true)}
          />
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
```

## Related Features

- **Lead**: Handles temporary users who upload receipts from landing page
- **Cliente**: Where leads convert after signup
- **Instalador**: Target audience for InstallersCTA section

## SEO Considerations

### Meta Tags (Recommended)
```html
<title>Enerbook - Energía Solar para tu Hogar | Ahorra en tu Recibo CFE</title>
<meta name="description" content="Transforma tu energía con paneles solares. Analiza tu recibo CFE gratis y recibe cotizaciones de instaladores certificados. Ahorra hasta 98% en tu recibo de luz." />
<meta name="keywords" content="paneles solares, energía solar, ahorro CFE, instalación solar, México" />
```

### Performance Optimization
- Lazy load images below the fold
- Optimize partner logos and team photos
- Minimize animation JavaScript
- Use SVG for icons when possible

## Future Enhancements

- A/B testing for CTA buttons
- Interactive solar savings calculator
- Video testimonials
- Live chat support widget
- Multi-language support (English)
- Blog/resources section
- Case studies showcase
- Real-time installation map
