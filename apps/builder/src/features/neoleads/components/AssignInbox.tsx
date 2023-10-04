import React from 'react'
import {useScopedI18n} from '@/locales'
import {
  Box,
  Flex,
  Text,
  Button,
  Select, SimpleGrid
} from "@chakra-ui/react";
import {trpc} from "@/lib/trpc";

export const AssignInbox = () => {
  const scopedT = useScopedI18n('neoleads.assignInbox')
  const { data } = trpc.neoleads.listInboxes.useQuery()

  return (
    <Box style={{paddingInline: '10px'}}>
      <SimpleGrid  minChildWidth='320px' spacing='40px'>
        <Box>
          <Text fontWeight="bold" mb={3}>
            {scopedT('label')}
          </Text>
          <Text mb={5}>
            {scopedT('description')}
          </Text>
        </Box>
        <Box>
          <Flex align="center">
            <Select
              placeholder="Select option"
              variant="outline"
              w="full"
              mb={3}
            >
              {data?.inboxes.map((inbox) => (
                <option key={inbox.id} value={inbox.id}>{inbox.name}</option>
              ))}
            </Select>
          </Flex>
          <Flex justify="space-between" mt={3}>
            <Button colorScheme="blue" variant="solid">
              {scopedT('primaryButton')}
            </Button>
            <Button variant="outline">
              {scopedT('secondaryButton')}
            </Button>
          </Flex>
        </Box>
      </SimpleGrid>
    </Box>
  )
}
