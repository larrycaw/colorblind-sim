import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface ParticleSystemProps {
  width: number;
  height: number;
  particleCount?: number;
  colorblindType?: 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  visible?: boolean;
  offsetX?: number;
  offsetY?: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  width,
  height,
  particleCount = 20,
  colorblindType = 'normal',
  visible = true,
  offsetX = 0,
  offsetY = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  const getParticleColor = (type: string): string => {
    switch (type) {
      case 'protanopia':
        return '#00FF00'; // Green (easier to see)
      case 'deuteranopia':
        return '#0000FF'; // Blue (easier to see)
      case 'tritanopia':
        return '#FF0000'; // Red (easier to see)
      default:
        return '#FFFFFF'; // White
    }
  };

  // Initialize particles (only when component mounts or when dimensions/particle count changes)
  useEffect(() => {
    // Create particles even if canvas doesn't exist yet (for when visible becomes true)
    if (particlesRef.current.length === 0 || 
        particlesRef.current.length !== particleCount) {
      
      // Create particles
      const particles: Particle[] = [];
      const color = getParticleColor(colorblindType);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: Math.random() * 100,
          maxLife: 100,
          color,
        });
      }

      particlesRef.current = particles;
    }
  }, [width, height, particleCount, colorblindType]);

  // Initialize canvas when it becomes available
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  // Update particle colors when colorblind type changes (without recreating particles)
  useEffect(() => {
    if (particlesRef.current.length > 0) {
      const color = getParticleColor(colorblindType);
      particlesRef.current.forEach(particle => {
        particle.color = color;
      });
    }
  }, [colorblindType]);

  // Handle animation
  useEffect(() => {
    if (!visible) {
      // Stop animation if not visible
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      return;
    }

    // Wait for canvas to be available
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure canvas is properly sized
    canvas.width = width;
    canvas.height = height;

    const animate = () => {
      if (!visible) return;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= width) {
          particle.vx *= -1;
        }
        if (particle.y <= 0 || particle.y >= height) {
          particle.vy *= -1;
        }

        // Update life
        particle.life -= 0.5;
        if (particle.life <= 0) {
          particle.life = particle.maxLife;
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
        }

        // Draw particle
        const alpha = particle.life / particle.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visible, width, height]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className='particle-system'
      style={{
        position: 'absolute',
        top: offsetY,
        left: offsetX,
        width: width,
        height: height,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

export default ParticleSystem;
