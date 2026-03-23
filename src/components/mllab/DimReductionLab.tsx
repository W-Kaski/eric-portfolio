import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

type Algorithm = 'pca' | 'tsne' | 'umap';

export default function DimReductionLab() {
  const [algo, setAlgo] = useState<Algorithm>('tsne');

  const points = useMemo(() => {
    // Generate some clusters based on the algorithm selected
    const clusters = [
      { center: [5, 5, 5], color: '#3B82F6' }, // Blue
      { center: [-5, -5, -5], color: '#EF4444' }, // Red
      { center: [5, -5, 5], color: '#10B981' }, // Green
    ];

    let items: any[] = [];
    clusters.forEach(c => {
      for (let i = 0; i < 150; i++) {
        // PCA: more spread out, less clustered
        // t-SNE: tight clusters
        // UMAP: very tight, preserving topological structure
        const spread = algo === 'pca' ? 8 : algo === 'tsne' ? 2 : 1.5;
        items.push({
          position: [
            c.center[0] + (Math.random() - 0.5) * spread,
            c.center[1] + (Math.random() - 0.5) * spread,
            algo === 'pca' ? c.center[2] + (Math.random() - 0.5) * spread : (Math.random() - 0.5) * spread * 0.5 // t-SNE/UMAP tend to flatten
          ],
          color: c.color,
        });
      }
    });
    return items;
  }, [algo]);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-black/50 rounded-3xl">
      
      <div className="absolute top-6 left-6 z-10">
        <div className="flex bg-black/40 p-1 rounded-xl backdrop-blur-md border border-white/10">
          {(['pca', 'tsne', 'umap'] as Algorithm[]).map(a => (
            <button key={a} onClick={() => setAlgo(a)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors ${
                algo === a ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:text-white hover:bg-white/5'
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
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial color={p.color} transparent opacity={0.6} />
              </mesh>
            ))}
          </group>

          <OrbitControls enablePan={true} enableZoom={true} autoRotate autoRotateSpeed={0.8} />
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={1} fade speed={1} />
        </Canvas>
      </div>
      
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none text-brand-muted text-xs font-mono">
        Drag to rotate. Scroll to zoom.
      </div>
    </div>
  );
}
