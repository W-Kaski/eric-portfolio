import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { cn } from '../lib/utils';
import {
  X, ChevronRight, ChevronDown, Folder, FileText, Share2, Layers,
  PanelLeftClose, PanelLeftOpen, Search, Library, PlusSquare, MinusSquare, RefreshCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getGraphRoots, getFullLatticeTree,
  GraphRoot, LatticeNode, LatticeEdge
} from '../lib/lattice';

// ─── Recursive sidebar tree item ─────────────────────────────────────────────

function SidebarItem({
  node, depth, activeId, onSelect, edgeMap, nodeMap, query, expandedIds, toggleExpand
}: {
  node: LatticeNode;
  depth: number;
  activeId: string | null;
  onSelect: (node: LatticeNode) => void;
  edgeMap: Record<string, string[]>;
  nodeMap: Record<string, LatticeNode>;
  query: string;
  expandedIds: Set<string>;
  toggleExpand: (id: string, force?: boolean) => void;
}) {
  const childIds = edgeMap[node.id] ?? [];
  const children = childIds.map(id => nodeMap[id]).filter(Boolean) as LatticeNode[];

  const matchesSelf = !query || node.label.toLowerCase().includes(query.toLowerCase());
  const childrenFiltered = children.filter(c => nodeMatchesQuery(c, query, edgeMap, nodeMap));
  if (!matchesSelf && childrenFiltered.length === 0) return null;

  const open = expandedIds.has(node.id) || !!query;
  const isActive = activeId === node.id;
  const hasChildren = children.length > 0;

  const Icon = node.type === 'root' ? Layers : node.type === 'domain' ? Share2 : node.type === 'branch' ? Folder : FileText;

  const textClass = 
    node.type === 'root'   ? 'text-[14px] font-bold text-zinc-100' :
    node.type === 'domain' ? 'text-[13px] font-semibold text-zinc-100/90' :
    node.type === 'branch' ? 'text-[13px] font-medium text-zinc-300 hover:text-zinc-100' :
                             'text-[13px] font-normal text-zinc-400 hover:text-zinc-200';

  const iconClass =
    node.type === 'root'   ? 'text-zinc-100 opacity-90' :
    node.type === 'domain' ? 'text-zinc-100 opacity-70' :
    node.type === 'branch' ? 'text-zinc-100 opacity-50' :
                             'text-zinc-100 opacity-40';

  return (
    <div>
      <div
        onClick={() => { if (hasChildren) toggleExpand(node.id); onSelect(node); }}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        className="pr-2 py-[2px] cursor-pointer group"
      >
        <div className={cn(
          'flex items-center gap-1.5 px-2 py-1 transition-colors rounded-md min-w-0',
          isActive ? 'bg-zinc-100/15 text-zinc-100' : 'hover:bg-zinc-100/5'
        )}>
          <span
            className="shrink-0 text-zinc-400/70 group-hover:text-zinc-100/90 transition-colors"
            onClick={(e) => {
              if (hasChildren) {
                e.stopPropagation();
                toggleExpand(node.id);
              }
            }}
          >
            {hasChildren ? (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3.5" />}
          </span>
          <Icon size={14} className={cn('shrink-0', isActive ? 'text-zinc-100 opacity-100' : iconClass)} />
          <span className={cn('truncate leading-tight', textClass)}>
            {query ? highlightMatch(node.label, query) : node.label}
          </span>
        </div>
      </div>

      {hasChildren && open && (
        <div className="ml-[14px] border-l border-white/10">
          {children.map(child => (
            <SidebarItem
              key={child.id} node={child} depth={depth + 1}
              activeId={activeId} onSelect={onSelect}
              edgeMap={edgeMap} nodeMap={nodeMap} query={query}
              expandedIds={expandedIds} toggleExpand={toggleExpand}
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
      <mark className="bg-zinc-100/30 text-zinc-100 px-0.5 rounded-sm bg-transparent">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SidebarTab = 'files' | 'search';

export default function KnowledgeBase() {
  const { t } = useApp();

  // Unified global data for File Explorer
  const [globalNodes, setGlobalNodes] = useState<LatticeNode[]>([]);
  const [globalEdges, setGlobalEdges] = useState<LatticeEdge[]>([]);
  
  // Controlled Tree State
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Graph Canvas State
  const [activeGraph, setActiveGraph] = useState<string>('');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [activeTab, setActiveTab] = useState<SidebarTab>('files');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<LatticeNode | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isResizing = useRef(false);

  // Load complete workspace once on mount
  useEffect(() => {
    getFullLatticeTree().then(({ nodes, edges }) => {
      setGlobalNodes(nodes);
      setGlobalEdges(edges);
      
      // Auto-expand all root domains by default
      const rootIds = new Set(nodes.filter(n => n.type === 'root').map(n => n.id));
      setExpandedIds(rootIds);
      
      // Default to first graph
      if (rootIds.size > 0 && !activeGraph) {
        setActiveGraph(Array.from(rootIds)[0]);
      }
      setLoading(false);
    });
  }, [activeGraph]);

  // Handle sidebar drag resize
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

  // Maps for tree rendering
  const nodeMap = useMemo(() => Object.fromEntries(globalNodes.map(n => [n.id, n])), [globalNodes]);
  const edgeMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    globalEdges.filter(e => !e.dashed).forEach(e => {
      if (!map[e.source]) map[e.source] = [];
      map[e.source].push(e.target);
    });
    return map;
  }, [globalEdges]);

  // Tree Handlers
  const toggleExpand = useCallback((id: string, force?: boolean) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (force === true) next.add(id);
      else if (force === false) next.delete(id);
      else if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const internalIds = globalNodes.filter(n => n.type !== 'article').map(n => n.id);
    setExpandedIds(new Set(internalIds));
  }, [globalNodes]);

  const handleCollapseAll = useCallback(() => {
    // Keep roots expanded to prevent completely blank sidebar
    const rootIds = globalNodes.filter(n => n.type === 'root').map(n => n.id);
    setExpandedIds(new Set(rootIds));
  }, [globalNodes]);

  const handleSelect = useCallback((node: LatticeNode) => {
    setActiveNodeId(node.id);
    // Find the domain graph this node belongs to and set it active
    const rootId = node.id.split('__')[0];
    if (rootId) setActiveGraph(rootId);
  }, []);

  const rootNodes = globalNodes.filter(n => n.type === 'root');

  return (
    <div className="h-screen flex flex-col bg-brand-bg overflow-hidden">

      {/* ── Page Header (Matches ML Lab layout) ───────────────────────── */}
      <div className="px-6 max-w-7xl mx-auto w-full shrink-0 pt-[104px] pb-5 border-b border-brand-border/40 flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-brand-text/90">
            {t('nav.exploration')}
          </h1>
        </div>
      </div>

      {/* ── Main Workspace ─────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden border-t border-brand-border/30 bg-[#0c0c0c]">
        {/* ── Sidebar ────────────────────────────────────────── */}
        <motion.aside
          animate={{ width: sidebarOpen ? sidebarWidth : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex shrink-0 relative border-r border-white/10"
          style={{ minWidth: 0, height: '100%' }}
        >
          <div className="flex flex-col w-full h-full overflow-hidden">
            
            {/* Top Toolbar (Horizontal Icon Tabs + Functions) */}
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0c0c0c]">
            {/* View Tabs */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setActiveTab('files')}
                className={cn('p-1.5 rounded-md transition-colors', activeTab === 'files' ? 'bg-zinc-100/15 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-100/5')}
                title="Files"
              >
                <Library size={16} strokeWidth={2} />
              </button>
              <button 
                onClick={() => setActiveTab('search')}
                className={cn('p-1.5 rounded-md transition-colors', activeTab === 'search' ? 'bg-zinc-100/15 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-100/5')}
                title="Global Search"
              >
                <Search size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Tree Functions */}
            <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
              <button onClick={handleExpandAll} title="Expand All" className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-100/10 rounded-md">
                <PlusSquare size={15} />
              </button>
              <button onClick={handleCollapseAll} title="Collapse All" className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-100/10 rounded-md">
                <MinusSquare size={15} />
              </button>
            </div>
          </div>

          {/* View Body */}
          <div className="flex-1 overflow-y-auto px-1 py-2 custom-scrollbar flex flex-col min-w-0 relative">
              {activeTab === 'search' && (
                <div className="px-2 pb-3 sticky top-0 bg-[#0c0c0c]/90 backdrop-blur-sm z-10 shrink-0">
                  <div className="relative flex items-center mt-2">
                    <Search size={14} className="absolute left-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Type to search..."
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-md py-1.5 pl-8 pr-8 text-[13px] text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-white/20 transition-colors mx-1"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 text-zinc-400 hover:text-zinc-100 p-1">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="px-4 py-4 text-[13px] text-brand-muted text-center pt-10 flex flex-col items-center gap-3">
                  <RefreshCcw size={18} className="animate-spin text-brand-muted/50" />
                  Building unified lattice...
                </div>
              ) : (
                <div className="pb-8">
                  {rootNodes.map(root => (
                    <SidebarItem
                      key={root.id}
                      node={root}
                      depth={0}
                      activeId={activeNodeId}
                      onSelect={handleSelect}
                      edgeMap={edgeMap}
                      nodeMap={nodeMap}
                      query={activeTab === 'search' ? searchQuery : ''}
                      expandedIds={expandedIds}
                      toggleExpand={toggleExpand}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-3 py-2 border-t border-brand-border/20 shrink-0 bg-black/10">
              <p className="text-[11px] font-mono text-brand-muted/50 truncate" title={`Active Domain: ${activeGraph}`}>
                Domain: {activeGraph || 'Loading...'}
              </p>
            </div>
        </div>

        <div 
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-zinc-100/20 active:bg-zinc-100/40 transition-colors z-50"
          onMouseDown={() => {
            isResizing.current = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
        />
      </motion.aside>

      {/* ── Canvas + Toggle ──────────────────────────────────── */}
      <div className="flex-1 relative min-w-0 flex flex-col bg-[#0c0c0c]">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-20 flex items-center justify-center bg-zinc-900 border border-white/10 hover:border-white/30 w-8 h-8 rounded-md text-zinc-400 hover:text-zinc-100 transition-all shadow-md group"
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
      {/* ── End Main Workspace ───────────────────────────────── */}
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
