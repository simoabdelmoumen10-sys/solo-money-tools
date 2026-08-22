import { useMemo, useState, useEffect } from 'react';
import { Text as DreiText } from '@react-three/drei';

interface CashFlowChart3DProps {
  data: { month: string; paid: number }[];
  maxValue: number;
}

const CHART_WIDTH = 28;
const MAX_HEIGHT = 12;

// Disable per-file strict checks for R3F intrinsic JSX elements
// @ts-nocheck
export function CashFlowChart3D({ data, maxValue }: CashFlowChart3DProps) {
  const bars = useMemo(() => {
    return data.map((d, i) => {
      const height = maxValue > 0 ? (d.paid / maxValue) * MAX_HEIGHT : 0;
      const x = (i - (data.length - 1) / 2) * (CHART_WIDTH / data.length);
      return { ...d, x, height, index: i };
    });
  }, [data, maxValue]);

  const maxHeight = Math.max(...bars.map(b => b.height), 1);

  return (
    <group>
      {/* Grid floor */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[CHART_WIDTH + 4, 0.2, 12]} />
        <meshStandardMaterial color="#272521" transparent opacity={0.5} />
      </mesh>

      {/* Bars */}
      {bars.map(bar => (
        <AnimatedBar key={bar.month} {...bar} maxHeight={maxHeight} barWidth={CHART_WIDTH / data.length} />
      ))}

      {/* Month labels */}
      {bars.map(bar => (
        <DreiText
          key={`label-${bar.month}`}
          position={[bar.x, -MAX_HEIGHT / 2 - 1.5, 6.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.7}
          color="#f2f0ea"
          anchorX="center"
          anchorY="middle"
        >
          {bar.month.slice(2).replace('-', '/')}
        </DreiText>
      ))}

      {/* Y-axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
        <DreiText
          key={`y-${ratio}`}
          position={[-CHART_WIDTH / 2 - 1.5, -MAX_HEIGHT / 2 + ratio * MAX_HEIGHT, 0]}
          fontSize={0.6}
          color="rgba(242,240,234,0.5)"
          anchorX="right"
          anchorY="middle"
        >
          {Math.round(ratio * maxValue / 1000)}k
        </DreiText>
      ))}
    </group>
  );
}

function AnimatedBar({ paid, x, height, index, maxHeight, barWidth }: any) {
  const [currentHeight, setCurrentHeight] = useState(0);

  useEffect(() => {
    const duration = 800;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrentHeight(height * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => animate(), index * 100);
    return () => clearTimeout(timer);
  }, [height, index]);

  const color = paid > 0 ? '#7da6ff' : 'rgba(242,240,234,0.12)';

  return (
    <group>
      <mesh
        position={[x, -maxHeight / 2 + currentHeight / 2, 0]}
        scale={[barWidth * 0.7, currentHeight, 2]}
      >
        <boxGeometry />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.3} />
      </mesh>

      {paid > 0 && currentHeight > 0.5 && (
        <DreiText
          position={[x, -maxHeight / 2 + currentHeight + 0.5, 1.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.6}
          color="#7da6ff"
          anchorX="center"
          anchorY="bottom"
        >
          ${Math.round(paid / 1000)}k
        </DreiText>
      )}
    </group>
  );
}