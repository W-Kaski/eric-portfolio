import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Heading, Box, Image, Link, Badge } from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'

interface TitleProps {
  children: React.ReactNode
  backTo?: string
  backLabel?: string
  onBackClick?: () => void
}

export const Title: React.FC<TitleProps> = ({ 
  children, 
  backTo = "/portfolio", 
  backLabel = "Works", 
  onBackClick 
}) => (
  <Box mb={4}>
    <Link 
      as={RouterLink} 
      to={backTo} 
      color="teal.500" 
      fontWeight="medium"
      onClick={(e) => {
        if (onBackClick) {
          e.preventDefault()
          onBackClick()
        }
      }}
    >
      {backLabel}
    </Link>
    <span>
      {' '}
      <ChevronRightIcon />{' '}
    </span>
    <Heading display="inline-block" as="h3" fontSize={20}>
      {children}
    </Heading>
  </Box>
)

export const WorkImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <Image borderRadius="lg" w="full" src={src} alt={alt} mb={4} />
)

export const Meta: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Badge colorScheme="green" mr={2} px={2} py={0.5} borderRadius="md" textTransform="none" fontSize="xs">
    {children}
  </Badge>
)
