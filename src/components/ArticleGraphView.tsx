import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-force';
import { Article } from '@/src/lib/articles';
import { useApp } from '@/src/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

// Nodes and Links for D3
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  group: string; // usually folder or category
  radius: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

export function ArticleGraphView({ articles }: { articles: Article[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useApp();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const widthRef = useRef(800);
  const heightRef = useRef(600);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    // Prepare Data
    const nodes: GraphNode[] = articles.map(a => ({
      id: a.id,
      name: a.title,
      group: a.folder,
      radius: Math.max(4, Math.min(10, 4 + (a.outboundLinks?.length || 0) * 0.5)) // size based on outbound links
    }));

    const links: GraphLink[] = [];
    const nodeIds = new Set(nodes.map(n => n.id));

    articles.forEach(article => {
      // Wiki links
      if (article.outboundLinks) {
        article.outboundLinks.forEach(targetId => {
          if (nodeIds.has(targetId) && targetId !== article.id) {
            links.push({ source: article.id, target: targetId });
          }
        });
      }
      
      // Implicit link to parent folder? That increases visual clutter. 
      // Let's stick only to explicit obsidian links for edges. 
      // If none, the nodes will just group by force center or many-body.
      // Actually, if we want connected clusters based on folders, let's add invisible or light structural edges.
      // We will only use them if we have no links, but D3 handles disconnected graphs fine via manyBody.
    });

    // Theme Colors
    const isDark = theme === 'dark';
    const textColor = isDark ? '#d4d4d4' : '#171717';
    const nodeColors = [
      '#EF476F', '#FFD166', '#06D6A0', '#118AB2', 
      '#073B4C', '#8338EC', '#3A86FF', '#FB5607'
    ];
    
    // Categorical Colors (Deterministic)
    const categoryColorMap: Record<string, string> = {
      'A Symbolic AI': '#EF476F',
      'B Connectionist AI': '#118AB2',
      'C Evolutionary Computation': '#06D6A0',
      'D Decision, Causality & Game Theory': '#FFD166',
      'E AI Systems & Engineering': '#8338EC',
      'F AI Safety & Society': '#FB5607',
      'G Cross-Disciplinary & Emerging Directions': '#3A86FF',
      'papers': '#073B4C'
    };

    const getGroupColor = (group: string) => {
      return categoryColorMap[group] || '#94a3b8'; // fallback to slate-400
    };

    // Canvas Setup
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas internal resolution to match display size exactly but support high DPI
    const pixelRatio = window.devicePixelRatio || 1;
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      widthRef.current = width;
      heightRef.current = height;
      
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(pixelRatio, pixelRatio);
      
      if (simulationRef.current) {
        simulationRef.current.force("center", d3.forceCenter(width / 2, height / 2));
        simulationRef.current.alpha(0.1).restart(); // Gentler restart on resize
      }
    });
    
    resizeObserver.observe(containerRef.current);

    // Initial explicit sizing before observer ticks perfectly
    const bounds = containerRef.current.getBoundingClientRect();
    widthRef.current = bounds.width || 800;
    heightRef.current = bounds.height || 600;

    // View Transformation (Pan / Zoom)
    let transform = { x: widthRef.current / 2, y: heightRef.current / 2, k: 0.8 };
    // Center it initially
    transform.x = widthRef.current / 2 - (widthRef.current / 2) * transform.k;
    transform.y = heightRef.current / 2 - (heightRef.current / 2) * transform.k;
    
    let hoveredNode: GraphNode | null = null;

    // Simulation Setup
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(50).strength(1))
      .force("charge", d3.forceManyBody().strength(-100)) // Reduced repulsion to prevent 'exploding'
      .force("collide", d3.forceCollide().radius(d => (d as GraphNode).radius + 15).iterations(2))
      .force("center", d3.forceCenter(widthRef.current / 2, heightRef.current / 2))
      .velocityDecay(0.3); // Balanced for smooth movement

    let simulationRef: { current: d3.Simulation<GraphNode, GraphLink> } = { current: simulation };

    // Render Function
    const render = () => {
      const w = widthRef.current;
      const h = heightRef.current;
      ctx.clearRect(0, 0, w, h);
      
      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Draw Edges
      ctx.beginPath();
      links.forEach(link => {
        const src = link.source as unknown as GraphNode;
        const tgt = link.target as unknown as GraphNode;
        
        ctx.moveTo(src.x!, src.y!);
        ctx.lineTo(tgt.x!, tgt.y!);
      });
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1 / transform.k; 
      ctx.stroke();

      // Draw Nodes & Text
      nodes.forEach(node => {
        const isHovered = node === hoveredNode;
        
        ctx.beginPath();
        ctx.moveTo((node.x!) + node.radius, node.y!);
        ctx.arc(node.x!, node.y!, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = getGroupColor(node.group);
        ctx.globalAlpha = isHovered ? 1 : 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        if (isHovered) {
          ctx.strokeStyle = textColor;
          ctx.lineWidth = 2 / transform.k;
          ctx.stroke();
        }

        ctx.font = `${isHovered ? 'bold' : ''} ${Math.max(4, 10 / transform.k)}px Inter, sans-serif`;
        ctx.fillStyle = isHovered ? textColor : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)');
        ctx.fillText(node.name, (node.x!) + node.radius + 4, (node.y!) + 4);
      });

      ctx.restore();
    };

    simulation.on("tick", render);

    // Interaction Setup
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let draggedNode: GraphNode | null = null;
    let dragDistance = 0;
    
    const invert = (x: number, y: number) => {
       return {
         x: (x - transform.x) / transform.k,
         y: (y - transform.y) / transform.k
       }
    }

    const mouseMoveHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / pixelRatio / rect.width;
      const scaleY = canvas.height / pixelRatio / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      
      if (isDragging) {
         dragDistance += Math.abs(mouseX - dragStart.x) + Math.abs(mouseY - dragStart.y);
         
         if (draggedNode) {
             const { x: rx, y: ry } = invert(mouseX, mouseY);
             draggedNode.fx = rx;
             draggedNode.fy = ry;
             simulation.alpha(0.1).restart(); // Keep simulation alive during drag without popping
         } else {
             transform.x += (mouseX - dragStart.x);
             transform.y += (mouseY - dragStart.y);
             render();
         }
         dragStart = { x: mouseX, y: mouseY };
      } else {
         const { x: rx, y: ry } = invert(mouseX, mouseY);
         let newHovered: GraphNode | null = null;
         for (let i = nodes.length - 1; i >= 0; i--) {
           const n = nodes[i];
           const dx = rx - (n.x || 0);
           const dy = ry - (n.y || 0);
           if (dx * dx + dy * dy < (n.radius + 4) * (n.radius + 4)) {
             newHovered = n;
             break;
           }
         }
         if (hoveredNode !== newHovered) {
           hoveredNode = newHovered;
           canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
           render();
         }
      }
    };
    
    const mouseDownHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / pixelRatio / rect.width;
      const scaleY = canvas.height / pixelRatio / rect.height;
      isDragging = true;
      dragDistance = 0;
      dragStart = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
      
      if (hoveredNode) {
         draggedNode = hoveredNode;
         simulation.alphaTarget(0.1).restart(); // Lower alpha target for smoother dragging
         draggedNode.fx = draggedNode.x;
         draggedNode.fy = draggedNode.y;
      }
      canvas.style.cursor = 'grabbing';
    }
    
    const mouseUpHandler = () => {
      isDragging = false;
      if (draggedNode) {
         draggedNode.fx = null;
         draggedNode.fy = null;
         draggedNode = null;
         simulation.alphaTarget(0);
      }
      canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
    }
    
    const clickHandler = () => {
       if (hoveredNode && dragDistance < 10) {
           // Provide the full URL with query params to maintain view mode if we rely on search params later
           // Although the navigate handles it depending on implementation, typically we just navigate strictly
           navigate(`/articles/${hoveredNode.id}`);
       }
    }
    
    const wheelHandler = (e: WheelEvent) => {
        e.preventDefault();
        const xs = (e.clientX - canvas.getBoundingClientRect().left) / rectWidth();
        const ys = (e.clientY - canvas.getBoundingClientRect().top) / rectHeight();
        
        const mouseX = xs * widthRef.current;
        const mouseY = ys * heightRef.current;
        
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newK = Math.max(0.1, Math.min(4, transform.k * zoomDelta));
        
        transform.x = mouseX - (mouseX - transform.x) * (newK / transform.k);
        transform.y = mouseY - (mouseY - transform.y) * (newK / transform.k);
        transform.k = newK;
        
        render();
    }
    
    const rectWidth = () => canvas.getBoundingClientRect().width;
    const rectHeight = () => canvas.getBoundingClientRect().height;

    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    canvas.addEventListener('click', clickHandler);
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    
    canvas.style.cursor = 'grab';

    return () => {
      simulation.stop();
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      canvas.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      canvas.removeEventListener('click', clickHandler);
      canvas.removeEventListener('wheel', wheelHandler);
    };
  }, [articles, theme, navigate]);

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "relative rounded-xl overflow-hidden border border-brand-border/40 bg-brand-bg transition-all",
        isFullscreen ? "fixed inset-0 z-50 rounded-none w-screen h-screen m-0 border-0" : "w-full h-[600px] xl:h-[700px]"
      )}
    >
      <button 
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-brand-card/50 backdrop-blur-md border border-brand-border text-brand-muted hover:text-brand-text transition-colors"
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />
    </div>
  );
}
