import "../src/styles/global.css";
import "../src/styles/camera-animations.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { PaymentProvider } from '../src/context/PaymentContext';
import { StripeProvider } from '../src/lib/stripeProvider';
import { useEffect } from "react";
import { Platform } from "react-native";

const RootLayoutNav = () => {
  const { user, userType, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inProtectedRoute = segments[0] === 'instalador-panel' || segments[0] === 'lead-panel' || segments[0] === 'cliente-panel' || segments[0] === 'admin' || segments[0] === 'proyecto';
    const inAuthRoute = segments[0] === 'installer-login' || segments[0] === 'login' || segments[0] === 'installer-signup' || segments[0] === 'signup';

    // Obtener la URL completa actual
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const hasLeadIdInUrl = currentUrl.includes('temp_lead_id=');

    // Si el userType es 'lead' o hay temp_lead_id en la URL, permitir acceso al lead panel
    if ((userType === 'lead' || hasLeadIdInUrl) && segments[0] === 'lead-panel') {
      return;
    }

    // Si no hay usuario y está en ruta protegida, verificar si es modo lead
    if (!user && inProtectedRoute) {
      // Para lead panel, verificar si hay temp_lead_id en la URL
      if (segments[0] === 'lead-panel') {
        if (hasLeadIdInUrl) {
          return; // Permitir acceso sin redireccionar
        } else {
          router.replace('/login');
        }
      } else if (segments[0] === 'cliente-panel' || segments[0] === 'proyecto') {
        router.replace('/login');
      } else if (segments[0] === 'instalador-panel') {
        router.replace('/installer-login');
      } else if (segments[0] === 'admin') {
        router.replace('/login');
      } else {
        router.replace('/login');
      }
    }
    // Si hay usuario y userType y está en página de auth, redirigir al dashboard apropiado
    else if (user && userType && userType !== 'lead' && inAuthRoute) {
      if (userType === 'admin') {
        router.replace('/admin-panel');
      } else if (userType === 'instalador') {
        router.replace('/instalador-panel');
      } else if (userType === 'cliente') {
        router.replace('/cliente-panel');
      }
    }
    // Si hay usuario pero no userType, esperar
    else if (user && !userType && !inAuthRoute) {
      // Waiting for userType to be determined
    }
  }, [user, userType, loading, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const scriptId = 'opencv-script';
      let script = document.getElementById(scriptId);

      // Cargar el script solo si no ha sido cargado antes para evitar duplicados
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://docs.opencv.org/4.9.0/opencv.js';
        script.async = true;
        script.onload = () => {
          console.log('OpenCV.js script loaded successfully.');
        };
        script.onerror = () => {
          console.error('Error: Failed to load OpenCV.js script.');
        };
        document.body.appendChild(script);
      }
    }
  }, []);

  const AppContent = (
    <AuthProvider>
      <PaymentProvider>
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </PaymentProvider>
    </AuthProvider>
  );

  // Only wrap with StripeProvider on native platforms
  if (Platform.OS !== 'web' && StripeProvider) {
    return (
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.mx.enerbook"
      >
        {AppContent}
      </StripeProvider>
    );
  }

  // On web, return without StripeProvider (will use Stripe.js separately)
  return AppContent;
}
