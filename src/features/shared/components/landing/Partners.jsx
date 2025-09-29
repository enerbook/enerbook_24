import React from "react";
import Reveal from "./Reveal";

const partners = [
  { name: "Huawei",         logo: "/img/partners/huawei.png" },
  { name: "Canadian Solar", logo: "/img/partners/canadian-solar.webp" },
  { name: "Growatt",        logo: "/img/partners/growatt.png" },
  { name: "IUSA 1939",      logo: "/img/partners/iusa.png" },
  { name: "K2 Systems",     logo: "/img/partners/k2.webp" },
  { name: "LONGi Solar",    logo: "/img/partners/longi-solar.png" },
  { name: "SMA",            logo: "/img/partners/sma.png" },
  { name: "ABB",            logo: "/img/partners/abb.png" },
];

export default function Partners() {
  return (
    <section
      id="partners"
      className="relative isolate w-full bg-[#faf8f7] border-y border-black/5 py-16 sm:py-20 md:py-24 lg:py-32"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center min-h-[60vh]">
        <Reveal className="text-center">
          <h3 className="text-[#0b1220] font-extrabold uppercase tracking-wide
                         text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
            Empresas aliadas
          </h3>
        </Reveal>

        <Reveal delay={0.03}>
          <div
            className="mt-6 sm:mt-8 md:mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4
                       gap-x-6 sm:gap-x-6 md:gap-x-8 lg:gap-x-12 xl:gap-x-16 2xl:gap-x-20 
                       gap-y-8 sm:gap-y-8 md:gap-y-10 lg:gap-y-12
                       place-items-center max-w-5xl mx-auto"
          >
            {partners.map((p) => (
              <div key={p.name} className="flex items-center justify-center h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20">
                <img
                  src={p.logo}
                  alt={p.name}
                  className="max-h-8 sm:max-h-9 md:max-h-10 lg:max-h-12 xl:max-h-14 2xl:max-h-16 w-auto object-contain transition-transform hover:scale-110"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
