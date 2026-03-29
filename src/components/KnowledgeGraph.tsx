import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeProps,
  EdgeProps,
  BaseEdge,
  getSmoothStepPath,
  getBezierPath,
  EdgeLabelRenderer,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { cn } from '../lib/utils';
import { FileText, Folder, Layers, Share2, ChevronDown, RotateCcw } from 'lucide-react';
import { getLatticeGraphByRoot, LatticeNode } from '../lib/lattice';

// ─── Dagre Layout ─────────────────────────────────────────────────────────────

function runDagreLayout(nodes: any[], edges: any[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  // Increase nodesep significantly so external labels don't overlap horizontally
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 140, marginx: 60, marginy: 60 });
  
  nodes.forEach(n => {
    // Define exact sizes for Dagre layout engine
    const w = n.type === 'root' ? 240 : 
              n.type === 'domain' ? 200 : 
              n.type === 'branch' ? 180 : 
              48; // Paper node is a small circle (48x48)
              
    const h = n.type === 'root' ? 56 : 
              n.type === 'domain' ? 44 : 
              n.type === 'branch' ? 36 : 
              48; // Paper node is 48x48
              
    g.setNode(n.id, { width: w, height: h });
  });
  
  edges.filter((e: any) => !e.data?.dashed).forEach((e: any) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  
  return nodes.map(n => {
    const pos = g.node(n.id);
    const w = n.type === 'root' ? 240 : n.type === 'domain' ? 200 : n.type === 'branch' ? 180 : 48;
    const h = n.type === 'root' ? 56 : n.type === 'domain' ? 44 : n.type === 'branch' ? 36 : 48;
    return { ...n, position: { x: pos.x - w / 2, y: pos.y - h / 2 } };
  });
}

// ─── Custom Node ──────────────────────────────────────────────────────────────

const RegistryNode = ({ data, selected }: NodeProps) => {
  const type = data.type as string;
  const collapsed = !!(data as any).collapsed;
  const childCount = (data as any).childCount as number | undefined;

  const hStyle = { opacity: 0, width: 8, height: 8 } as React.CSSProperties;

  // 1. PAPER NODE: Small circular node with external label below
  if (type === 'article') {
    return (
      <div className="relative flex flex-col items-center group">
        <Handle type="target" position={Position.Top}    style={{ ...hStyle, top: -4 }} />
        <Handle type="target" position={Position.Left}   style={{ ...hStyle, left: -4 }} />
        <Handle type="source" position={Position.Bottom} style={{ ...hStyle, bottom: -4 }} />
        <Handle type="source" position={Position.Right}  style={{ ...hStyle, right: -4 }} />

        {/* Circular Hub */}
        <div className={cn(
          'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 cursor-pointer',
          selected
            ? 'bg-brand-text text-brand-bg border-brand-text shadow-[0_0_20px_rgba(255,255,255,0.2)]'
            : 'bg-brand-bg text-brand-text border-brand-border/60 group-hover:border-brand-text/80'
        )}>
          <FileText size={16} className={selected ? 'opacity-100' : 'opacity-60'} />
        </div>

        {/* External Label (Absolute positioned below so it doesn't affect ReactFlow/Dagre hitboxes) */}
        <div className="absolute top-[56px] w-[200px] text-center pointer-events-none">
          <p className={cn(
            'font-mono uppercase text-[9px] tracking-widest leading-tight drop-shadow-md',
            selected ? 'text-brand-text font-bold' : 'text-brand-muted font-medium'
          )}>
            {data.label as string}
          </p>
        </div>
      </div>
    );
  }

  // 2. RECTANGULAR NODES (Root, Domain, Branch)
  return (
    <>
      <Handle type="target" position={Position.Top}    style={{ ...hStyle, top: -4 }} />
      <Handle type="target" position={Position.Left}   style={{ ...hStyle, left: -4 }} />
      <Handle type="source" position={Position.Bottom} style={{ ...hStyle, bottom: -4 }} />
      <Handle type="source" position={Position.Right}  style={{ ...hStyle, right: -4 }} />

      <div className={cn(
        'flex items-center gap-3 transition-all duration-200 cursor-pointer select-none min-w-0',
        selected
          ? 'bg-brand-text text-brand-bg shadow-lg'
          : 'bg-brand-bg text-brand-text hover:bg-brand-text/5',
        type === 'root'    && 'px-6 py-4 border-2 border-brand-text w-[240px]',
        type === 'domain'  && 'px-5 py-3 border border-brand-border/80 w-[200px]',
        type === 'branch'  && 'px-4 py-2 border border-brand-border/40 w-[180px] rounded-full', // Pill shape for branches
      )}>
        <span className={cn('shrink-0', type === 'root' ? 'opacity-80' : 'opacity-50')}>
          {type === 'root'   ? <Layers size={14} />      :
           type === 'domain' ? <Share2 size={12} />      :
           <Folder size={11} />}
        </span>

        <div className="flex flex-col min-w-0 flex-1">
          <span className={cn(
            'font-mono uppercase tracking-widest truncate leading-tight',
            type === 'root'    ? 'text-[13px] font-black' :
            type === 'domain'  ? 'text-[11px] font-bold'  :
            'text-[10px] font-semibold text-brand-muted'
          )}>
            {data.label as string}
          </span>
          {(type === 'branch' || type === 'domain') && collapsed && childCount !== undefined && (
            <span className="text-[7px] font-mono text-brand-muted/50 uppercase mt-0.5">
              {childCount} nodes hidden
            </span>
          )}
        </div>

        {(type === 'branch' || type === 'domain') && (
          <span className={cn('shrink-0 opacity-40 transition-transform', collapsed && 'rotate-90')}>
            <ChevronDown size={10} />
          </span>
        )}
      </div>
    </>
  );
};

