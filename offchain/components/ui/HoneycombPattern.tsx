import React from 'react';

interface HexagonProps {
  size: number;
  color: string;
  top: number;
  left: number;
  opacity: number;
  rotate?: number;
}

const Hexagon = ({ size, color, top, left, opacity, rotate = 0 }: HexagonProps) => (
  <div style={{
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    width: `${size}px`,
    height: `${size * 0.866}px`,
    background: color,
    opacity,
    transform: `rotate(${rotate}deg)`,
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    transition: 'opacity 0.3s ease'
  }} />
);

interface HoneycombPatternProps {
  position: 'left' | 'right';
  baseColor: string;
}

export const HoneycombPattern = ({ position, baseColor }: HoneycombPatternProps) => {
  // Generate random positions for hexagons
  const hexagons = Array.from({ length: 15 }, (_, i) => ({
    size: Math.random() * 30 + 40, // Random size between 40-70px
    top: Math.random() * 300,
    left: Math.random() * 300,
    opacity: Math.random() * 0.2 + 0.1, // Random opacity between 0.1-0.3
    rotate: Math.random() * 360, // Random rotation
  }));

  return (
    <div style={{
      position: 'fixed',
      bottom: '-50px',
      [position]: '-50px',
      width: '400px',
      height: '400px',
      zIndex: 0,
      transform: position === 'left' ? 'rotate(-15deg)' : 'rotate(15deg)',
      pointerEvents: 'none'
    }}>
      {hexagons.map((hex, index) => (
        <Hexagon
          key={index}
          size={hex.size}
          color={baseColor}
          top={hex.top}
          left={hex.left}
          opacity={hex.opacity}
          rotate={hex.rotate}
        />
      ))}
    </div>
  );
}; 