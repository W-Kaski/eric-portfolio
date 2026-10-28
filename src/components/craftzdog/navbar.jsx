import { forwardRef } from 'react'
import Logo from './logo'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Container,
  Box,
  Link,
  Stack,
  Heading,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
  IconButton,
  Button,
  useColorModeValue
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import ThemeToggleButton from './theme-toggle-button'
import { IoLogoGithub } from 'react-icons/io5'
import { useApp } from '../../context/AppContext'

const LinkItem = ({ href, path, target, children, ...props }) => {
  const active = path === href
  const inactiveColor = useColorModeValue('gray.800', 'whiteAlpha.900')
  return (
    <Link
      as={RouterLink}
      to={href}
      p={2}
      bg={active ? 'grassTeal' : undefined}
      color={active ? '#202023' : inactiveColor}
      borderRadius="md"
      target={target}
      {...props}
    >
      {children}
    </Link>
  )
}

const MenuLink = forwardRef(({ to, ...rest }, ref) => (
  <RouterLink ref={ref} to={to} {...rest} />
))

const Navbar = props => {
  const location = useLocation()
  const path = location.pathname
  const { lang, toggleLang } = useApp()

  const navWorks = lang === 'zh' ? '作品' : 'Works'
  const navPosts = lang === 'zh' ? '文章' : 'Posts'
  const navLab = lang === 'zh' ? '实验室' : 'ML Lab'
  const navAbout = lang === 'zh' ? '关于' : 'About'
  const navSource = lang === 'zh' ? '源码' : 'Source'

  return (
    <Box
      position="fixed"
      as="nav"
      w="100%"
      bg={useColorModeValue('#ffffff40', '#20202380')}
      css={{ backdropFilter: 'blur(10px)' }}
      zIndex={2}
      {...props}
    >
      <Container
        display="flex"
        p={2}
        maxW="container.md"
        wrap="wrap"
        align="center"
        justify="space-between"
      >
        <Flex align="center" mr={5}>
          <Heading as="h1" size="lg" letterSpacing={'tighter'}>
            <Logo />
          </Heading>
        </Flex>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          display={{ base: 'none', md: 'flex' }}
          width={{ base: 'full', md: 'auto' }}
          alignItems="center"
          flexGrow={1}
          mt={{ base: 4, md: 0 }}
        >
          <LinkItem href="/portfolio" path={path}>
            {navWorks}
          </LinkItem>
          <LinkItem href="/articles" path={path}>
            {navPosts}
          </LinkItem>
          <LinkItem href="/ml-lab" path={path}>
            {navLab}
          </LinkItem>
          <LinkItem href="/about" path={path}>
            {navAbout}
          </LinkItem>
          <Link
            target="_blank"
            href="https://github.com/W-Kaski"
            display="inline-flex"
            alignItems="center"
            style={{ gap: 4 }}
            pl={2}
            p={2}
            color={useColorModeValue('gray.800', 'whiteAlpha.900')}
          >
            <IoLogoGithub />
            {navSource}
          </Link>
        </Stack>

        <Box flex={1} align="right" display="flex" alignItems="center" justifyContent="flex-end">
          {/* Language Toggle Button to the left of Theme Toggle */}
          <Button
            aria-label="Toggle language"
            variant="ghost"
            size="md"
            mr={2}
            onClick={toggleLang}
            fontSize="xs"
            fontWeight="bold"
            borderRadius="lg"
            minW="38px"
            h="40px"
            px={2.5}
            color={useColorModeValue('gray.800', 'whiteAlpha.900')}
            _hover={{
              bg: useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
            }}
          >
            {lang === 'en' ? '中' : 'EN'}
          </Button>

          <ThemeToggleButton />

          <Box ml={2} display={{ base: 'inline-block', md: 'none' }}>
            <Menu isLazy id="navbar-menu">
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                variant="outline"
                aria-label="Options"
              />
              <MenuList bg={useColorModeValue('#f0e7db', '#202023')}>
                <MenuItem as={MenuLink} to="/">
                  {navAbout}
                </MenuItem>
                <MenuItem as={MenuLink} to="/portfolio">
                  {navWorks}
                </MenuItem>
                <MenuItem as={MenuLink} to="/articles">
                  {navPosts}
                </MenuItem>
                <MenuItem as={MenuLink} to="/ml-lab">
                  {navLab}
                </MenuItem>
                <MenuItem
                  as={Link}
                  href="https://github.com/W-Kaski"
                  target="_blank"
                >
                  {navSource}
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Navbar
