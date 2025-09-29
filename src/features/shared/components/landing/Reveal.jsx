import React, { useEffect, useRef, useState } from "react";

/**
 * Reveal seguro:
 * - Usa IntersectionObserver para disparar la animación una sola vez
 * - No manipula el DOM con elref.style en efectos (evita removeChild)
 * - Acepta className, delay y 'as' para elegir la etiqueta contenedora
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  style = {},
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const baseStyle = {
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 600ms ease-out ${delay}s, transform 600ms ease-out ${delay}s`,
    willChange: "opacity, transform",
    ...style,
  };

  return (
    <Tag ref={ref} className={className} style={baseStyle}>
      {children}
    </Tag>
  );
}
