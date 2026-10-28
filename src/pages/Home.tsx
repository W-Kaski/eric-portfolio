import React, { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Link,
  Container,
  Heading,
  Box,
  Button,
  List,
  ListItem,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react'
import { ChevronRightIcon, EmailIcon } from '@chakra-ui/icons'
import Paragraph from '../components/craftzdog/paragraph'
import { BioSection, BioYear } from '../components/craftzdog/bio'
import Section from '../components/craftzdog/section'
import { WorkGridItem } from '../components/craftzdog/grid-item'
import { IoLogoGithub, IoLogoLinkedin } from 'react-icons/io5'
import { getAllProjects, ProjectData } from '../lib/projects'
import { useApp } from '../context/AppContext'

const Home: React.FC = () => {
  const [featuredProjects, setFeaturedProjects] = useState<ProjectData[]>([])
  const { lang } = useApp()

  useEffect(() => {
    document.title = lang === 'zh' ? '王鹏翔 - 个人主页' : 'Eric Wang - Homepage'
  }, [lang])

  useEffect(() => {
    getAllProjects().then(projects => {
      setFeaturedProjects(projects.slice(0, 4))
    })
  }, [])

  return (
    <Container maxW="container.md">
      <Box
        borderRadius="lg"
        mb={6}
        p={3}
        textAlign="center"
        bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
        css={{ backdropFilter: 'blur(10px)' }}
        fontWeight="medium"
      >
        {lang === 'zh'
          ? '你好，我是多伦多大学 CS Specialist 在读学生 & AI / 全栈工程师！'
          : "Hello, I'm a CS Specialist student at the University of Toronto & AI / Full-Stack Engineer!"}
      </Box>

      <Box display={{ md: 'flex' }} alignItems="center">
        <Box flexGrow={1}>
          <Heading as="h2" variant="page-title" fontSize="2xl" fontWeight="bold">
            {lang === 'zh' ? '王鹏翔 (Eric Wang)' : 'Eric Wang'}
          </Heading>
          <Paragraph>
            {lang === 'zh'
              ? 'Pengxiang Wang · AI 系统工程与全栈软件开发'
              : 'Pengxiang Wang · AI Systems & Full-Stack Software Developer'}
          </Paragraph>
        </Box>
        <Box
          flexShrink={0}
          mt={{ base: 4, md: 0 }}
          ml={{ md: 6 }}
          textAlign="center"
        >
          <Box
            borderColor={useColorModeValue('blackAlpha.300', 'whiteAlpha.800')}
            borderWidth={2}
            borderStyle="solid"
            w="100px"
            h="100px"
            display="inline-block"
            borderRadius="full"
            overflow="hidden"
            shadow="lg"
          >
            <img
              src="/avatar/avatar.jpg"
              alt="Profile image"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        </Box>
      </Box>

      <Section delay={0.1}>
        <Heading as="h3" variant="section-title">
          {lang === 'zh' ? '简介' : 'Work'}
        </Heading>
        <Paragraph>
          {lang === 'zh' ? (
            <>
              Eric 是一名就读于{' '}
              <Link as="span" fontWeight="bold" color={useColorModeValue('teal.600', 'teal.300')}>
                多伦多大学
              </Link>{' '}
              计算机科学（Specialist）的软件工程师与研究者。他深入关注大语言模型（LLM）、参数高效微调（QLoRA/PEFT）、ReAct 智能体循环、模型蒸馏及工业级全栈系统。从构建严格的评测基准流水线，到设计高并发 Spring Boot / React 架构，他擅长通过严谨的工程能力解决真实场景的挑战。
            </>
          ) : (
            <>
              Eric is a software engineer and researcher studying Computer Science (Specialist) at the{' '}
              <Link as="span" fontWeight="bold" color={useColorModeValue('teal.600', 'teal.300')}>
                University of Toronto
              </Link>
              . He has an intense focus on Large Language Models (LLMs), parameter-efficient fine-tuning (QLoRA/PEFT), ReAct agent loops, model distillation, and production-grade full-stack systems. From formulating ML benchmark evaluation pipelines to crafting high-concurrency Spring Boot / React architectures, he solves real-world challenges through clean engineering.
            </>
          )}
        </Paragraph>
        <Box textAlign="center" my={4}>
          <Button
            as={RouterLink}
            to="/portfolio"
            rightIcon={<ChevronRightIcon />}
            colorScheme="teal"
          >
            {lang === 'zh' ? '查看作品集' : 'My portfolio'}
          </Button>
        </Box>
      </Section>

      <Section delay={0.2}>
        <Heading as="h3" variant="section-title">
          {lang === 'zh' ? '经历' : 'Bio'}
        </Heading>
        <BioSection>
          <BioYear>2023 — 2027</BioYear>
          {lang === 'zh'
            ? '多伦多大学，计算机科学理学学士（Specialist 在读）。'
            : 'B.Sc. in Computer Science (Specialist), University of Toronto.'}
        </BioSection>
        <BioSection>
          <BioYear>2026</BioYear>
          {lang === 'zh'
            ? 'Qwen2.5 QLoRA Text-to-SQL Benchmark · ML 工程评测基准，SQLite 执行检验与 vLLM / Transformers 服务。'
            : 'Qwen2.5 QLoRA Text-to-SQL Benchmark · ML engineering benchmark, SQLite execution check & vLLM / Transformers serving.'}
        </BioSection>
        <BioSection>
          <BioYear>2026</BioYear>
          {lang === 'zh'
            ? 'Personal Knowledge Agent · 个人知识库与 RAG 问答智能体，DDD 领域分层架构，LangGraph 编排与 MySQL 8.0 权威知识库。'
            : 'Personal Knowledge Agent · Domain-driven knowledge base & RAG question answering, LangGraph workflow, MySQL 8.0 & SSE streaming.'}
        </BioSection>
        <BioSection>
          <BioYear>2026</BioYear>
          {lang === 'zh'
            ? 'Circuit Agent · 全栈 AI 智能体平台，Spring AI + Java 21，RAG 流水线，ReAct 循环与 PgVector。'
            : 'Circuit Agent · Full-stack AI Agent platform, Spring AI + Java 21, RAG pipeline, ReAct loop & PgVector.'}
        </BioSection>
        <BioSection>
          <BioYear>2025</BioYear>
          {lang === 'zh'
            ? 'NeuTTS-Express · 表现力语音合成（蒸馏与扩散模型），PyTorch 与 MOS 主观评测。'
            : 'NeuTTS-Express · Expressive TTS via synthetic distillation, PyTorch, MOS human study.'}
        </BioSection>
        <BioSection>
          <BioYear>2025</BioYear>
          {lang === 'zh'
            ? 'Safe RL (SGPS) · 护盾引导的安全强化学习策略稳定化，JAX + DreamerV3。'
            : 'Safe RL (SGPS) · Shield-guided policy stabilization, JAX + DreamerV3.'}
        </BioSection>
        <BioSection>
          <BioYear>2025</BioYear>
          {lang === 'zh'
            ? 'Image Workspace · 云端图像处理平台，Spring Boot + Vue 3，色彩相似度检索。'
            : 'Image Workspace · Cloud image platform, Spring Boot + Vue 3, color similarity search.'}
        </BioSection>
      </Section>

      <Section delay={0.3}>
        <Heading as="h3" variant="section-title">
          {lang === 'zh' ? '爱好' : 'I ♥'}
        </Heading>
        <Paragraph>
          {lang === 'zh'
            ? '机器学习、生成式 AI 与智能体、开源系统、强化学习、数学、阅读。'
            : 'Machine Learning, Generative AI & Agents, Open Source Systems, Reinforcement Learning, Math, Reading.'}
        </Paragraph>
      </Section>

      <Section delay={0.3}>
        <Heading as="h3" variant="section-title">
          {lang === 'zh' ? '精选项目' : 'Featured Works'}
        </Heading>
        <SimpleGrid columns={[1, 1, 2]} gap={6} my={4}>
          {featuredProjects.map(project => (
            <WorkGridItem
              key={project.id}
              id={project.id}
              title={project.title}
              thumbnail={project.image}
              category="portfolio"
            >
              {project.category} · {project.date}
            </WorkGridItem>
          ))}
        </SimpleGrid>
        <Box textAlign="center" my={4}>
          <Button
            as={RouterLink}
            to="/portfolio"
            rightIcon={<ChevronRightIcon />}
            colorScheme="teal"
            variant="outline"
          >
            {lang === 'zh' ? '浏览全部作品' : 'View all works'}
          </Button>
        </Box>
      </Section>

      <Section delay={0.3}>
        <Heading as="h3" variant="section-title">
          {lang === 'zh' ? '社交平台' : 'On the web'}
        </Heading>
        <List>
          <ListItem>
            <Link href="https://github.com/W-Kaski" target="_blank">
              <Button
                variant="ghost"
                colorScheme="teal"
                leftIcon={<IoLogoGithub />}
              >
                @W-Kaski (GitHub)
              </Button>
            </Link>
          </ListItem>
          <ListItem>
            <Link href="https://www.linkedin.com/in/-ericwang-" target="_blank">
              <Button
                variant="ghost"
                colorScheme="teal"
                leftIcon={<IoLogoLinkedin />}
              >
                Eric Wang (LinkedIn)
              </Button>
            </Link>
          </ListItem>
          <ListItem>
            <Link href="mailto:ericwang7717@gmail.com">
              <Button
                variant="ghost"
                colorScheme="teal"
                leftIcon={<EmailIcon />}
              >
                ericwang7717@gmail.com
              </Button>
            </Link>
          </ListItem>
        </List>
      </Section>
    </Container>
  )
}

export default Home
