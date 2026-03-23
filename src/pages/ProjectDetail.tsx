import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { ArrowLeft, Github, ExternalLink, Code2 } from 'lucide-react';
import { getAllProjects, ProjectData } from '../lib/projects';
import { useApp } from '../context/AppContext';

const CATEGORY_COLORS: Record<string, string> = {
  'Machine Learning': '#3B82F6',
  'UI/UX':            '#8B5CF6',
  'Dev':              '#10B981',
};

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
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
      </div>
    );
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

  const accentColor = CATEGORY_COLORS[project.category] ?? '#888';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-6 max-w-4xl mx-auto pb-32 pt-10"
    >
      {/* Back */}
      <button
        onClick={() => navigate('/portfolio')}
        className="flex items-center gap-2 text-brand-muted hover:text-brand-text transition-colors mb-12 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        {t('articles.back')}
      </button>

      {/* Header */}
      <div className="mb-10">
        {/* Category badge */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1.5 rounded-full border"
            style={{ color: accentColor, backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40` }}
          >
            {project.category}
          </span>
          {project.featured && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-brand-text/5 border border-brand-border text-brand-muted">
              Featured
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted/60">
            {project.date}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">{project.title}</h1>

        {/* Tech stack chips */}
        {project.tech.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <div className="flex items-center gap-1.5 text-brand-muted/50 mr-1">
              <Code2 size={13} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Stack</span>
            </div>
            {project.tech.map(tech => (
              <span
                key={tech}
                className="text-xs font-mono px-3 py-1 rounded-lg bg-brand-card border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text/20 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {(project.github || project.demo) && (
          <div className="flex flex-wrap gap-3 mb-10">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-text text-brand-bg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                <Github size={14} /> GitHub
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-card border border-brand-border text-brand-text text-xs font-bold uppercase tracking-widest hover:bg-brand-text/5 transition-colors"
              >
                <ExternalLink size={14} /> Live Demo
              </a>
            )}
          </div>
        )}
      </div>


      {/* Markdown body */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <div className="markdown-body text-brand-text/85 leading-[1.8] text-lg font-light">
          <ReactMarkdown>{project.description}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
