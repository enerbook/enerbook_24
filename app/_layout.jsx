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
    const inAuthRoute = segments[0] === 'installer-login' || segments[0] === 'login' || segments[0] === 'installer-signup';
    
    console.log('_layout - user:', user?.email, 'userType:', userType, 'segments:', segments);

    // Si no hay usuario y está en ruta protegida, redirigir al login
    if (!user && inProtectedRoute) {
      console.log('Redirecting to login - no user in protected route, segment:', segments[0]);
      if (segments[0] === 'installer') {
        console.log('Redirecting to installer-login');
        router.replace('/installer-login');
      } else if (segments[0] === 'dashboard') {
        console.log('Redirecting to client login');
        router.replace('/login');
      } else {
        console.log('Redirecting to default login');
        router.replace('/login');
      }
    } 
    // Si hay usuario y userType y está en página de login, redirigir al dashboard
    else if (user && userType && inAuthRoute) {
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
