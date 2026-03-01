interface LogoMarkProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

/**
 * The LogicLot spider-web network icon.
 * 8 dark nodes arranged in an octagon, connected by light gray lines,
 * with a bright green center hub.
 */
export function LogoMark({ size = 32, className = "", animate = false }: LogoMarkProps) {
  // 8 outer nodes at radius 36 from center (50,50), evenly spaced
  const outerRadius = 36;
  const cx = 50;
  const cy = 50;
  const nodePositions: [number, number][] = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180;
    return [
      cx + outerRadius * Math.sin(angle),
      cy - outerRadius * Math.cos(angle),
    ];
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Octagon perimeter lines */}
      {nodePositions.map((pos, i) => {
        const next = nodePositions[(i + 1) % 8];
        return (
          <line
            key={`edge-${i}`}
            x1={pos[0]}
            y1={pos[1]}
            x2={next[0]}
            y2={next[1]}
            stroke="#BEC9D4"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        );
      })}

      {/* Spoke lines from center to each outer node */}
      {nodePositions.map((pos, i) => (
        <line
          key={`spoke-${i}`}
          x1={cx}
          y1={cy}
          x2={pos[0]}
          y2={pos[1]}
          stroke="#BEC9D4"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ))}

      {/* Outer nodes */}
      {nodePositions.map((pos, i) => (
        <circle
          key={`node-${i}`}
          cx={pos[0]}
          cy={pos[1]}
          r="4.5"
          fill="#354D6A"
        />
      ))}

      {/* Center hub — green */}
      <circle
        cx={cx}
        cy={cy}
        r="6.5"
        fill="#8DC63F"
        className={animate ? "animate-pulse" : undefined}
      />
    </svg>
  );
}
