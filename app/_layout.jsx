import "../src/styles/global.css";
import "../src/styles/camera-animations.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { useEffect } from "react";

const RootLayoutNav = () => {
  const { user, userType, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inProtectedRoute = segments[0] === 'installer' || segments[0] === 'dashboard';
    const inAuthRoute = segments[0] === 'installer-login' || segments[0] === 'login' || segments[0] === 'installer-signup' || segments[0] === 'signup';

    // Obtener la URL completa actual
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const hasLeadIdInUrl = currentUrl.includes('temp_lead_id=');

    console.log('_layout - user:', user?.email, 'userType:', userType, 'segments:', segments, 'URL has lead ID:', hasLeadIdInUrl);

    // Si el userType es 'lead' o hay temp_lead_id en la URL, permitir acceso al dashboard
    if ((userType === 'lead' || hasLeadIdInUrl) && segments[0] === 'dashboard') {
      console.log('Lead mode detected or temp_lead_id in URL, allowing dashboard access');
      return;
    }

    // Si no hay usuario y está en ruta protegida, verificar si es modo lead
    if (!user && inProtectedRoute) {
      // Para dashboard, verificar si hay temp_lead_id en la URL
      if (segments[0] === 'dashboard') {
        if (hasLeadIdInUrl) {
          console.log('Dashboard access with temp_lead_id in URL - allowing lead mode');
          return; // Permitir acceso sin redireccionar
        } else {
          console.log('Dashboard access without temp_lead_id - redirecting to login');
          router.replace('/login');
        }
      } else if (segments[0] === 'installer') {
        console.log('Redirecting to installer-login');
        router.replace('/installer-login');
      } else {
        console.log('Redirecting to default login');
        router.replace('/login');
      }
    } 
    // Si hay usuario y userType y está en página de auth, redirigir al dashboard apropiado
    else if (user && userType && userType !== 'lead' && inAuthRoute) {
      console.log('Redirecting to dashboard - user logged in on auth route');
      if (userType === 'instalador') {
        router.replace('/installer');
      } else if (userType === 'cliente') {
        router.replace('/dashboard');
      }
    }
    // Si hay usuario pero no userType, esperar
    else if (user && !userType && !inAuthRoute) {
      console.log('User exists but no userType yet, waiting...');
    }
  }, [user, userType, loading, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  useEffect(() => {
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
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
