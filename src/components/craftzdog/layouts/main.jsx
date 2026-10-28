import React from 'react'
import Navbar from '../navbar'
import { Box, Container } from '@chakra-ui/react'
import Footer from '../footer'
import BookStage from '../book-stage'
import { GridItemStyle } from '../grid-item'

const Main = ({ children, showDog = true }) => {
  return (
    <Box as="main" pb={8} minH="100vh">
      <GridItemStyle />
      <Navbar />

      <Container maxW="container.md" pt={14}>
        {showDog && <BookStage />}
        {children}
        <Footer />
      </Container>
    </Box>
  )
}

export default Main
