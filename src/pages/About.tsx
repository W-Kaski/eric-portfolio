import React from 'react';
import { motion } from 'motion/react';
import { Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { useConfig } from '../context/ConfigContext';

export default function About() {
  const { t } = useApp();
  const { aboutConfig, siteConfig } = useConfig();

  if (!aboutConfig || !siteConfig) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="px-6 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-brand-border shadow-2xl flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-700"
        >
          <img 
            src={aboutConfig.avatarUrl} 
            alt="Profile" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="text-center md:text-left">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6">{t('about.title')}</h1>
          <p className="text-brand-muted text-xl max-w-2xl leading-relaxed">
            {t('about.desc')}
          </p>
          <div className="flex justify-center md:justify-start gap-6 mt-8">
            <SocialLink icon={<Github size={20} />} href={siteConfig.socials.github} label="Github" />
            <SocialLink icon={<Twitter size={20} />} href={siteConfig.socials.twitter} label="Twitter" />
            <SocialLink icon={<Linkedin size={20} />} href={siteConfig.socials.linkedin} label="LinkedIn" />
            <SocialLink icon={<Mail size={20} />} href={`mailto:${siteConfig.email}`} label="Email" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Story Section */}
        <div className="lg:col-span-7 space-y-12">
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              {t('about.story')} <div className="h-px flex-grow bg-brand-border" />
            </h2>
            <div className="space-y-6 text-brand-muted text-lg leading-relaxed">
              <p>
                {t('about.story.p1')}
              </p>
              <p>
                {t('about.story.p2')}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              {t('about.experience')} <div className="h-px flex-grow bg-brand-border" />
            </h2>
            <div className="space-y-10">
              {aboutConfig.timeline.map((item, index) => (
                <div key={index} className="group relative pl-8 border-l border-brand-border hover:border-brand-text transition-colors">
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-brand-border group-hover:bg-brand-text transition-colors" />
                  <div className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-2">{item.year}</div>
                  <h3 className="text-2xl font-bold">{item.role}</h3>
                  <p className="text-brand-muted text-lg">{item.company}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Skills & Action Section */}
        <div className="lg:col-span-5 space-y-12">
          <section className="bg-brand-card border border-brand-border rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-8">{t('about.skills')}</h2>
            <div className="space-y-8">
              {aboutConfig.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-bold tracking-tight">{skill.name}</span>
                    <span className="text-brand-muted font-mono">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 bg-brand-text/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: 'circOut' }}
                      className="h-full bg-brand-text"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <div className="space-y-4">
            <a href={aboutConfig.resumeUrl} target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-brand-text text-brand-bg rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-lg shadow-xl shadow-brand-text/10">
              {t('about.resume')} <ExternalLink size={20} />
            </a>
            <p className="text-center text-brand-muted text-sm">
              {t('about.available')}
            </p>
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
      className="group flex flex-col items-center gap-2"
      aria-label={label}
    >
      <div className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center group-hover:bg-brand-text group-hover:text-brand-bg transition-all duration-300">
        {icon}
      </div>
    </a>
  );
}
