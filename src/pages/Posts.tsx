import React, { useEffect, useState, useMemo } from 'react'
import {
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  Text,
  Box,
  LinkBox,
  LinkOverlay,
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
import { Link as RouterLink } from 'react-router-dom'
import Section from '../components/craftzdog/section'
import { getAllArticles, ArticleMeta } from '../lib/articles'
import { useApp } from '../context/AppContext'

const Posts: React.FC = () => {
  const [articles, setArticles] = useState<ArticleMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
  const { lang } = useApp()

  useEffect(() => {
    document.title = lang === 'zh' ? '文章 - 王鹏翔' : 'Posts - Eric Wang'
  }, [lang])

  useEffect(() => {
    getAllArticles().then(data => {
      setArticles(data)
      setLoading(false)
    })
  }, [])

  // Extract unique folders
  const folders = useMemo(() => {
    const set = new Set<string>()
    articles.forEach(a => {
      if (a.folder) set.add(a.folder)
    })
    return ['All', ...Array.from(set).sort()]
  }, [articles])

  // Filter & Sort
  const filteredArticles = useMemo(() => {
    let result = [...articles]
    if (activeFolder !== 'All') {
      result = result.filter(a => a.folder === activeFolder)
    }
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return a.title.localeCompare(b.title)
    })
    return result
  }, [articles, activeFolder, sortBy])

  const menuBg = useColorModeValue('#f0e7db', '#202023')
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const controlBorder = useColorModeValue('blackAlpha.300', 'whiteAlpha.200')
  const controlBg = useColorModeValue('whiteAlpha.600', 'whiteAlpha.100')
  const cardBg = useColorModeValue('whiteAlpha.500', 'whiteAlpha.100')

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
          {lang === 'zh' ? '文章' : 'Posts'}
        </Heading>

        <Flex alignItems="center" gap={3} flexWrap="wrap">
          {/* Folder Menu */}
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
              {activeFolder === 'All' && lang === 'zh' ? '全部目录' : activeFolder}
            </MenuButton>
            <MenuList zIndex={50} bg={menuBg} borderColor={borderColor} boxShadow="lg">
              {folders.map(f => (
                <MenuItem
                  key={f}
                  onClick={() => setActiveFolder(f)}
                  fontSize="xs"
                  bg={activeFolder === f ? useColorModeValue('blackAlpha.100', 'whiteAlpha.100') : 'transparent'}
                  fontWeight={activeFolder === f ? 'bold' : 'normal'}
                  color={activeFolder === f ? 'teal.400' : undefined}
                >
                  {f === 'All' && lang === 'zh' ? '全部目录' : f}
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

      {/* Grid of Articles */}
      {filteredArticles.length === 0 ? (
        <Center py={16}>
          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
            {lang === 'zh' ? '该目录下未找到任何文章。' : 'No posts found in this folder.'}
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={[1, 1, 2]} gap={6}>
          {filteredArticles.map((article, idx) => (
            <Section key={article.id} delay={0.08 * (idx % 4)}>
              <Box
                w="100%"
                textAlign="left"
                p={4}
                borderRadius="lg"
                bg={cardBg}
                backdropFilter="blur(5px)"
                borderWidth="1px"
                borderColor={borderColor}
                transition="all 0.25s ease"
                _hover={{
                  transform: 'translateY(-3px)',
                  boxShadow: 'md',
                  borderColor: 'teal.400'
                }}
              >
                <LinkBox as={RouterLink} to={`/articles/${article.id}`} cursor="pointer">
                  <Flex justifyContent="space-between" alignItems="center" mb={1}>
                    <Text fontSize="xs" color="teal.500" fontWeight="bold">
                      {article.folder || article.category || 'Article'}
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                      {article.date}
                    </Text>
                  </Flex>

                  <LinkOverlay as="div">
                    <Text
                      mt={1}
                      fontSize={16}
                      fontWeight="bold"
                      lineHeight="1.4"
                      color={useColorModeValue('gray.800', 'whiteAlpha.900')}
                    >
                      {article.title}
                    </Text>
                  </LinkOverlay>

                  <Text
                    fontSize={13}
                    color={useColorModeValue('gray.600', 'gray.400')}
                    mt={2}
                    noOfLines={2}
                    lineHeight="1.6"
                  >
                    {article.excerpt || 'Read this post to learn more...'}
                  </Text>
                </LinkBox>
              </Box>
            </Section>
          ))}
        </SimpleGrid>
      )}
    </Container>
  )
}

export default Posts
