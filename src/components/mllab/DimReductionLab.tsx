import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useApp } from '../../context/AppContext';

type Algorithm = 'pca' | 'tsne' | 'umap';

export default function DimReductionLab() {
  const { t } = useApp();
  const [algo, setAlgo] = useState<Algorithm>('tsne');

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
      
      <div className="absolute top-8 left-8 z-10">
        <div className="flex bg-white/5 p-1 border border-white/10 backdrop-blur-md">
          {(['pca', 'tsne', 'umap'] as Algorithm[]).map(a => (
            <button key={a} onClick={() => setAlgo(a)}
              className={`px-5 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${
                algo === a ? 'bg-brand-text text-brand-bg' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}>
              {a.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow">
        <Canvas camera={{ position: [0, 0, 15] }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} />
          
          <group>
            {points.map((p, i) => (
              <mesh key={i} position={p.position as [number, number, number]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshBasicMaterial color={p.color} transparent={false} opacity={1.0} />
              </mesh>
            ))}
          </group>

          <OrbitControls enablePan={true} enableZoom={true} autoRotate autoRotateSpeed={0.8} />
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={1} fade speed={1} />
        </Canvas>
      </div>
      
      <div className="absolute bottom-8 left-8 z-10 pointer-events-none text-brand-muted text-[9px] font-bold tracking-widest uppercase opacity-40">
        {t('lab.dim.orbitHint')}
      </div>
    </div>
  );
}
