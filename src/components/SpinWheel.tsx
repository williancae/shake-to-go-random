"use client";

import { Product } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SpinWheelProps {
  products: Product[];
  onSpin: (winner: Product) => void;
}

export default function SpinWheel({ products, onSpin }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSector, setCurrentSector] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Estado para ângulo acumulado em graus
  const [wheelDeg, setWheelDeg] = useState(0);

  // Constantes para cálculo determinístico
  const arcDeg = products.length > 0 ? 360 / products.length : 0;
  const pointerOffset = -90; // seta no topo = -90° (ou 270°)
  
  // Utilitário para normalizar ângulos em 0-360°
  const norm360 = (d: number) => ((d % 360) + 360) % 360;

  // Pré‑carregamento de imagens
  const preloadImages = useCallback(() => {
    products.forEach((product) => {
      if (product.image && !imageCache.current.has(product.image)) {
        const img = new Image();
        img.onload = () => {
          imageCache.current.set(product.image!, img);
          // Redesenha assim que carregar
          setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                products.forEach((p, i) => drawSector(ctx, p, i));
              }
            }
          }, 100);
        };
        img.onerror = () => {
          console.error("Failed to load image:", product.image);
          imageCache.current.set(product.image!, new Image());
        };
        img.src = product.image;
      }
    });
  }, [products]);

  const drawSector = useCallback(
    (ctx: CanvasRenderingContext2D, product: Product, i: number) => {
      const rad = ctx.canvas.width / 2;
      const arc = products.length > 0 ? (2 * Math.PI) / products.length : 0;
      const sectorAng = arc * i;

      ctx.save();
      // Fundo do setor
      ctx.beginPath();
      ctx.fillStyle = i % 2 === 0 ? "#22c55e" : "#16a34a";
      ctx.moveTo(rad, rad);
      ctx.arc(rad, rad, rad, sectorAng, sectorAng + arc);
      ctx.lineTo(rad, rad);
      ctx.fill();

      if (product.image) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(rad, rad);
        ctx.arc(rad, rad, rad, sectorAng, sectorAng + arc);
        ctx.lineTo(rad, rad);
        ctx.clip();

        const imageSize = 40;
        const distanceFromCenter = 130;
        const centerAngle = sectorAng + arc / 2;
        const imageX =
          rad + Math.cos(centerAngle) * distanceFromCenter - imageSize / 2;
        const imageY =
          rad + Math.sin(centerAngle) * distanceFromCenter - imageSize / 2;

        const cachedImg = imageCache.current.get(product.image);
        if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(
            imageX + imageSize / 2,
            imageY + imageSize / 2,
            imageSize / 2,
            0,
            2 * Math.PI
          );
          ctx.clip();

          if (product.rotation) {
            ctx.translate(imageX + imageSize / 2, imageY + imageSize / 2);
            ctx.rotate((product.rotation * Math.PI) / 180);
            ctx.drawImage(
              cachedImg,
              -imageSize / 2,
              -imageSize / 2,
              imageSize,
              imageSize
            );
          } else {
            ctx.drawImage(cachedImg, imageX, imageY, imageSize, imageSize);
          }
          ctx.restore();
        } else {
          // Placeholder
          ctx.save();
          ctx.beginPath();
          ctx.arc(
            imageX + imageSize / 2,
            imageY + imageSize / 2,
            imageSize / 2,
            0,
            2 * Math.PI
          );
          const hue = (i * 360) / products.length;
          ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = "#fff";
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const emojiMatch = product.name.match(
            /[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]/
          );
          const emoji = emojiMatch ? emojiMatch[0] : product.name[0];
          ctx.fillText(emoji, imageX + imageSize / 2, imageY + imageSize / 2);
          ctx.restore();
        }

        ctx.restore();
      }

      ctx.restore();
    },
    [products.length]
  );

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || products.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    products.forEach((p, i) => drawSector(ctx, p, i));
  }, [products, drawSector]);

  // Inicializa setor atual
  useEffect(() => {
    if (products.length > 0) {
      setCurrentSector(products[0]);
    } else {
      setCurrentSector(null);
    }
  }, [products]);

  // Handler de fim de transição
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTransitionEnd = () => {
      canvas.style.transition = 'none';
      setIsSpinning(false);
      if (selectedProduct) {
        onSpin(selectedProduct);
      }
    };

    canvas.addEventListener('transitionend', handleTransitionEnd);
    return () => canvas.removeEventListener('transitionend', handleTransitionEnd);
  }, [onSpin, selectedProduct]);

  const handleSpin = () => {
    if (isSpinning || products.length === 0) return;

    // Validação: soma das probabilidades
    const totalWeight = products.reduce((sum, p) => sum + p.probability, 0);
    if (totalWeight <= 0) {
      console.error("Soma das probabilidades deve ser maior que 0");
      return;
    }

    // 1. SELEÇÃO PONDERADA - escolhe o produto vencedor baseado na probability
    const rand = Math.random() * totalWeight;
    let selectedIdx = 0;
    let cum = 0;
    for (let i = 0; i < products.length; i++) {
      cum += products[i].probability;
      if (rand <= cum) {
        selectedIdx = i;
        break;
      }
    }

    const winner = products[selectedIdx];
    setSelectedProduct(winner);

    // 2. ÂNGULO ALVO EXATO
    const sectorCenter = selectedIdx * arcDeg + arcDeg / 2;  // 0-360
    const currentDeg = norm360(wheelDeg);                     // 0-360
    let delta = pointerOffset - sectorCenter - currentDeg;
    delta = norm360(delta);                                   // 0-360 (clockwise)

    // 3. VOLTAS DE SUSPENSE (múltiplos exatos de 360°)
    const extraTurns = (3 + Math.floor(Math.random() * 3)) * 360; // 3-5 voltas
    const finalDeg = wheelDeg + delta + extraTurns;

    // 4. APLICA TRANSIÇÃO CSS
    const canvas = canvasRef.current!;
    canvas.style.transition = 'transform 3.6s cubic-bezier(.05,.82,.53,.99)';
    canvas.style.transform = `rotate(${finalDeg}deg)`;

    setIsSpinning(true);
    setWheelDeg(finalDeg);
    setCurrentSector(winner);
  };

  // Ciclo de efeitos
  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  // Não renderiza se não há produtos
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-500">Carregando roleta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-block">
        {/* Seta */}
        <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2 z-10 animate-pulse">
          <div className="relative">
            <div className="absolute top-[3px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[18px] border-r-[18px] border-t-[32px] border-l-transparent border-r-transparent border-t-black opacity-30 -z-20" />
            <div className="absolute top-[-1px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[19px] border-r-[19px] border-t-[34px] border-l-transparent border-r-transparent border-t-yellow-400 -z-10" />
            <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-500 filter drop-shadow-md" />
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="block rounded-full shadow-2xl"
        />

        {/* Botão de girar */}
        <div
          onClick={handleSpin}
          className={`absolute top-1/2 left-1/2 w-[30%] h-[30%] -ml-[15%] -mt-[15%]
            flex justify-center items-center
            rounded-full cursor-pointer select-none
            shadow-[0_0_0_8px_#22c55e,0_0_15px_5px_rgba(0,0,0,0.6)]
            transition-all duration-300 hover:scale-105
            ${isSpinning ? "pointer-events-none" : ""}
            overflow-hidden`}
          style={{
            backgroundColor: "#22c55e",
          }}
        >
          {!isSpinning ? (
            <span className="relative z-10 text-center text-sm font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
              GIRAR!
            </span>
          ) : (
            <span className="relative z-10 text-center text-sm font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
              BOA SORTE 🤞
            </span>
          )}

        </div>
      </div>

      {/* Exibição do setor atual */}
      {currentSector ? (
        <div className="mt-4 text-center">
          <p className="text-green-600 font-semibold">
            {currentSector.name} – {currentSector.probability}%
          </p>
        </div>
      ) : (
        <p className="mt-4 text-gray-500 text-center">
          Nenhum produto ativo disponível para a roleta
        </p>
      )}
    </div>
  );
}
