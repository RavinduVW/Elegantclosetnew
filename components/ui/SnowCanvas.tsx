"use client"
import { useEffect, useRef, useCallback } from 'react';

interface Flake {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
}

export default function SnowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const flakes: Flake[] = [];
    for (let i = 0; i < 200; i++) {
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 2 + 0.5,
        sway: Math.random() * 20 - 10
      });
    }

    let animationFrameId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      flakes.forEach(flake => {
        ctx.beginPath();
        ctx.arc(
          flake.x + Math.sin(flake.y * 0.01) * flake.sway,
          flake.y,
          flake.size,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = '#fff';
        ctx.fill();

        flake.y += flake.speed;
        flake.x += Math.sin(flake.y * 0.01) * 0.5;
        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: 0.8 }}
    />
  );
}
