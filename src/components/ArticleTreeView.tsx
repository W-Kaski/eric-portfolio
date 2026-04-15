import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { ArticleMeta } from '@/src/lib/articles';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: Record<string, TreeNode>;
  articles: ArticleMeta[];
}

export function ArticleTreeView({ articles }: { articles: ArticleMeta[] }) {
  const navigate = useNavigate();
  const [expandTrigger, setExpandTrigger] = useState(0);
  const [collapseTrigger, setCollapseTrigger] = useState(0);

  const tree = useMemo(() => {
    const root: TreeNode = {
      name: 'root',
      path: '',
      isDirectory: true,
      children: {},
      articles: []
    };

    articles.forEach(article => {
      let current = root;
      // Building the hierarchy
      article.pathSegments.forEach((segment, index) => {
        const segPath = article.pathSegments.slice(0, index + 1).join('/');
        if (!current.children[segment]) {
          current.children[segment] = {
            name: segment,
            path: segPath,
            isDirectory: true,
            children: {},
            articles: []
          };
        }
        current = current.children[segment];
      });
      // Add article to the final folder
      current.articles.push(article);
    });

    return root;
  }, [articles]);

  return (
    <div className="w-full space-y-3">
      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-brand-border/40">
        <button 
          onClick={() => setExpandTrigger(t => t + 1)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-text transition-colors bg-brand-text/5 px-2 py-1 rounded"
        >
          <ChevronsUpDown size={12} /> Expand All
        </button>
        <button 
          onClick={() => setCollapseTrigger(t => t + 1)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-text transition-colors bg-brand-text/5 px-2 py-1 rounded"
        >
          <ChevronsDownUp size={12} /> Collapse All
        </button>
      </div>

      <div className="space-y-1">
        {Object.values(tree.children).map(node => (
          <TreeFolder key={node.path} node={node} level={0} onNavigate={(id) => navigate(`/articles/${id}`)} expandTrigger={expandTrigger} collapseTrigger={collapseTrigger} />
        ))}
        {tree.articles.map(article => (
          <TreeFile key={article.id} article={article} level={0} onNavigate={() => navigate(`/articles/${article.id}`)} />
        ))}
      </div>
    </div>
  );
}

function TreeFolder({ node, level, onNavigate, expandTrigger, collapseTrigger }: { node: TreeNode, level: number, onNavigate: (id: string) => void, expandTrigger: number, collapseTrigger: number }) {
  const [isOpen, setIsOpen] = useState(level < 1); // Auto-open first level

  useEffect(() => { if (expandTrigger > 0) setIsOpen(true); }, [expandTrigger]);
  useEffect(() => { if (collapseTrigger > 0) setIsOpen(level < 1 ? true : false); }, [collapseTrigger]); // Kept root open

  const hasChildren = Object.keys(node.children).length > 0 || node.articles.length > 0;

  return (
    <div className="w-full">
      <div 
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded hover:bg-brand-text/5 cursor-pointer text-sm transition-colors text-brand-text/80 hover:text-brand-text",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-4 flex justify-center items-center">
          {hasChildren && (
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }} className="text-brand-muted/70">
              <ChevronRight size={14} />
            </motion.div>
          )}
        </div>
        {isOpen ? <FolderOpen size={14} className="text-brand-muted/70" /> : <Folder size={14} className="text-brand-muted/70" />}
        <span className="font-medium tracking-wide truncate">{node.name}</span>
      </div>
      
      <AnimatePresence initial={false}>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {Object.values(node.children).map(childNode => (
              <TreeFolder key={childNode.path} node={childNode} level={level + 1} onNavigate={onNavigate} expandTrigger={expandTrigger} collapseTrigger={collapseTrigger} />
            ))}
            {node.articles.map(article => (
              <TreeFile key={article.id} article={article} level={level + 1} onNavigate={() => onNavigate(article.id)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TreeFile({ article, level, onNavigate }: { article: Article, level: number, onNavigate: () => void }) {
  return (
    <div 
      className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-brand-text/10 cursor-pointer text-sm transition-colors text-brand-muted hover:text-brand-text group"
      style={{ paddingLeft: `${level * 16 + 8 + 16}px` }}
      onClick={onNavigate}
    >
      <FileText size={14} className="text-brand-muted/50 group-hover:text-brand-muted transition-colors opacity-70" />
      <span className="truncate">{article.title}</span>
    </div>
  );
}
