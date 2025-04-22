import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Importar ReactQuill de forma dinámica para evitar errores de SSR
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => <p className="text-center text-zinc-500 dark:text-zinc-400">Cargando...</p>
});

export default function FlashCard({
  card,
  isCurrent,
  isNext,
  isHidden,
  flipped,
  onFlip,
}) {
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    // Importar estilos de Quill solo en el cliente
    const loadStyles = async () => {
      await import("react-quill/dist/quill.bubble.css");
      await import("./cardQuillStyle.css");
      setStylesLoaded(true);
    };
    
    loadStyles();
  }, []);

  const handleClick = () => {
    if (isCurrent) {
      onFlip();
    }
  };

  return (
    <div
      className={`absolute w-[90vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw] h-[50vh] sm:h-[50vh] md:h-[50vh] lg:h-[45vh] bg-transparent shadow-lg rounded-xl cursor-pointer flex justify-center items-center text-center transition-all duration-500 ease-in-out ${
        isHidden ? "hidden" : ""
      } ${isNext || !isCurrent ? "blur-sm opacity-50" : ""}`}
      style={{
        transform: isCurrent
          ? "translateX(0)"
          : isNext
          ? "translateX(15vw) scale(0.9)" // Tarjeta a la derecha
          : "translateX(-15vw) scale(0.8)", // Tarjeta a la izquierda
        zIndex: isCurrent ? 10 : 5,
      }}
      onClick={handleClick}
    >
      <div
        className="w-full h-full flex justify-center items-center transition-all duration-600"
        style={{ 
          perspective: "1000px",
          transform: flipped && isCurrent ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* Tarjeta frontal */}
        <div
          className={`absolute w-full h-full flex justify-center items-center rounded-xl bg-blue-200 text-black p-2 sm:p-4 transition-all duration-500 backface-hidden`}
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <span
            className="text-sm sm:text-lg"
          >
            {!flipped && stylesLoaded && typeof window !== 'undefined' && (
              <ReactQuill
                value={card.question}
                readOnly={true}
                modules={{ toolbar: false }}
                theme="bubble"
                className="text-xs sm:text-sm text-muted-foreground"
              />
            )}
          </span>
        </div>

        {/* Tarjeta trasera */}
        <div
          className={`absolute w-full h-full flex justify-center items-center rounded-xl bg-green-200 text-black p-2 sm:p-4 transition-all duration-500 backface-hidden`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="text-sm sm:text-lg">
            {flipped && stylesLoaded && typeof window !== 'undefined' && (
              <ReactQuill
                value={card.answer}
                readOnly={true}
                modules={{ toolbar: false }}
                theme="bubble"
                className="text-xs sm:text-sm text-muted-foreground"
              />
            )}
          </span>
        </div>
      </div>
      
      <style jsx>{`
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
