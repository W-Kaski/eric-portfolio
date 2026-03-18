import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { getAllProjects, ProjectData } from '../lib/projects';
import { useApp } from '../context/AppContext';

export default function ProjectDetail() {
  const { t } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProjects().then(data => {
      const found = data.find(p => p.id === id);
      setProject(found || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <button 
          onClick={() => navigate('/portfolio')}
          className="px-6 py-2 bg-brand-text text-brand-bg rounded-full"
        >
          {t('articles.back')}
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-6 max-w-4xl mx-auto pb-32 pt-10"
    >
      <button 
        onClick={() => navigate('/portfolio')}
        className="flex items-center gap-2 text-brand-muted hover:text-brand-text transition-colors mb-12 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        {t('articles.back')}
      </button>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-brand-text/5 border border-brand-border text-[10px] font-bold uppercase tracking-widest text-brand-muted">
            {project.category}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted/60">
            {project.date}
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">{project.title}</h1>
      </div>

      <div className="aspect-video rounded-3xl overflow-hidden mb-12 border border-brand-border">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="prose prose-invert max-w-none markdown-body">
        <ReactMarkdown>{project.description}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
