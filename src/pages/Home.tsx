import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Brain, Sparkles, Microscope, BookOpen, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { getAllProjects, ProjectData } from '../lib/projects';

export default function Home() {
  const { siteConfig } = useConfig();
  const { t } = useApp();
  const [featuredProjects, setFeaturedProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    getAllProjects().then(data => {
      setFeaturedProjects(data.slice(0, 3));
    });
  }, []);

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide">
      {/* Section 1: Hero */}
      <section className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden bg-brand-bg">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#80808033_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-brand-card/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">
              <Sparkles size={12} />
              <span>{t('home.hero.tagline')}</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-none uppercase">
              {siteConfig?.name?.replace('.AI', '')}<span className="text-brand-muted">.AI</span>
            </h1>
            
            <p className="max-w-xl mx-auto text-lg text-brand-muted font-medium leading-relaxed">
              {t('home.hero.desc')}
            </p>

            <div className="flex items-center justify-center gap-4 pt-8">
              <Link to="/portfolio">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-brand-text text-brand-bg rounded-full font-bold text-sm flex items-center gap-2"
                >
                  {t('hero.viewProjects')} <ArrowRight size={18} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-brand-muted opacity-50"
        >
          <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* Section 2: Featured Projects */}
      <section className="h-screen w-full snap-start bg-brand-card relative flex items-center px-12 md:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">{t('home.works.title')}</h2>
              <p className="text-brand-muted max-w-md">{t('home.works.desc')}</p>
            </div>
            
            <div className="space-y-4">
              {featuredProjects.map((project, i) => (
                <Link key={project.id} to={`/portfolio/${project.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex items-center justify-between p-6 rounded-2xl border border-brand-border hover:bg-brand-bg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-brand-muted">0{i + 1}</span>
                      <h3 className="text-xl font-bold">{project.title}</h3>
                    </div>
                    <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                  </motion.div>
                </Link>
              ))}
            </div>

            <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-brand-muted transition-colors">
              {t('home.works.all')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="hidden md:block relative aspect-square rounded-3xl overflow-hidden border border-brand-border">
            <img 
              src={siteConfig?.hero?.previewImage} 
              alt="Design Preview"
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg to-transparent" />
          </div>
        </div>
      </section>

      {/* Section 3: ML Lab */}
      <section className="h-screen w-full snap-start bg-brand-bg relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-text blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 text-center max-w-3xl px-6 space-y-12">
          <div className="w-20 h-20 rounded-3xl bg-brand-card border border-brand-border flex items-center justify-center mx-auto rotate-12">
            <Brain size={40} className="text-brand-text" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tighter">{t('home.lab.title')}</h2>
            <p className="text-xl text-brand-muted leading-relaxed">
              {t('home.lab.desc')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Microscope, label: t('home.lab.research') },
              { icon: Brain, label: t('home.lab.neuralNets') },
              { icon: Sparkles, label: t('home.lab.generative') }
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl border border-brand-border bg-brand-card/50 backdrop-blur-sm space-y-2">
                <item.icon size={20} className="mx-auto text-brand-muted" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>

          <Link to="/ml-lab">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-8 px-8 py-4 border border-brand-text rounded-full font-bold text-sm flex items-center gap-2 mx-auto"
            >
              {t('home.lab.button')} <ArrowRight size={18} />
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Section 4: Articles & Contact */}
      <section className="h-screen w-full snap-start bg-brand-card relative flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-12 md:px-24 grid grid-cols-1 md:grid-cols-2 gap-24">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">{t('home.articles.title')}</h2>
              <p className="text-brand-muted">{t('home.articles.desc')}</p>
            </div>

            <div className="space-y-6">
              {[
                t('home.articles.item1'),
                t('home.articles.item2'),
                t('home.articles.item3')
              ].map((title, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex items-center justify-between py-4 border-b border-brand-border">
                    <h3 className="text-lg font-medium group-hover:text-brand-text transition-colors">{title}</h3>
                    <BookOpen size={18} className="text-brand-muted opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </div>
              ))}
            </div>

            <Link to="/articles" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-brand-muted transition-colors">
              {t('home.articles.all')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">{t('home.connect.title')}</h2>
              <p className="text-brand-muted text-lg">{t('home.connect.desc')}</p>
            </div>

            <div className="space-y-4">
              <a href={`mailto:${siteConfig?.email}`} className="block text-2xl font-bold hover:text-brand-muted transition-colors underline underline-offset-8 decoration-brand-border">
                {siteConfig?.email}
              </a>
              <div className="flex gap-6 text-sm font-bold uppercase tracking-widest text-brand-muted">
                <a href={siteConfig?.socials?.twitter} className="hover:text-brand-text transition-colors">{t('home.connect.twitter')}</a>
                <a href={siteConfig?.socials?.github} className="hover:text-brand-text transition-colors">{t('home.connect.github')}</a>
                <a href={siteConfig?.socials?.linkedin} className="hover:text-brand-text transition-colors">{t('home.connect.linkedin')}</a>
              </div>
            </div>

            <div className="pt-12 border-t border-brand-border">
              <p className="text-xs text-brand-muted font-mono uppercase tracking-widest">
                © {siteConfig?.copyrightYear} {siteConfig?.author} / {t('home.footer.rights')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
