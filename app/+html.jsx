import React from 'react';

export default function Html({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Critical viewport meta tag for mobile responsiveness */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes"
        />

        {/* Mobile web app capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Theme color */}
        <meta name="theme-color" content="#f59e0b" />

        {/* Prevent zooming on input focus in iOS */}
        <meta name="format-detection" content="telephone=no" />

        {/* SEO Meta Tags */}
        <meta name="description" content="Cotiza energía solar 100% en línea con instaladores verificados. Sin presión, sin llamadas, solo ofertas reales." />
        <meta name="keywords" content="energía solar, paneles solares, cotización solar, México, CFE, ahorro energético" />

        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Enerbook - Cotiza Energía Solar en Línea" />
        <meta property="og:description" content="La plataforma más rápida para cotizar energía solar con instaladores verificados." />
        <meta property="og:image" content="/img/og-image.png" />

        <title>Enerbook - Cotiza Energía Solar en Línea</title>

        {/* Favicon */}
        <link rel="icon" href="/img/Iconcolor.png" />
        <link rel="apple-touch-icon" href="/img/Iconcolor.png" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* CSS Reset for consistent mobile rendering */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Prevent iOS text size adjust */
          html {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }

          /* Smooth scrolling with touch momentum */
          html, body {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
          }

          /* Remove tap highlight color */
          * {
            -webkit-tap-highlight-color: transparent;
          }

          /* Prevent horizontal scroll */
          html, body {
            overflow-x: hidden;
            position: relative;
          }

          /* Fix for iOS safe areas */
          @supports (padding: env(safe-area-inset-bottom)) {
            body {
              padding-bottom: env(safe-area-inset-bottom);
              padding-left: env(safe-area-inset-left);
              padding-right: env(safe-area-inset-right);
            }
          }

          /* Ensure proper box-sizing */
          *, *::before, *::after {
            box-sizing: border-box;
          }

          /* Remove default margins */
          body {
            margin: 0;
            padding: 0;
          }

          /* Fix for input zoom on iOS */
          input, select, textarea {
            font-size: 16px !important;
          }

          @media screen and (max-width: 768px) {
            input, select, textarea {
              font-size: 16px !important;
            }
          }
        ` }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}