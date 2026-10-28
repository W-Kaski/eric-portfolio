import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './lib/theme';
import { AppProvider } from './context/AppContext';
import { ConfigProvider } from './context/ConfigContext';
import Main from './components/craftzdog/layouts/main';
import Home from './pages/Home';
import Works from './pages/Works';
import Posts from './pages/Posts';
import ProjectDetail from './pages/ProjectDetail';
import MLLab from './pages/MLLab';
import ArticleDetail from './pages/ArticleDetail';

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <ConfigProvider>
        <AppProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Main showDog={true}><Home /></Main>} />
              <Route path="/about" element={<Main showDog={false}><Home /></Main>} />
              <Route path="/portfolio" element={<Main showDog={false}><Works /></Main>} />
              <Route path="/portfolio/:id" element={<Main showDog={false}><ProjectDetail /></Main>} />
              <Route path="/works" element={<Main showDog={false}><Works /></Main>} />
              <Route path="/works/:id" element={<Main showDog={false}><ProjectDetail /></Main>} />
              <Route path="/articles" element={<Main showDog={false}><Posts /></Main>} />
              <Route path="/articles/:id" element={<Main showDog={false}><ArticleDetail /></Main>} />
              <Route path="/posts" element={<Main showDog={false}><Posts /></Main>} />
              <Route path="/posts/:id" element={<Main showDog={false}><ArticleDetail /></Main>} />
              <Route path="/ml-lab" element={<Main showDog={false}><MLLab /></Main>} />
            </Routes>
          </Router>
        </AppProvider>
      </ConfigProvider>
    </ChakraProvider>
  );
}
