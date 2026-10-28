import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, FileText } from 'lucide-react';
import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { useApp } from '../../context/AppContext';

const vectorDB = [
  { id: 1, text: "The quick brown fox jumps over the lazy dog.", coords: [20, 30] },
  { id: 2, text: "Quantum computing utilizes superposition for faster calculation.", coords: [80, 20] },
  { id: 3, text: "Machine learning relies on gradient descent optimization.", coords: [70, 70] },
  { id: 4, text: "Photosynthesis is the process by which plants make glucose.", coords: [10, 80] },
  { id: 5, text: "Generative AI creates novel content based on existing patterns.", coords: [60, 85] }
];

export default function RAGExplorerLab() {
  const { t } = useApp();
  const [query, setQuery] = useState("How does neural network optimization work?");
  const [step, setStep] = useState(0); 
  // steps: 0 (idle), 1 (embedding query), 2 (searching space), 3 (retrieving), 4 (augmented prompt)
  
  const [queryCoords, setQueryCoords] = useState<[number, number] | null>(null);
  
  const reset = () => { setStep(0); setQueryCoords(null); };

  const playSimulation = () => {
    reset();
    setTimeout(() => {
      setStep(1); // embedding
      setTimeout(() => {
        setQueryCoords([75, 65]); // hardcoded near machine learning entry
        setStep(2); // mapping
        setTimeout(() => {
          setStep(3); // retrieving top 2
          setTimeout(() => {
            setStep(4); // augmented
          }, 1800);
        }, 1800);
      }, 1400);
    }, 400);
  };

  const topK = [vectorDB[2], vectorDB[4]]; // Machine learning & Generative AI

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const spaceBg = useColorModeValue('blackAlpha.50', 'blackAlpha.500');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('white', 'whiteAlpha.100');
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const activeStepBg = useColorModeValue('teal.50', 'rgba(49, 151, 149, 0.15)');
  const activeStepBorder = useColorModeValue('teal.400', 'teal.300');

  return (
    <Box h="100%" display="flex" flexDirection="column" p={6}>
      {/* Search Toolbar */}
      <Flex alignItems="center" gap={4} mb={6} flexWrap="wrap">
        <Flex flexGrow={1} maxW="520px" gap={2}>
          <Input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={step > 0 && step < 4}
            bg={inputBg}
            color={textColor}
            borderColor={borderColor}
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px #319795' }}
            fontSize="sm"
            fontFamily="mono"
          />
          <Button 
            colorScheme="teal"
            onClick={playSimulation}
            isLoading={step > 0 && step < 4}
            fontSize="sm"
            px={6}
          >
            {t('lab.rag.run') || 'Run'}
          </Button>
        </Flex>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={reset}
          color={mutedTextColor}
          _hover={{ color: textColor }}
        >
          {t('lab.rag.reset') || 'Reset'}
        </Button>
      </Flex>

      {/* Main Simulation View */}
      <Flex flexGrow={1} gap={6} flexDirection={{ base: 'column', md: 'row' }} minH="440px">
        {/* Status Pipeline */}
        <Flex w={{ base: '100%', md: '35%' }} direction="column" gap={3}>
          {/* Step 1 */}
          <Box
            p={3.5}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={step >= 1 ? activeStepBorder : borderColor}
            bg={step >= 1 ? activeStepBg : cardBg}
            transition="all 0.3s ease"
            opacity={step === 0 ? 0.8 : 1}
          >
            <Flex justifyContent="space-between" alignItems="center" mb={1}>
              <Text fontSize="xs" fontWeight="bold" color={step >= 1 ? 'teal.500' : mutedTextColor}>
                1. Embedding Model
              </Text>
              {step === 1 && <Badge colorScheme="teal" fontSize="9px">Processing</Badge>}
            </Flex>
            <Text fontSize="xs" fontFamily="mono" color={textColor}>
              {t('lab.rag.embeddingModel') || 'text-embedding-3-small'}
            </Text>
            {step === 1 && (
              <motion.div
                style={{ height: '2px', backgroundColor: '#319795', marginTop: '8px' }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.4 }}
              />
            )}
          </Box>

          {/* Step 2 */}
          <Box
            p={3.5}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={step >= 2 ? activeStepBorder : borderColor}
            bg={step >= 2 ? activeStepBg : cardBg}
            transition="all 0.3s ease"
            opacity={step < 2 ? 0.7 : 1}
          >
            <Flex justifyContent="space-between" alignItems="center" mb={1}>
              <Text fontSize="xs" fontWeight="bold" color={step >= 2 ? 'teal.500' : mutedTextColor}>
                2. Vector Database
              </Text>
              {step === 2 && <Badge colorScheme="teal" fontSize="9px">Searching</Badge>}
            </Flex>
            <Flex alignItems="center" gap={2}>
              <Database size={14} className="text-teal-500" />
              <Text fontSize="xs" fontFamily="mono" color={textColor}>
                {t('lab.rag.pgvector') || 'PGVector Search'}
              </Text>
            </Flex>
          </Box>

          {/* Step 3: Retrieved Context */}
          <AnimatePresence>
            {step >= 3 && (
              <Box
                as={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                p={3.5}
                borderRadius="lg"
                borderWidth="1px"
                borderColor="teal.400"
                bg={activeStepBg}
                mt="auto"
              >
                <Text fontSize="xs" fontWeight="bold" color="teal.500" mb={2}>
                  {t('lab.rag.retrievedContext') || 'Retrieved Context'}
                </Text>
                {topK.map(k => (
                  <Box
                    key={k.id}
                    fontSize="11px"
                    fontFamily="mono"
                    color={textColor}
                    mb={2}
                    borderLeftWidth="2px"
                    borderColor="teal.400"
                    pl={2}
                  >
                    {k.text}
                  </Box>
                ))}
              </Box>
            )}
          </AnimatePresence>
        </Flex>

        {/* 2D Vector Space Visualizer */}
        <Box
          w={{ base: '100%', md: '65%' }}
          position="relative"
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          bg={spaceBg}
          overflow="hidden"
          minH="320px"
        >
          {vectorDB.map(v => {
            const isMatch = step >= 3 && topK.some(t => t.id === v.id);
            return (
              <Box
                key={v.id}
                position="absolute"
                w="12px"
                h="12px"
                borderRadius="full"
                bg={isMatch ? 'teal.400' : 'gray.400'}
                boxShadow={isMatch ? '0 0 12px rgba(49, 151, 149, 0.8)' : 'none'}
                transform={isMatch ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%)'}
                transition="all 0.8s ease"
                left={`${v.coords[0]}%`}
                top={`${v.coords[1]}%`}
              >
                <Text
                  position="absolute"
                  left="16px"
                  top="-6px"
                  w="200px"
                  fontSize="10px"
                  fontFamily="mono"
                  color={isMatch ? 'teal.500' : mutedTextColor}
                  fontWeight={isMatch ? 'bold' : 'normal'}
                  whiteSpace="nowrap"
                  pointerEvents="none"
                >
                  {v.text.substring(0, 24)}...
                </Text>
              </Box>
            );
          })}

          {queryCoords && step >= 2 && (
            <Box
              as={motion.div}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              position="absolute"
              w="16px"
              h="16px"
              borderRadius="full"
              bg="teal.500"
              boxShadow="0 0 16px rgba(49, 151, 149, 0.9)"
              transform="translate(-50%, -50%)"
              left={`${queryCoords[0]}%`}
              top={`${queryCoords[1]}%`}
              zIndex={10}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box w="4px" h="4px" bg="white" borderRadius="full" />
              {step >= 3 && (
                <motion.svg
                  className="absolute pointer-events-none"
                  style={{ width: '180px', height: '180px', transform: 'translate(-50%, -50%)', left: '8px', top: '8px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <circle cx="50%" cy="50%" r="35" fill="none" stroke="#319795" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="50%" cy="50%" r="65" fill="none" stroke="#319795" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.6" />
                </motion.svg>
              )}
            </Box>
          )}

          {/* Augmented Prompt Overlay */}
          {step === 4 && (
            <Box
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              position="absolute"
              inset={0}
              bg={useColorModeValue('rgba(255, 255, 255, 0.92)', 'rgba(26, 32, 44, 0.92)')}
              backdropFilter="blur(6px)"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={6}
              zIndex={20}
            >
              <FileText size={28} className="text-teal-500 mb-2" />
              <Text fontSize="md" fontWeight="bold" color={textColor} mb={4}>
                {t('lab.rag.promptAugmented') || 'Prompt Augmented'}
              </Text>
              
              <Box
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                p={4}
                borderRadius="lg"
                textAlign="left"
                w="full"
                maxW="480px"
                boxShadow="md"
              >
                <Text fontSize="10px" color={mutedTextColor} fontFamily="mono" mb={2}>
                  {t('lab.rag.systemPrompt') || 'SYSTEM: Answer user questions using the context below.'}
                </Text>
                <Text fontSize="xs" fontWeight="bold" color="teal.500" fontFamily="mono" mb={1}>
                  {t('lab.rag.contextLabel') || 'CONTEXT:'}
                </Text>
                {topK.map(k => (
                  <Text key={k.id} fontSize="xs" color={textColor} fontFamily="mono" borderLeftWidth="2px" borderColor="teal.400" pl={2} mb={1}>
                    {k.text}
                  </Text>
                ))}
                <Text fontSize="xs" fontWeight="bold" color={textColor} fontFamily="mono" mt={3} mb={1}>
                  {t('lab.rag.userQueryLabel') || 'USER QUERY: '}{query}
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
