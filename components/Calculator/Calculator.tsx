'use client';

import React, { useContext } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { Alert, Flex, LoadingOverlay, Stack } from '@mantine/core';
import TaxForm from '@/components/TaxForm/TaxForm';
import TaxTable from '@/components/TaxTable/TaxTable';
import { TaxContext } from '@/store/TaxContext';

const Calculator = () => {
  const { results, error, loading } = useContext(TaxContext);

  return (
    <Flex direction={{ base: 'column', sm: 'row' }} gap={8}>
      <Stack p={4}>
        <TaxForm />
      </Stack>
      <Stack flex={1} p={4} pos="relative">
        <LoadingOverlay
          visible={loading && results.length > 0}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <TaxTable />
      </Stack>
      {error && (
        <Alert
          variant="light"
          color="yellow"
          title="Alert title"
          pos="fixed"
          bottom={32}
          m={12}
          mr={12}
          maw={400}
          right={0}
          withCloseButton
          icon={<IconInfoCircle />}
        >
          There seems to be an issue connecting with our backend systems. Please refresh the page on
          a later time. Sorry for the inconvenience.
        </Alert>
      )}
    </Flex>
  );
};

export default Calculator;
