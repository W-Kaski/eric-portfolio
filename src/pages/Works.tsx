import React, { useEffect, useState, useMemo } from 'react'
import {
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  Text,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { Folder, SortAsc } from 'lucide-react'
import Section from '../components/craftzdog/section'
import { WorkGridItem } from '../components/craftzdog/grid-item'
import { getAllProjects, ProjectData } from '../lib/projects'
import { useApp } from '../context/AppContext'

const Works: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
  const { lang } = useApp()

  useEffect(() => {
    document.title = lang === 'zh' ? '作品集 - 王鹏翔' : 'Works - Eric Wang'
  }, [lang])

  useEffect(() => {
    getAllProjects().then(data => {
      setProjects(data)
      setLoading(false)
    })
  }, [])

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    projects.forEach(p => {
      if (p.category) set.add(p.category)
    })
    return ['All', ...Array.from(set).sort()]
  }, [projects])

  // Filter & Sort
  const filteredProjects = useMemo(() => {
    let result = [...projects]
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory)
    }
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return a.title.localeCompare(b.title)
    })
    return result
  }, [projects, activeCategory, sortBy])

  const menuBg = useColorModeValue('#f0e7db', '#202023')
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const controlBorder = useColorModeValue('blackAlpha.300', 'whiteAlpha.200')
  const controlBg = useColorModeValue('whiteAlpha.600', 'whiteAlpha.100')

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="teal.500" />
      </Center>
    )
  }

  return (
    <Container maxW="container.md" pb={16}>
      {/* Header + Controls */}
      <Flex
        flexDirection={{ base: 'column', sm: 'row' }}
        alignItems={{ base: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={4}
        mb={6}
        pb={4}
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <Heading as="h3" fontSize={20} className="section-title">
          {lang === 'zh' ? '作品集' : 'Works'}
        </Heading>

        <Flex alignItems="center" gap={3} flexWrap="wrap">
          {/* Category Menu */}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<Folder size={14} />}
              size="sm"
              variant="outline"
              borderRadius="lg"
              fontSize="xs"
              fontWeight="medium"
              borderColor={controlBorder}
              bg={controlBg}
            >
              {activeCategory === 'All' && lang === 'zh' ? '全部分类' : activeCategory}
            </MenuButton>
            <MenuList zIndex={50} bg={menuBg} borderColor={borderColor} boxShadow="lg">
              {categories.map(c => (
                <MenuItem
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  fontSize="xs"
                  bg={activeCategory === c ? useColorModeValue('blackAlpha.100', 'whiteAlpha.100') : 'transparent'}
                  fontWeight={activeCategory === c ? 'bold' : 'normal'}
                  color={activeCategory === c ? 'teal.400' : undefined}
                >
                  {c === 'All' && lang === 'zh' ? '全部分类' : c}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Single Sort Toggle */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<SortAsc size={14} />}
            onClick={() => setSortBy(prev => (prev === 'date' ? 'title' : 'date'))}
            borderRadius="lg"
            fontSize="xs"
            fontWeight="medium"
            borderColor={controlBorder}
            bg={controlBg}
          >
            {lang === 'zh'
              ? `排序: ${sortBy === 'date' ? '日期' : '标题'}`
              : `Sort: ${sortBy === 'date' ? 'Date' : 'Title'}`}
          </Button>
        </Flex>
      </Flex>

      {/* Grid List */}
      {filteredProjects.length === 0 ? (
        <Center py={16}>
          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
            {lang === 'zh' ? '该分类下未找到任何作品。' : 'No projects found in this category.'}
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={[1, 1, 2]} gap={6}>
          {filteredProjects.map((p, idx) => (
            <Section key={p.id} delay={0.08 * (idx % 4)}>
              <WorkGridItem
                id={p.id}
                title={p.title}
                thumbnail={p.image}
                category="portfolio"
              >
                {p.category} · {p.date}
              </WorkGridItem>
            </Section>
          ))}
        </SimpleGrid>
      )}
    </Container>
  )
}

export default Works
