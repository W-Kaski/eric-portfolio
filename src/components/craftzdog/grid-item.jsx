import { Link as RouterLink } from 'react-router-dom'
import { Box, Text, LinkBox, LinkOverlay } from '@chakra-ui/react'
import { Global } from '@emotion/react'

export const GridItem = ({ children, href, title, thumbnail }) => (
  <Box w="100%" textAlign="center">
    <LinkBox cursor="pointer">
      <img
        src={thumbnail}
        alt={title}
        className="grid-item-thumbnail"
        loading="lazy"
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
      />
      <LinkOverlay href={href} target="_blank">
        <Text mt={2}>{title}</Text>
      </LinkOverlay>
      <Text fontSize={14}>{children}</Text>
    </LinkBox>
  </Box>
)

export const WorkGridItem = ({
  children,
  category = 'portfolio',
  id,
  title,
  thumbnail
}) => (
  <Box w="100%" textAlign="center">
    <LinkBox
      as={RouterLink}
      to={`/${category}/${id}`}
      cursor="pointer"
    >
      <Box
        borderRadius="12px"
        overflow="hidden"
        bg="whiteAlpha.100"
        h={{ base: '140px', md: '160px' }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="grid-item-thumbnail"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            w="100%"
            h="100%"
            bgGradient="linear(to-tr, teal.500, purple.500)"
            opacity={0.8}
            className="grid-item-thumbnail"
          />
        )}
      </Box>
      <LinkOverlay as="div">
        <Text mt={2} fontSize={20} fontWeight="bold">
          {title}
        </Text>
      </LinkOverlay>
      <Text fontSize={14} color="gray.400" mt={1}>
        {children}
      </Text>
    </LinkBox>
  </Box>
)

export const GridItemStyle = () => (
  <Global
    styles={`
      .grid-item-thumbnail {
        border-radius: 12px;
      }
    `}
  />
)
