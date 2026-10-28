import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Search, Terminal, FileCode2, Check } from 'lucide-react';
import {
  Box,
  Flex,
  Button,
  Text,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { useApp } from '../../context/AppContext';

const steps = [
  { id: 1, type: "thought", text: "User wants weather in Tokyo and its Fahrenheit equivalent. I need to get the current weather first." },
  { id: 2, type: "action", tool: "WebSearch", args: '{"query": "weather in Tokyo celsius"}' },
  { id: 3, type: "observation", text: "Current weather in Tokyo is 15°C." },
  { id: 4, type: "thought", text: "I have the Celsius temperature. Now I need to calculate the Fahrenheit equivalent using the formula: (C * 9/5) + 32." },
  { id: 5, type: "action", tool: "PythonInterpreter", args: '{"code": "c = 15\\nf = (c * 9/5) + 32\\nprint(f)"}' },
  { id: 6, type: "observation", text: "59.0" },
  { id: 7, type: "thought", text: "I have both temperatures. I can construct the final answer now." },
  { id: 8, type: "finish", text: "The current weather in Tokyo is 15°C, which is exactly 59.0°F." }
];

export default function ReActAgentLab() {
  const { t } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);

  // Theme-aware colors
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const cardBg = useColorModeValue('white', 'whiteAlpha.100');
  const thoughtBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const actionBg = useColorModeValue('blue.50', 'rgba(66, 153, 225, 0.12)');
  const actionBorder = useColorModeValue('blue.300', 'blue.500');
  const obsBg = useColorModeValue('emerald.50', 'rgba(52, 211, 153, 0.12)');
  const obsBorder = useColorModeValue('emerald.300', 'emerald.500');
  const finishBg = useColorModeValue('teal.50', 'rgba(49, 151, 149, 0.15)');
  const finishBorder = useColorModeValue('teal.400', 'teal.300');

  useEffect(() => {
    if (playing && currentStepIndex < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, currentStepIndex === -1 ? 500 : 1600);
      return () => clearTimeout(timer);
    } else if (playing && currentStepIndex >= steps.length) {
      setPlaying(false);
    }
  }, [playing, currentStepIndex]);

  const startReAct = () => {
    setCurrentStepIndex(-1);
    setPlaying(true);
  };

  return (
    <Box h="100%" display="flex" flexDirection="column" p={6}>
      {/* Top Header */}
      <Flex
        alignItems={{ base: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={4}
        mb={6}
        pb={4}
        borderBottomWidth="1px"
        borderColor={borderColor}
        flexDirection={{ base: 'column', sm: 'row' }}
      >
        <Box>
          <Text fontSize="xs" fontWeight="semibold" color={mutedTextColor} mb={1}>
            {t('lab.react.userPrompt') || 'Prompt'}
          </Text>
          <Text fontSize="sm" fontFamily="mono" color={textColor} fontWeight="medium">
            {t('lab.react.defaultPrompt') || 'What is the weather in Tokyo right now in Fahrenheit?'}
          </Text>
        </Box>
        <Button
          onClick={startReAct}
          isLoading={playing}
          colorScheme="teal"
          size="sm"
          px={5}
        >
          {currentStepIndex >= steps.length ? 'Restart Agent' : 'Start Execution'}
        </Button>
      </Flex>

      {/* Step Trace Stream */}
      <Flex direction="column" gap={3} flexGrow={1} overflowY="auto" pr={2}>
        {steps.map((step, idx) => {
          if (idx > currentStepIndex) return null;

          let Icon = Bot;
          let label = "Thought";
          let bg = thoughtBg;
          let border = borderColor;
          let badgeColor = "gray";

          if (step.type === 'action') {
            Icon = step.tool === 'WebSearch' ? Search : Terminal;
            label = `Action: ${step.tool}`;
            bg = actionBg;
            border = actionBorder;
            badgeColor = "blue";
          } else if (step.type === 'observation') {
            Icon = FileCode2;
            label = "Observation";
            bg = obsBg;
            border = obsBorder;
            badgeColor = "green";
          } else if (step.type === 'finish') {
            Icon = Check;
            label = "Final Answer";
            bg = finishBg;
            border = finishBorder;
            badgeColor = "teal";
          }

          return (
            <Box
              as={motion.div}
              key={step.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={border}
              bg={bg}
              boxShadow="xs"
            >
              <Flex alignItems="center" gap={2} mb={2}>
                <Icon size={14} />
                <Badge colorScheme={badgeColor} fontSize="10px" textTransform="none">
                  {label}
                </Badge>
              </Flex>
              {step.type === 'action' ? (
                <Box
                  as="pre"
                  fontSize="xs"
                  fontFamily="mono"
                  p={2}
                  borderRadius="md"
                  bg={useColorModeValue('blackAlpha.50', 'blackAlpha.400')}
                  color={textColor}
                  whiteSpace="pre-wrap"
                >
                  {step.args}
                </Box>
              ) : (
                <Text fontSize="sm" fontFamily="mono" color={textColor} lineHeight="1.6">
                  {step.text}
                </Text>
              )}
            </Box>
          );
        })}

        {currentStepIndex === -1 && !playing && (
          <Flex flexGrow={1} alignItems="center" justifyContent="center" py={16}>
            <Text fontSize="sm" color={mutedTextColor}>
              Click "Start Execution" above to observe the ReAct thought-action loop.
            </Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
