import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getDarkerHex } from '../utils/colorUtils';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  isAccent?: boolean;
}

function hexToRgbComponents(hex: string): { r: number; g: number; b: number } {
  if (!hex || !hex.startsWith('#')) return { r: 0, g: 51, b: 102 };
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 0, g: 51, b: 102 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export const DynamicGovCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { primaryColor } = useTheme();
  const primaryColorRef = useRef(primaryColor);

  useEffect(() => {
    primaryColorRef.current = primaryColor;
  }, [primaryColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Mouse coordinates for gentle interactive reaction
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Particles configuration for state agency digital network
    let particles: Particle[] = [];
    const PARTICLE_COUNT = 55;
    const CONNECT_DISTANCE = 135;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const radius = Math.random() * 2 + 1.5;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius,
          baseRadius: radius,
          alpha: Math.random() * 0.4 + 0.35,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
          isAccent: i % 7 === 0, // Accent gold/cyan nodes representing key directives
        });
      }
    };

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect ? rect.width : window.innerWidth;
      height = rect ? rect.height : window.innerHeight;
      dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticles();
    };

    window.addEventListener('resize', resize);
    resize();

    let waveOffset = 0;

    const render = () => {
      waveOffset += 0.008;

      const currentColor = primaryColorRef.current || '#003366';
      const rgb = hexToRgbComponents(currentColor);
      const darkStop1 = getDarkerHex(currentColor, 45);
      const darkStop2 = getDarkerHex(currentColor, 15);
      const darkStop3 = getDarkerHex(currentColor, 50);

      // 1. Clear with dynamic gradient background based on selected primary color
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, darkStop1);
      bgGrad.addColorStop(0.5, darkStop2);
      bgGrad.addColorStop(1, darkStop3);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle radial glow behind the center card area using dynamic theme color
      const centerGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.55
      );
      centerGlow.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`);
      centerGlow.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`);
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      // 3. Subtle digital governance wave curves
      ctx.save();
      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const yBase = height * (0.65 + w * 0.12);
        ctx.moveTo(0, yBase);

        for (let x = 0; x <= width; x += 15) {
          const y =
            yBase +
            Math.sin(x * 0.003 + waveOffset * (1 + w * 0.4) + w * 1.5) * 28 +
            Math.cos(x * 0.002 - waveOffset * 0.6) * 16;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, yBase - 40, 0, height);
        waveGrad.addColorStop(
          0,
          w === 0
            ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
            : w === 1
            ? `rgba(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)}, 0.10)`
            : 'rgba(255, 215, 0, 0.02)'
        );
        waveGrad.addColorStop(1, `rgba(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)}, 0.2)`);
        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Wave top border line
        ctx.lineWidth = 1;
        ctx.strokeStyle =
          w === 0
            ? `rgba(${Math.min(255, rgb.r + 80)}, ${Math.min(255, rgb.g + 80)}, ${Math.min(255, rgb.b + 80)}, 0.2)`
            : 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();
      }
      ctx.restore();

      // 4. Subtle administrative coordinate grid lines
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Connect particles with lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DISTANCE) {
            const alpha = (1 - dist / CONNECT_DISTANCE) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle =
              p1.isAccent || p2.isAccent
                ? `rgba(234, 179, 8, ${alpha * 0.9})`
                : `rgba(${Math.min(255, rgb.r + 100)}, ${Math.min(255, rgb.g + 100)}, ${Math.min(255, rgb.b + 100)}, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // 6. Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Pulse size
        p.pulsePhase += p.pulseSpeed;
        const pulse = Math.sin(p.pulsePhase) * 0.6;
        const currentRadius = Math.max(1, p.baseRadius + pulse);

        // Movement
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on edges with soft wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Gentle interactive mouse repel/nudge
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < mouse.radius && mDist > 0) {
          const force = (1 - mDist / mouse.radius) * 0.6;
          p.x += (mdx / mDist) * force;
          p.y += (mdy / mDist) * force;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);

        if (p.isAccent) {
          ctx.fillStyle = `rgba(250, 204, 21, ${p.alpha + 0.25})`; // Yellow/Gold accent
          ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(${Math.min(255, rgb.r + 120)}, ${Math.min(255, rgb.g + 120)}, ${Math.min(255, rgb.b + 120)}, ${p.alpha})`;
          ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
          ctx.shadowBlur = 4;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ display: 'block' }}
    />
  );
};

