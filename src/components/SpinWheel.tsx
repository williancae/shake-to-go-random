"use client";

import { Product } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface SpinWheelProps {
  products: Product[];
  onSpin: (winner: Product) => void;
}

export default function SpinWheel({ products, onSpin }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSector, setCurrentSector] = useState<Product | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinButtonRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Animation state
  const [angVel, setAngVel] = useState(0);
  const [ang, setAng] = useState(0);
  const [spinButtonClicked, setSpinButtonClicked] = useState(false);

  const friction = 0.991;
  const PI = Math.PI;
  const TAU = 2 * PI;

  const getIndex = useCallback(() => {
    if (products.length === 0) return 0;
    
    // Normalize angle to positive range [0, TAU)
    const normalizedAngle = ((ang % TAU) + TAU) % TAU;
    
    // Calculate which sector we're pointing at
    // The wheel rotates clockwise, so we need to invert the calculation
    const sectorAngle = TAU / products.length;
    const index = Math.floor(normalizedAngle / sectorAngle) % products.length;
    
    return index;
  }, [ang, products.length]);

  // Preload images - moved after drawWheel definition
  const preloadImages = useCallback(() => {
    products.forEach(product => {
      if (product.image && !imageCache.current.has(product.image)) {
        const img = new Image();
        
        img.onload = () => {
            imageCache.current.set(product.image!, img);
          // Trigger redraw when image loads
          setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                products.forEach((product, i) => drawSector(ctx, product, i));
              }
            }
          }, 100);
        };
        
        img.onerror = (error) => {
          console.error('Failed to load image:', product.image, error);
          // Mark as failed so we don't keep trying
          imageCache.current.set(product.image!, new Image()); // Empty image as marker
        };
        
        img.src = product.image;
      }
    });
  }, [products]);

  const drawSector = useCallback(
    (ctx: CanvasRenderingContext2D, product: Product, i: number) => {
      const rad = ctx.canvas.width / 2;
      const arc = TAU / products.length;
      const sectorAng = arc * i;

      ctx.save();

      // Sector background with Shake To Go green colors
      ctx.beginPath();
      ctx.fillStyle = i % 2 === 0 ? "#22c55e" : "#16a34a"; // Different shades of green
      ctx.moveTo(rad, rad);
      ctx.arc(rad, rad, rad, sectorAng, sectorAng + arc);
      ctx.lineTo(rad, rad);
      ctx.fill();

      // Product image from database
      if (product.image) {
        ctx.save();

        // Clip to sector shape first
        ctx.beginPath();
        ctx.moveTo(rad, rad); // Center of canvas
        ctx.arc(rad, rad, rad, sectorAng, sectorAng + arc);
        ctx.lineTo(rad, rad);
        ctx.clip();

        // Calculate image position from center
        const imageSize = 40; // Image diameter
        const distanceFromCenter = 130; // Distance from center of wheel

        // Calculate angle to center of sector
        const centerAngle = sectorAng + arc / 2;

        // Calculate x,y position using center as reference
        const imageX =
          rad + Math.cos(centerAngle) * distanceFromCenter - imageSize / 2;
        const imageY =
          rad + Math.sin(centerAngle) * distanceFromCenter - imageSize / 2;

        // Get cached image or draw placeholder
        const cachedImg = imageCache.current.get(product.image);
        
        if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
          // Draw the actual image with rotation
          ctx.save();
          ctx.beginPath();
          ctx.arc(
            imageX + imageSize / 2,
            imageY + imageSize / 2,
            imageSize / 2,
            0,
            TAU
          );
          ctx.clip();
          
          // Apply rotation if specified
          if (product.rotation) {
            ctx.save();
            ctx.translate(imageX + imageSize / 2, imageY + imageSize / 2);
            ctx.rotate((product.rotation * Math.PI) / 180);
            ctx.drawImage(cachedImg, -imageSize / 2, -imageSize / 2, imageSize, imageSize);
            ctx.restore();
          } else {
            ctx.drawImage(cachedImg, imageX, imageY, imageSize, imageSize);
          }
          ctx.restore();
        } else {
          // Draw placeholder while image loads
          ctx.save();
          ctx.beginPath();
          ctx.arc(
            imageX + imageSize / 2,
            imageY + imageSize / 2,
            imageSize / 2,
            0,
            TAU
          );
          // Use product index to create unique colors
          const hue = (i * 360) / products.length;
          ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Add product emoji or first character as identifier
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          // Fixed regex for emoji detection - using simple approach
          const emojiMatch = product.name.match(/[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]/);
          const emoji = emojiMatch ? emojiMatch[0] : product.name[0];
          ctx.fillText(emoji, imageX + imageSize / 2, imageY + imageSize / 2);
          
          ctx.restore();
        }
        
        ctx.restore();
      }

      ctx.restore();
    },
    [products.length, imageCache]
  );

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || products.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    products.forEach((product, i) => drawSector(ctx, product, i));
  }, [products, drawSector]);

  const rotate = useCallback(() => {
    if (!canvasRef.current) return;

    const sector = products[getIndex()];
    if (!sector) return;

    canvasRef.current.style.transform = `rotate(${ang - PI / 2}rad)`;
    
    setCurrentSector(sector);
  }, [ang, products, getIndex]);

  // Initialize current sector when products are loaded
  useEffect(() => {
    if (products.length > 0) {
      // Set the first product as initial sector
      setCurrentSector(products[0]);
    }
  }, [products]);

  // Update current sector during rotation
  useEffect(() => {
    if (products.length > 0) {
      const sector = products[getIndex()];
      if (sector) {
        setCurrentSector(sector);
      }
    }
  }, [ang, products, getIndex]);

  const frame = useCallback(() => {
    if (!angVel && spinButtonClicked) {
      const finalSector = products[getIndex()];
      if (finalSector) {
        setIsSpinning(false);
        setSpinButtonClicked(false);
        onSpin(finalSector);
      }
      return;
    }

    const newAngVel = angVel * friction;
    setAngVel(newAngVel < 0.002 ? 0 : newAngVel);
    setAng((prev) => (prev + newAngVel) % TAU);
  }, [angVel, spinButtonClicked, products, getIndex, onSpin, friction, TAU]);

  const engine = useCallback(() => {
    frame();
    animationRef.current = requestAnimationFrame(engine);
  }, [frame]);

  const handleSpin = () => {
    if (angVel || products.length === 0) return;

    // Calculate weighted random selection for final result
    const totalWeight = products.reduce(
      (sum, product) => sum + product.probability,
      0
    );
    let random = Math.random() * totalWeight;
    let selectedProductIndex = 0;

    // Find the selected product based on weighted probability
    let cumulativeWeight = 0;
    for (let i = 0; i < products.length; i++) {
      cumulativeWeight += products[i].probability;
      if (random <= cumulativeWeight) {
        selectedProductIndex = i;
        break;
      }
    }

    // Calculate the target angle to stop at the selected product
    const arc = TAU / products.length;
    const targetSectorMiddle = selectedProductIndex * arc + arc / 2;

    // Add some randomness within the sector (±25% of sector width)
    const sectorRandomness = (Math.random() - 0.5) * arc * 0.5;
    const targetAngle = targetSectorMiddle + sectorRandomness;

    // Calculate how many full rotations to add (2-4 full spins for dramatic effect)
    const fullRotations = 2 + Math.random() * 2;
    const finalTargetAngle = targetAngle + fullRotations * TAU;

    // Calculate the difference between current and target angle
    const angleDiff = finalTargetAngle - (ang % TAU);

    // Calculate initial velocity needed to reach target angle with friction
    // Using physics: finalAngle = initialAngle + (initialVelocity / (1 - friction))
    const targetInitialVel = angleDiff * (1 - friction);

    // Set the calculated initial velocity
    setAngVel(Math.abs(targetInitialVel));
    setSpinButtonClicked(true);
    setIsSpinning(true);
  };

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  useEffect(() => {
    rotate();
  }, [rotate]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(engine);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [engine]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-block">
        {/* Seta apontando para o item atual */}
        <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2 z-10 animate-pulse">
          <div className="relative">
            {/* Sombra da seta */}
            <div className="absolute top-[3px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[18px] border-r-[18px] border-t-[32px] border-l-transparent border-r-transparent border-t-black opacity-30 -z-20">
            </div>
            {/* Borda dourada da seta */}
            <div className="absolute top-[-1px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[19px] border-r-[19px] border-t-[34px] border-l-transparent border-r-transparent border-t-yellow-400 -z-10">
            </div>
            {/* Seta principal vermelha */}
            <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-500 filter drop-shadow-md">
            </div>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="block rounded-full shadow-2xl"
        />

        {/* Spin Button with Current Product Image */}
        <div
          ref={spinButtonRef}
          onClick={handleSpin}
          className={`
            absolute top-1/2 left-1/2 w-[30%] h-[30%] -ml-[15%] -mt-[15%]
            flex justify-center items-center
            rounded-full cursor-pointer select-none
            shadow-[0_0_0_8px_#22c55e,0_0_15px_5px_rgba(0,0,0,0.6)]
            transition-all duration-300 hover:scale-105
            ${
              isSpinning
                ? "pointer-events-none opacity-75"
                : "hover:scale-105"
            }
            overflow-hidden
          `}
          style={{
            backgroundColor: '#22c55e',
            backgroundImage: (currentSector?.image || products[0]?.image) ? `url(${currentSector?.image || products[0]?.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: (currentSector?.rotation || products[0]?.rotation) ? `rotate(${currentSector?.rotation || products[0]?.rotation || 0}deg)` : 'none'
          }}
        >
          {/* Light overlay for text contrast only */}
          {(currentSector?.image || products[0]?.image) && (
            <div className="absolute inset-0 bg-green-600 bg-opacity-40 rounded-full" />
          )}
          
          
          {/* Text */}
          <span className="relative z-10 text-center text-sm font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
            {isSpinning ? "Girando..." : "GIRAR!"}
          </span>
        </div>
      </div>

      {/* Current sector display */}
      {currentSector && (
        <div className="mt-4 text-center">
          <p className="text-green-600 font-semibold">
            {currentSector.name} - {currentSector.probability}%
          </p>
        </div>
      )}

      {products.length === 0 && (
        <p className="mt-4 text-gray-500 text-center">
          Nenhum produto ativo disponível para a roleta
        </p>
      )}
    </div>
  );
}
