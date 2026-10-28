import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/src/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { getArticleById, Article } from '@/src/lib/articles';
import { useApp } from '@/src/context/AppContext';
import { Badge, List, ListItem, Link, Box, Button } from '@chakra-ui/react';
import { ExternalLinkIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { Title, Meta } from '../components/craftzdog/work';

interface Header {
  id: string;
  text: string;
  level: number;
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useApp();

  const [article, setArticle] = useState<Article | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeHeader, setActiveHeader] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    getArticleById(id).then(found => {
      if (found) {
        setArticle(found);
      } else {
        setNotFound(true);
      }
    });
  }, [id]);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} - Eric Wang`;
    }
  }, [article]);

  const headers = useMemo(() => {
    if (!article) return [];
    const lines = article.content.split('\n');
    const extracted: Header[] = [];
    let inCodeFence = false;
    lines.forEach(line => {
      if (line.trimStart().startsWith('```')) { inCodeFence = !inCodeFence; return; }
      if (inCodeFence) return;
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const hid = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        extracted.push({ id: hid, text, level });
      }
    });
    return extracted;
  }, [article]);

  useEffect(() => {
    if (!article) return;
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = headers.length - 1; i >= 0; i--) {
        const el = document.getElementById(headers[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollPosition) {
            setActiveHeader(headers[i].id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article, headers]);

  const scrollToHeader = (hid: string) => {
    const el = document.getElementById(hid);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (notFound) {
    return (
      <div className="px-6 max-w-7xl mx-auto py-32 text-center">
        <p className="text-brand-muted text-sm">{lang === 'zh' ? '未找到对应文章' : 'Article not found'}</p>
        <button onClick={() => navigate('/articles')} className="mt-6 flex items-center gap-2 mx-auto text-brand-text hover:text-brand-muted transition-colors">
          <ArrowLeft size={16} /> {lang === 'zh' ? '返回文章列表' : 'Back to Posts'}
        </button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto px-4 pb-32"
    >
      <Box mb={2}>
        <Button
          as={RouterLink}
          to="/articles"
          leftIcon={<ChevronLeftIcon />}
          size="sm"
          variant="ghost"
          colorScheme="teal"
          px={2}
        >
          {lang === 'zh' ? '返回文章列表' : 'Back to Posts'}
        </Button>
      </Box>

      <Title backTo="/articles" backLabel={lang === 'zh' ? '文章' : 'Posts'}>
        {article.title} <Badge colorScheme="teal" ml={2} px={2} py={0.5} borderRadius="md" textTransform="none">{article.date}</Badge>
      </Title>

      <List ml={2} my={4} spacing={2} fontSize="sm">
        <ListItem>
          <Meta>Category</Meta>
          <span>{article.category || 'Article'}</span>
        </ListItem>
        {article.folder && (
          <ListItem>
            <Meta>Folder</Meta>
            <span>{article.folder}</span>
          </ListItem>
        )}
        {article.pdfUrl && (
          <ListItem>
            <Meta>Paper</Meta>
            <Link href={article.pdfUrl} target="_blank" color="teal.400">
              View Publication <ExternalLinkIcon mx="2px" />
            </Link>
          </ListItem>
        )}
      </List>

          <div className="max-w-none">
            <div className="text-brand-text leading-[1.8] text-base">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({ children }) => {
                    const hid = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return <h1 id={hid} className="text-3xl font-bold mt-12 mb-6 text-brand-text border-b border-brand-border/30 pb-3">{children}</h1>;
                  },
                  h2: ({ children }) => {
                    const hid = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return <h2 id={hid} className="text-2xl font-bold mt-10 mb-4 text-brand-text">{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const hid = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return <h3 id={hid} className="text-xl font-semibold mt-8 mb-3 text-brand-text">{children}</h3>;
                  },
                  h4: ({ children }) => {
                    const hid = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return <h4 id={hid} className="text-lg font-semibold mt-6 mb-2 text-brand-text">{children}</h4>;
                  },
                  p: ({ children }) => {
                    const childArr = React.Children.toArray(children).filter(
                      c => !(typeof c === 'string' && c.trim() === '')
                    );
                    const allImgs = childArr.length > 0 && childArr.every(
                      c => React.isValidElement(c) && (c.type === 'img' || (c as any).props?.src)
                    );
                    if (allImgs) return <div className="flex flex-wrap gap-2 my-3">{children}</div>;
                    return <p className="mb-5 text-brand-text/85 leading-[1.85]">{children}</p>;
                  },
                  strong: ({ children }) => <strong className="font-bold text-brand-text">{children}</strong>,
                  em: ({ children }) => <em className="italic text-brand-text/80">{children}</em>,
                  a: ({ href, children }) => {
                    if (href?.startsWith('#')) {
                      return (
                        <a
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(href.substring(1));
                            if (element) {
                              const top = element.getBoundingClientRect().top + window.scrollY - 80;
                              window.scrollTo({ top, behavior: 'smooth' });
                            }
                          }}
                          className="text-brand-text underline underline-offset-4 decoration-brand-border hover:decoration-brand-text transition-colors"
                        >
                          {children}
                        </a>
                      );
                    }
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-text underline underline-offset-4 decoration-brand-border hover:decoration-brand-text transition-colors">
                        {children}
                      </a>
                    );
                  },
                  ul: ({ children }) => <ul className="mb-5 pl-6 space-y-1.5 list-disc text-brand-text/85">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-5 pl-6 space-y-1.5 list-decimal text-brand-text/85">{children}</ol>,
                  li: ({ children }) => <li className="text-brand-text/85 leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="my-6 pl-5 border-l-4 border-brand-text/30 text-brand-muted italic bg-brand-card/30 py-3 pr-3 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-10 border-brand-border/40" />,
                  table: ({ children }) => (
                    <div className="my-8 overflow-x-auto rounded-lg border border-brand-border/40">
                      <table className="w-full text-sm text-brand-text">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-brand-card/50 border-b border-brand-border/40">{children}</thead>,
                  th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-3 text-brand-text/80 border-t border-brand-border/20">{children}</td>,
                  img: ({ src, alt }) => <img src={src} alt={alt} className="rounded-lg max-w-full my-6 border border-brand-border/30" />,
                  code({ className, children }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const lang = match ? match[1] : '';
                    const codeContent = String(children).replace(/\n$/, '');
                    const isBlock = match || codeContent.includes('\n');
                    if (isBlock) {
                      return (
                        <div className="my-8 rounded-xl overflow-hidden border border-brand-border/60 shadow-lg">
                          <div className="flex items-center justify-between px-5 py-2.5 bg-[#1e1e1e] border-b border-white/10">
                            <span className="text-xs font-mono font-medium text-white/60">{lang || 'code'}</span>
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                            </div>
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={lang || 'text'}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: '1.25rem 1.5rem', fontSize: '0.825rem', lineHeight: '1.7', background: '#1e1e1e' }}
                          >
                            {codeContent}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-brand-text/10 font-mono text-[0.85em] text-brand-text border border-brand-border/30">
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      );
    }
