"use client"
import { useEffect, useRef } from 'react';

export default function SnowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    
    let frameCount = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Pre-allocate flakes array
    const flakes: {x: number, y: number, size: number, speed: number, sway: number, rotation: number, isBig: boolean}[] = [];
    
    for (let i = 0; i < 80; i++) {
      flakes[i] = {
        x: Math.random() * canvas.width,
        y: Math.random() * -500,
        size: Math.random() * 4 + 1.5,
        speed: Math.random() * 1 + 0.3,
        sway: Math.random() * 12 - 6,
        rotation: 0,
        isBig: false
      };
    }
    
    // BIG snowflakes REDUCED 30% (was 8-20px, now 5.6-14px)
    for (let i = 80; i < 100; i++) {
      flakes[i] = {
        x: Math.random() * canvas.width,
        y: Math.random() * -300,
        size: (Math.random() * 12 + 8) * 0.7,  // 30% SMALLER
        speed: Math.random() * 0.8 + 0.2,
        sway: Math.random() * 30 - 15,
        rotation: 0,
        isBig: true
      };
    }
    
    // Pre-compute sin table for 6 arms
    const sinTable = new Float32Array(6);
    for (let i = 0; i < 6; i++) {
      sinTable[i] = Math.sin((Math.PI / 3) * i);
    }
    
    const animate = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let f = 0; f < 100; f++) {
        const flake = flakes[f];
        const swayX = Math.sin(flake.y * 0.01) * flake.sway;
        const rotX = flake.x + swayX;
        const rotY = flake.y;
        
        ctx.save();
        ctx.translate(rotX, rotY);
        ctx.rotate(flake.rotation);
        
        if (flake.isBig) {
          ctx.shadowColor = 'rgba(200,220,255,0.6)';
          ctx.shadowBlur = 4;
          ctx.fillStyle = 'rgba(220,235,255,0.95)';
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(230,240,255,0.9)';
        }
        
        // ULTRA FAST snowflake drawing
        ctx.beginPath();
        ctx.arc(0, 0, flake.size * 0.25, 0, Math.PI * 2); // Center
        
        // Pre-computed 6 arms (no loops!)
        for (let i = 0; i < 6; i++) {
          const angle = i * (Math.PI / 3);
          const cosA = Math.cos(angle);
          const sinA = sinTable[i];
          
          ctx.save();
          ctx.rotate(angle);
          ctx.roundRect(flake.size * 0.1, 0, flake.size * 0.6, flake.size * 0.12, flake.size * 0.08);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(flake.size * 0.75, 0, flake.size * 0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        
        if (flake.isBig) {
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(0, 0, flake.size * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(240,250,255,0.6)';
          ctx.fill();
        }
        
        ctx.restore();
        
        flake.y += flake.speed;
        flake.rotation += flake.isBig ? 0.01 : 0.02;
        flake.x += Math.sin(flake.y * 0.01) * (flake.isBig ? 0.5 : 0.3);
        
        if (flake.y > canvas.height) {
          flake.y = -(Math.random() * 100);
          flake.x = Math.random() * canvas.width;
          flake.rotation = 0;
        }
      }
      
      requestAnimationFrame(animate);
    };
    animate();
    
    return () => window.removeEventListener('resize', resize);
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60] opacity-95" />;
}