// ─── Custom Edge ──────────────────────────────────────────────────────────────

const RegistryEdge = (props: EdgeProps) => {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, markerEnd, data } = props;
  const isDashed = !!(data as any)?.dashed;

  let edgePath, labelX, labelY;
  
  if (isDashed) {
    // Cross-links use a curved, organic arc (bezier)
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
    });
  } else {
    // Hierarchy uses strict orthogonal lines (smoothstep)
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
      borderRadius: 12,
    });
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: isDashed ? 1 : 1.5,
          stroke: isDashed ? '#555' : '#444',
          strokeDasharray: isDashed ? '5 5' : undefined,
        }}
      />
      {label && isDashed && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className="bg-brand-bg/90 border border-brand-border/30 px-1.5 py-0.5 text-[7px] font-mono text-brand-muted/60 uppercase tracking-widest"
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// ─── Type Maps ────────────────────────────────────────────────────────────────

const nodeTypes = { root: RegistryNode, domain: RegistryNode, branch: RegistryNode, article: RegistryNode };
const edgeTypes = { registry: RegistryEdge };


// ─── Inner Graph ──────────────────────────────────────────────────────────────

function GraphInner({
  graphFolder,
  onSelectArticle,
  highlightedNodeId = 'all',
}: {
  graphFolder: string;
  onSelectArticle: (node: LatticeNode) => void;
  highlightedNodeId?: string;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setCenter, fitView } = useReactFlow();

  const prevHighlight = useRef<string>('');
  const nodeMapRef    = useRef<Record<string, any>>({});
  const rawGraphRef   = useRef<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const articleRef    = useRef<Record<string, LatticeNode>>({});

  // Collapsed node IDs
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Load + layout
  useEffect(() => {
    setCollapsed(new Set());
    getLatticeGraphByRoot(graphFolder).then(({ nodes: raw, edges: rawEdges }) => {
      raw.forEach(n => { if (n.type === 'article') articleRef.current[n.id] = n; });

      const rfNodes = raw.map(n => ({
        id: n.id, type: n.type,
        data: { label: n.label, type: n.type },
        position: { x: 0, y: 0 },
      }));
      const rfEdges = rawEdges.map(e => ({
        id: e.id, source: e.source, target: e.target,
        label: e.label, type: 'registry',
        data: { dashed: e.dashed ?? false },
      }));

      rawGraphRef.current = { nodes: rfNodes, edges: rfEdges };
      const layouted = runDagreLayout(rfNodes, rfEdges);
      layouted.forEach((n: any) => { nodeMapRef.current[n.id] = n; });

      setNodes(layouted);
      setEdges(rfEdges);
      prevHighlight.current = '';
      setTimeout(() => fitView({ duration: 500, padding: 0.15 }), 80);
    });
  }, [graphFolder, setNodes, setEdges, fitView]);

  // Apply collapse/expand to graph
  useEffect(() => {
    if (!rawGraphRef.current.nodes.length) return;
    const { nodes: allNodes, edges: allEdges } = rawGraphRef.current;

    // BFS: collect all descendant ids of collapsed nodes
    const edgeChildMap: Record<string, string[]> = {};
    allEdges.filter((e: any) => !e.data?.dashed).forEach((e: any) => {
      if (!edgeChildMap[e.source]) edgeChildMap[e.source] = [];
      edgeChildMap[e.source].push(e.target);
    });

    const hiddenIds = new Set<string>();
    collapsed.forEach(cid => {
      const queue = [...(edgeChildMap[cid] ?? [])];
      while (queue.length) {
        const nid = queue.shift()!;
        if (!hiddenIds.has(nid)) {
          hiddenIds.add(nid);
          (edgeChildMap[nid] ?? []).forEach((c: string) => queue.push(c));
        }
      }
    });

    // Count children for badge display
    const childCounts: Record<string, number> = {};
    collapsed.forEach(cid => {
      let count = 0;
      const q = [...(edgeChildMap[cid] ?? [])];
      while (q.length) { const n = q.shift()!; count++; (edgeChildMap[n] ?? []).forEach((c: string) => q.push(c)); }
      childCounts[cid] = count;
    });

    const visibleNodes = allNodes
      .filter((n: any) => !hiddenIds.has(n.id))
      .map((n: any) => ({
        ...n,
        data: {
          ...n.data,
          collapsed: collapsed.has(n.id),
          childCount: childCounts[n.id],
        },
      }));

    const visibleEdges = allEdges.filter((e: any) => !hiddenIds.has(e.source) && !hiddenIds.has(e.target));
    const layouted = runDagreLayout(visibleNodes, visibleEdges);
    layouted.forEach((n: any) => { nodeMapRef.current[n.id] = n; });
    setNodes(layouted);
    setEdges(visibleEdges);
    setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 60);
  }, [collapsed, setNodes, setEdges, fitView]);

  // Sidebar → viewport sync
  useEffect(() => {
    if (highlightedNodeId === prevHighlight.current) return;
    prevHighlight.current = highlightedNodeId;
    if (highlightedNodeId === 'all') { fitView({ duration: 700, padding: 0.15 }); return; }
    const n = nodeMapRef.current[highlightedNodeId];
    // Center roughly on the node's position (using a fixed 100px offset since sizes vary)
    if (n) setCenter(n.position.x + 100, n.position.y + 30, { zoom: 1.4, duration: 700 });
  }, [highlightedNodeId, fitView, setCenter]);

  // Re-layout handler
  const handleReLayout = useCallback(() => {
    const currentNodes = nodes.map(n => ({ ...n, data: { ...n.data } }));
    const currentEdges = edges.map(e => ({ ...e }));
    const layouted = runDagreLayout(currentNodes, currentEdges);
    layouted.forEach((n: any) => { nodeMapRef.current[n.id] = n; });
    setNodes(layouted);
    setTimeout(() => fitView({ duration: 500, padding: 0.15 }), 60);
  }, [nodes, edges, setNodes, fitView]);

  // Node click: collapse toggle for branch/domain, read for article
  const onNodeClick = useCallback(async (_: any, node: any) => {
    if (node.type === 'article') {
      const a = articleRef.current[node.id];
      if (a) onSelectArticle(a);
      return;
    }
    if (node.type === 'branch' || node.type === 'domain') {
      setCollapsed(prev => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
        return next;
      });
    }
  }, [onSelectArticle]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      colorMode="dark"
      className="bg-brand-bg"
      minZoom={0.08}
      maxZoom={3}
      defaultEdgeOptions={{ type: 'registry' }}
      fitView={false}
    >
      <Background color="#222" gap={24} size={1} />
      <Controls showInteractive={false} className="!border-brand-border/30 !bg-brand-bg/90 !shadow-xl" />
      <MiniMap
        position="bottom-right"
        style={{ background: '#111', border: '1px solid #333', bottom: 16, right: 16, borderRadius: 8, overflow: 'hidden' }}
        nodeColor={(n) =>
          n.type === 'root' ? '#fff' : n.type === 'domain' ? '#888' : n.type === 'branch' ? '#555' : '#333'
        }
        maskColor="rgba(0,0,0,0.7)"
      />
      <Panel position="top-right">
        <button
          onClick={handleReLayout}
          className="flex items-center gap-2 bg-brand-bg/90 border border-brand-border/40 px-3 py-2 text-[9px] font-mono text-brand-muted uppercase tracking-widest hover:bg-brand-text hover:text-brand-bg md:mr-2 md:mt-2 transition-all backdrop-blur-sm"
          title="Re-apply Dagre layout and fit to screen"
        >
          <RotateCcw size={10} />
          Re-Layout
        </button>
      </Panel>
    </ReactFlow>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function KnowledgeGraph(props: {
  graphFolder: string;
  onSelectArticle: (a: LatticeNode) => void;
  highlightedFolder?: string;
}) {
  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <GraphInner
          graphFolder={props.graphFolder}
          onSelectArticle={props.onSelectArticle}
          highlightedNodeId={props.highlightedFolder}
        />
      </ReactFlowProvider>
    </div>
  );
}
