import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Github, Twitter, Linkedin, Mail, ExternalLink, User, Code2, History, Award } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { cn } from '@/src/lib/utils';

export default function About() {
  const { t } = useApp();
  const { aboutConfig, siteConfig } = useConfig();

  if (!aboutConfig || !siteConfig) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="px-6 max-w-7xl mx-auto pb-32 pt-10">
      {/* SECTION 1: Identity Header */}
      <section className="flex flex-col lg:flex-row items-center lg:items-end gap-12 mb-32 relative">
        {/* Background Watermark */}
        <div className="absolute -top-10 -left-10 text-[180px] font-black text-brand-text/[0.015] select-none pointer-events-none tracking-tighter uppercase whitespace-nowrap">
           {t('about.identity')}
        </div>

        {/* Avatar Frame - Industrial Square */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0 group"
        >
          {/* Technical Corner Accents */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-brand-text/40 z-20" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-brand-text/40 z-20" />
          
          <div className="w-full h-full border border-brand-border bg-brand-card p-3 relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
            <img 
              src={aboutConfig.avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover border border-brand-border/30"
              referrerPolicy="no-referrer"
            />
            {/* Scanline overlay */}
            <div className="absolute inset-x-0 h-px bg-brand-text/5 top-0 group-hover:animate-scanline pointer-events-none" />
          </div>

        </motion.div>
        
        <div className="flex-1 space-y-8 text-center lg:text-left z-10">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-brand-muted/60 mb-2 block"></span>
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-6">
              {t('about.title')}
            </h1>
            <p className="text-brand-muted text-xl md:text-2xl max-w-2xl leading-relaxed font-light">
              {t('about.desc')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            <SocialLink icon={<Github size={16} />} href={siteConfig.socials.github} label="GITHUB" />

            <SocialLink icon={<Linkedin size={16} />} href={siteConfig.socials.linkedin} label="LINKEDIN" />
            <SocialLink icon={<Mail size={16} />} href={`mailto:${siteConfig.email}`} label="EMAIL" />
          </div>
        </div>
      </section>

      {/* SECTION 2: Biographical Data & Intel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        
        {/* Left: Biography & Timeline (65%) */}
        <div className="lg:col-span-8 space-y-24">
          
          {/* Bio Story */}
          <section className="relative">
            <div className="flex items-center gap-6 mb-10">
               <div className="p-3 border border-brand-border bg-brand-card">
                  <User size={20} className="text-brand-text" />
               </div>
               <h2 className="text-3xl font-black tracking-tight uppercase">{t('about.story')}</h2>
               <div className="flex-grow h-px bg-brand-border/40" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-brand-muted text-lg leading-[1.8] font-light">
              <p className="relative">
                 <span className="absolute -left-4 top-0 text-brand-text/10 text-4xl font-black leading-none select-none">[</span>
                 {t('about.story.p1')}
              </p>
              <p>
                 {t('about.story.p2')}
              </p>
            </div>
          </section>

          {/* Technical Timeline */}
          <section>
            <div className="flex items-center gap-6 mb-12">
               <div className="p-3 border border-brand-border bg-brand-card">
                  <History size={20} className="text-brand-text" />
               </div>
               <h2 className="text-3xl font-black tracking-tight uppercase">{t('about.experience')}</h2>
               <div className="flex-grow h-px bg-brand-border/40" />
            </div>

            <div className="space-y-0 relative">
              {aboutConfig.timeline.map((item, index) => (
                <div key={index} className="group flex items-start gap-8 py-8 border-b border-brand-border/40 last:border-0 hover:bg-brand-text/[0.01] transition-colors relative">
                  <span className="text-[10px] font-mono text-brand-muted/40 group-hover:text-brand-text transition-colors mt-2">
                    0{index + 1}
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 w-full gap-4 md:gap-8 items-baseline">
                    <div className="text-xs font-bold tracking-[0.2em] font-mono text-brand-muted uppercase">
                      // {item.year}
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <h3 className="text-2xl font-black tracking-tighter uppercase transition-transform group-hover:translate-x-1 duration-500">
                        {item.role}
                      </h3>
                      <p className="text-brand-muted font-mono text-sm tracking-wider opacity-60">
                        {item.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Technical Proficiency & Actions (35%) */}
        <div className="lg:col-span-4 space-y-16">
          
          {/* Skills Data Rows */}
          <section className="bg-brand-card/30 border border-brand-border p-10 md:p-12 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-px h-full bg-brand-border/40" />
             
             <div className="flex items-center gap-3 mb-10">
                <Code2 size={18} className="text-brand-text/50" />
                <h2 className="text-xl font-black tracking-widest uppercase">{t('about.skills')}</h2>
             </div>

             <div className="space-y-10">
               {aboutConfig.skills.map((skill) => (
                 <div key={skill.name} className="space-y-3 group">
                   <div className="flex justify-between items-end">
                     <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-brand-muted group-hover:text-brand-text transition-colors">
                        {skill.name}
                     </span>
                     <span className="text-[10px] font-mono text-brand-muted/50">{skill.level}/100</span>
                   </div>
                   <div className="h-1 bg-brand-border/30 overflow-hidden relative">
                     <motion.div 
                       initial={{ width: 0 }}
                       whileInView={{ width: `${skill.level}%` }}
                       viewport={{ once: true }}
                       transition={{ duration: 1.5, ease: 'circOut' }}
                       className="h-full bg-brand-text group-hover:bg-emerald-500/60 transition-colors duration-500"
                     />
                     {/* Segment indicators */}
                     <div className="absolute inset-0 flex justify-between pointer-events-none">
                        {[1, 2, 3, 4].map(i => <div key={i} className="w-px h-full bg-brand-bg/40" />)}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </section>
          
          {/* Resume & CTA */}
          <div className="space-y-6">
            <a 
              href={aboutConfig.resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group w-full py-6 border border-brand-text flex items-center justify-center gap-4 hover:bg-brand-text hover:text-brand-bg transition-all duration-500 relative overflow-hidden"
            >
              <span className="text-xs font-black uppercase tracking-[0.4em] relative z-10">{t('about.resume')}</span>
              <ExternalLink size={16} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <div className="absolute inset-0 bg-brand-text translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </a>
          </div>


        </div>
      </div>
    </div>
  );
}

function SocialLink({ icon, href, label }: { icon: React.ReactNode, href: string, label: string }) {
  return (
    <a 
      href={href} 
      className="group flex items-center gap-3 border border-brand-border px-4 py-2 hover:bg-brand-text transition-all duration-500"
      aria-label={label}
    >
      <span className="text-brand-text group-hover:text-brand-bg transition-colors">{icon}</span>
      <span className="text-[10px] font-mono font-bold tracking-widest text-brand-muted group-hover:text-brand-bg transition-colors">
        {label}
      </span>
    </a>
  );
}
