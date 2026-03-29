import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { cn } from '../lib/utils';
import {
  X, ChevronRight, ChevronDown, Folder, FileText, Share2, Layers,
  PanelLeftClose, PanelLeftOpen, Search, Library
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getGraphRoots, getLatticeGraphByRoot,
  GraphRoot, LatticeNode, LatticeEdge
} from '../lib/lattice';

// ─── Recursive sidebar tree item ─────────────────────────────────────────────

function SidebarItem({
  node, depth, activeId, onSelect, edgeMap, nodeMap, query,
}: {
  node: LatticeNode;
  depth: number;
  activeId: string | null;
  onSelect: (id: string) => void;
  edgeMap: Record<string, string[]>;
  nodeMap: Record<string, LatticeNode>;
  query: string;
}) {
  const childIds = edgeMap[node.id] ?? [];
  const children = childIds.map(id => nodeMap[id]).filter(Boolean) as LatticeNode[];

  const matchesSelf = !query || node.label.toLowerCase().includes(query.toLowerCase());
  const childrenFiltered = children.filter(c => nodeMatchesQuery(c, query, edgeMap, nodeMap));
  if (!matchesSelf && childrenFiltered.length === 0) return null;

  const [open, setOpen] = useState(depth < 2 || !!query);
  const isActive = activeId === node.id;
  const hasChildren = children.length > 0;

  const Icon = node.type === 'root' ? Layers : node.type === 'domain' ? Share2 : node.type === 'branch' ? Folder : FileText;

  // Obsidian-style font hierarchy: standard 13/14px sans-serif, normal casing
  const textClass = 
    node.type === 'root'   ? 'text-[14px] font-bold text-brand-text' :
    node.type === 'domain' ? 'text-[13px] font-semibold text-brand-text/90' :
    node.type === 'branch' ? 'text-[13px] font-medium text-brand-muted hover:text-brand-text/80' :
                             'text-[13px] font-normal text-brand-muted hover:text-brand-text';

  return (
    <div>
      <div
        onClick={() => { if (hasChildren) setOpen(!open); onSelect(node.id); }}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        className="pr-2 py-[2px] cursor-pointer group"
      >
        <div className={cn(
          'flex items-center gap-1.5 px-2 py-1 transition-colors rounded-md min-w-0',
          isActive ? 'bg-brand-text/15 text-brand-text' : 'hover:bg-brand-text/5'
        )}>
          <span className="shrink-0 text-brand-muted/70 group-hover:text-brand-text/70 transition-colors">
            {hasChildren ? (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3.5" />}
          </span>
          <Icon size={14} className={cn('shrink-0', isActive ? 'text-brand-text' : 'text-brand-muted/70')} />
          <span className={cn('truncate leading-tight', textClass)}>
            {query ? highlightMatch(node.label, query) : node.label}
          </span>
        </div>
      </div>

      {hasChildren && open && (
        <div className="ml-[14px] border-l border-brand-border/10">
          {children.map(child => (
            <SidebarItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
              edgeMap={edgeMap}
              nodeMap={nodeMap}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function nodeMatchesQuery(
  node: LatticeNode, query: string,
  edgeMap: Record<string, string[]>, nodeMap: Record<string, LatticeNode>
): boolean {
  if (!query) return true;
  if (node.label.toLowerCase().includes(query.toLowerCase())) return true;
  return (edgeMap[node.id] ?? []).some(id => nodeMap[id] && nodeMatchesQuery(nodeMap[id], query, edgeMap, nodeMap));
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-text/30 text-brand-text px-0.5 rounded-sm bg-transparent">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SidebarTab = 'files' | 'search';

export default function KnowledgeBase() {
  const { t } = useApp();

  // Multi-graph state
  const [graphRoots, setGraphRoots] = useState<GraphRoot[]>([]);
  const [activeGraph, setActiveGraph] = useState<string>('');

  // Current graph nodes/edges (for sidebar)
  const [graphNodes, setGraphNodes] = useState<LatticeNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<LatticeEdge[]>([]);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [activeTab, setActiveTab] = useState<SidebarTab>('files');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<LatticeNode | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Resizing state
  const isResizing = useRef(false);

  // Load graph roots
  useEffect(() => {
    getGraphRoots().then(roots => {
      setGraphRoots(roots);
      if (roots.length > 0) setActiveGraph(roots[0].id);
    });
  }, []);

  // Load graph data for sidebar when active graph changes
  useEffect(() => {
    if (!activeGraph) return;
    setLoading(true);
    setActiveNodeId(null);
    getLatticeGraphByRoot(activeGraph).then(({ nodes, edges }) => {
      setGraphNodes(nodes);
      setGraphEdges(edges);
      setLoading(false);
    });
  }, [activeGraph]);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 600) newWidth = 600;
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Build sidebar maps (only hierarchy edges)
  const nodeMap = useMemo(() => Object.fromEntries(graphNodes.map(n => [n.id, n])), [graphNodes]);
  const edgeMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    graphEdges.filter(e => !e.dashed).forEach(e => {
      if (!map[e.source]) map[e.source] = [];
      map[e.source].push(e.target);
    });
    return map;
  }, [graphEdges]);

  const rootNode = graphNodes.find(n => n.type === 'root');
  const handleSelect = useCallback((id: string) => setActiveNodeId(id), []);

  return (
    <div className="h-screen flex bg-brand-bg overflow-hidden pt-16">

      {/* ── Sidebar ────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarOpen ? sidebarWidth : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex shrink-0 relative border-r border-brand-border/40 bg-[#0c0c0c]"
        style={{ minWidth: 0 }}
      >
        <div className="flex w-full h-full overflow-hidden">
          
          {/* Obsidian-style Icon Bar (Left edge of sidebar) */}
          <div className="w-12 h-full flex flex-col items-center py-4 border-r border-brand-border/20 shrink-0 gap-4 bg-black/20">
            <button 
              onClick={() => setActiveTab('files')}
              className={cn('p-2 rounded-md transition-colors', activeTab === 'files' ? 'bg-brand-text/10 text-brand-text' : 'text-brand-muted hover:text-brand-text hover:bg-brand-text/5')}
              title="Files"
            >
              <Library size={18} strokeWidth={2} />
            </button>
            <button 
              onClick={() => setActiveTab('search')}
              className={cn('p-2 rounded-md transition-colors', activeTab === 'search' ? 'bg-brand-text/10 text-brand-text' : 'text-brand-muted hover:text-brand-text hover:bg-brand-text/5')}
              title="Search"
            >
              <Search size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Sidebar Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Context Header (Graph Switcher) */}
            <div className="px-3 py-3 border-b border-brand-border/20 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              {graphRoots.map(root => (
                <button
                  key={root.id}
                  onClick={() => setActiveGraph(root.id)}
                  className={cn(
                    'shrink-0 px-2 py-1 text-[12px] font-medium rounded-md transition-all whitespace-nowrap',
                    activeGraph === root.id
                      ? 'bg-brand-text/10 text-brand-text'
                      : 'text-brand-muted/70 hover:text-brand-text hover:bg-brand-text/5'
                  )}
                >
                  {root.label}
                </button>
              ))}
            </div>

            {/* Main view panel */}
            <div className="flex-1 overflow-y-auto px-1 py-2 custom-scrollbar flex flex-col min-w-0">
              {activeTab === 'search' && (
                <div className="px-2 pb-3 pt-1 sticky top-0 bg-[#0c0c0c]/90 backdrop-blur-sm z-10 shrink-0">
                  <div className="relative flex items-center">
                    <Search size={14} className="absolute left-2.5 text-brand-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search nodes..."
                      className="w-full bg-brand-bg border border-brand-border/50 rounded-md py-1.5 pl-8 pr-8 text-[13px] text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-text/50 transition-colors"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2 text-brand-muted hover:text-brand-text p-1">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="px-4 py-4 text-[13px] text-brand-muted">Loading graph...</div>
              ) : rootNode ? (
                <SidebarItem
                  node={rootNode}
                  depth={0}
                  activeId={activeNodeId}
                  onSelect={handleSelect}
                  edgeMap={edgeMap}
                  nodeMap={nodeMap}
                  query={activeTab === 'search' ? searchQuery : ''}
                />
              ) : (
                <div className="px-4 py-4 text-[13px] text-brand-muted">No nodes found.</div>
              )}
            </div>
            
            {/* Footer path indicator */}
            <div className="px-3 py-2 border-t border-brand-border/20 shrink-0 bg-black/10">
              <p className="text-[11px] font-mono text-brand-muted/50 truncate" title={`src/content/lattice/${activeGraph}/**`}>
                src/content/lattice/{activeGraph}/**
              </p>
            </div>
          </div>
        </div>

        {/* Drag Handle for Resizing */}
        <div 
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-brand-text/20 active:bg-brand-text/40 transition-colors z-50"
          onMouseDown={() => {
            isResizing.current = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
        />
      </motion.aside>

      {/* ── Canvas + Toggle ──────────────────────────────────── */}
      <div className="flex-1 relative min-w-0 flex flex-col bg-brand-bg">
        {/* Obsidian style Sidebar Toggle (Fixed absolute left gap) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-20 flex items-center justify-center bg-brand-bg border border-brand-border/60 hover:border-brand-text/50 w-8 h-8 rounded-md text-brand-muted hover:text-brand-text transition-all shadow-md group"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>

        {activeGraph && (
          <KnowledgeGraph
            key={activeGraph}
            graphFolder={activeGraph}
            onSelectArticle={setSelectedArticle}
            highlightedFolder={activeNodeId ?? 'all'}
          />
        )}
      </div>

      {/* ── Article Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 lg:p-16 bg-brand-bg/92 backdrop-blur-xl"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.97, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }}
              className="w-full max-w-4xl max-h-[90vh] bg-brand-bg border border-brand-border shadow-2xl overflow-hidden flex flex-col rounded-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-8 py-5 border-b border-brand-border/60 flex items-center justify-between shrink-0">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap gap-2 items-center mb-1">
                    <span className="text-[12px] font-medium text-brand-muted bg-brand-text/5 px-2 py-0.5 rounded-sm">
                      {selectedArticle.path?.split('/').slice(0, -1).join(' / ')}
                    </span>
                    {selectedArticle.date && (
                      <span className="text-[12px] text-brand-muted/70">· {selectedArticle.date}</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-brand-text leading-tight">{selectedArticle.label}</h2>
                  {selectedArticle.tags?.length ? (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {selectedArticle.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 border border-brand-border/30 text-[11px] font-mono text-brand-muted uppercase tracking-widest rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="ml-4 p-2 bg-brand-text/5 hover:bg-brand-text/20 text-brand-muted hover:text-brand-text rounded-md transition-colors border border-transparent shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
                <div className="prose prose-sm lg:prose-base prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedArticle.content ?? ''}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
