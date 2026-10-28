import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useApp } from '../../context/AppContext';
import { Button, useColorMode, useColorModeValue } from '@chakra-ui/react';

type Algorithm = 'pca' | 'tsne' | 'umap';

export default function DimReductionLab() {
  const { t, lang } = useApp();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [algo, setAlgo] = useState<Algorithm>('tsne');

  const controlsBg = useColorModeValue('whiteAlpha.800', 'blackAlpha.600');
  const controlsBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');

  const points = useMemo(() => {
    const clusters = [
      { center: [5, 5, 5], color: '#3B82F6' }, // Blue
      { center: [-5, -5, -5], color: '#EF4444' }, // Red
      { center: [5, -5, 5], color: '#10B981' }, // Green
    ];

    let items: any[] = [];
    clusters.forEach(c => {
      for (let i = 0; i < 150; i++) {
        const spread = algo === 'pca' ? 8 : algo === 'tsne' ? 2 : 1.5;
        items.push({
          position: [
            c.center[0] + (Math.random() - 0.5) * spread,
            c.center[1] + (Math.random() - 0.5) * spread,
            algo === 'pca' ? c.center[2] + (Math.random() - 0.5) * spread : (Math.random() - 0.5) * spread * 0.5
          ],
          color: c.color,
        });
      }
    });
    return items;
  }, [algo]);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-transparent">
      {/* Top Left Controls */}
      <div className="absolute top-6 left-6 z-10">
        <div 
          className="flex p-1.5 rounded-xl border backdrop-blur-md shadow-sm gap-1"
          style={{ backgroundColor: controlsBg, borderColor: controlsBorder }}
        >
          {(['pca', 'tsne', 'umap'] as Algorithm[]).map(a => {
            const active = algo === a;
            return (
              <Button
                key={a}
                size="xs"
                variant={active ? 'solid' : 'ghost'}
                colorScheme="teal"
                borderRadius="lg"
                fontWeight={active ? 'bold' : 'medium'}
                onClick={() => setAlgo(a)}
              >
                {a.toUpperCase()}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-grow min-h-[380px]">
        <Canvas camera={{ position: [0, 0, 15] }}>
          <ambientLight intensity={isDark ? 0.6 : 0.9} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          
          <group>
            {points.map((p, i) => (
              <mesh key={i} position={p.position as [number, number, number]}>
                <boxGeometry args={[0.45, 0.45, 0.45]} />
                <meshStandardMaterial 
                  color={p.color} 
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
            ))}
          </group>

          <OrbitControls enablePan={true} enableZoom={true} autoRotate autoRotateSpeed={0.8} />
          {isDark && (
            <Stars radius={100} depth={50} count={1500} factor={4} saturation={1} fade speed={1} />
          )}
        </Canvas>
      </div>
      
      {/* Bottom hint */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none text-xs text-brand-muted bg-brand-card/60 backdrop-blur px-2.5 py-1 rounded">
        {t('lab.dim.orbitHint')}
      </div>
    </div>
  );
}
