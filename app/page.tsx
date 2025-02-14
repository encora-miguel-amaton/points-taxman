'use client';

import { useEffect } from 'react';
import {
  AppShell,
  Box,
  Burger,
  Flex,
  List,
  ListItem,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Calculator from '@/components/Calculator/Calculator';
import { TaxProvider } from '@/store/TaxContext';

export default function HomePage() {
  const [opened, { toggle }] = useDisclosure();
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    setColorScheme('auto');
  }, []);

  return (
    <TaxProvider>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Flex align="center" p={14}>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" mr={8} />
            <Text size="xl" fw={700}>
              Taxman
            </Text>
          </Flex>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Box p={4}>
            <Box my={8} mx={4}>
              <Text size="xl" mb={4} fw={700}>
                Meet Taxman!
              </Text>
              <Text color="dimmed" mb={4}>
                Say hello to your new tax sidekick. Let's tackle taxes together.
              </Text>

              <List size="md" mb={6}>
                <ListItem>Choose your years (2019–2022)</ListItem>
                <ListItem>Plug in your numbers</ListItem>
                <ListItem>Get it right every time</ListItem>
              </List>
            </Box>
          </Box>
        </AppShell.Navbar>

        <AppShell.Main>
          <Calculator />
        </AppShell.Main>
      </AppShell>
    </TaxProvider>
  );
}
