"use client"
import { useEffect, useRef } from 'react';

export default function SnowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Pre-allocate 100 flakes
    const flakes: {x: number, y: number, size: number, speed: number, sway: number, rotation: number, isBig: boolean}[] = 
      new Array(100).fill(0).map(() => ({x: 0, y: 0, size: 0, speed: 0, sway: 0, rotation: 0, isBig: false}));
    
    // Initialize
    for (let i = 0; i < 80; i++) {
      flakes[i].x = Math.random() * canvas.width;
      flakes[i].y = Math.random() * -500;
      flakes[i].size = Math.random() * 4 + 1.5;
      flakes[i].speed = Math.random() * 1 + 0.3;
      flakes[i].sway = Math.random() * 12 - 6;
      flakes[i].isBig = false;
    }
    for (let i = 80; i < 100; i++) {
      flakes[i].x = Math.random() * canvas.width;
      flakes[i].y = Math.random() * -300;
      flakes[i].size = (Math.random() * 12 + 8) * 0.7;
      flakes[i].speed = Math.random() * 0.8 + 0.2;
      flakes[i].sway = Math.random() * 30 - 15;
      flakes[i].isBig = true;
    }
    
    // PRE-RENDER REAL SNOWFLAKE SHAPES (done ONCE)
    const smallFlake = document.createElement('canvas');
    smallFlake.width = 24; smallFlake.height = 24;
    const smallCtx = smallFlake.getContext('2d')!;
    smallCtx.fillStyle = 'rgba(230,240,255,0.9)';
    drawSnowflake(smallCtx, 12, 4, false); // Center at 12,12, size 4
    
    const bigFlake = document.createElement('canvas');
    bigFlake.width = 48; bigFlake.height = 48;
    const bigCtx = bigFlake.getContext('2d')!;
    bigCtx.shadowColor = 'rgba(200,220,255,0.6)';
    bigCtx.shadowBlur = 4;
    bigCtx.fillStyle = 'rgba(220,235,255,0.95)';
    drawSnowflake(bigCtx, 24, 8, true); // Center at 24,24, size 8
    
    function drawSnowflake(ctx: CanvasRenderingContext2D, cx: number, size: number, isBig: boolean) {
      // Center
      ctx.beginPath();
      ctx.arc(cx, cx, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      
      // 6 arms
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        ctx.save();
        ctx.translate(cx, cx);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.roundRect(size * 0.1, 0, size * 0.6, size * 0.12, size * 0.08);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.75, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      if (isBig) {
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(cx, cx, size * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,250,255,0.6)';
        ctx.fill();
      }
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let f = 0; f < 100; f++) {
        const flake = flakes[f];
        const swayX = Math.sin(flake.y * 0.01) * flake.sway;
        
        ctx.save();
        ctx.translate(flake.x + swayX, flake.y);
        ctx.rotate(flake.rotation);
        
        // SUPER FAST - just drawImage!
        if (flake.isBig) {
          ctx.shadowColor = 'rgba(200,220,255,0.6)';
          ctx.shadowBlur = 4;
          ctx.drawImage(bigFlake, -24, -24, flake.size * 3, flake.size * 3);
        } else {
          ctx.shadowBlur = 0;
          ctx.drawImage(smallFlake, -12, -12, flake.size * 3, flake.size * 3);
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
