import React, {useEffect, useState} from 'react'
import {useScopedI18n} from '@/locales'
import {
  Box,
  Flex,
  Text,
  Button,
  CheckboxGroup, HStack, Checkbox
} from "@chakra-ui/react";
import {trpc} from "@/lib/trpc";
import { useToast } from '@/hooks/useToast'
import {useTypebot} from "@/features/editor/providers/TypebotProvider";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const AssignInbox = () => {
  const scopedT = useScopedI18n('neoleads.assignInbox')
  const { data } = trpc.neoleads.listInboxes.useQuery()
  const { typebot } = useTypebot()
  const { showToast } = useToast()

  const { mutate: createAgentBot, isLoading: isCreating } =
    trpc.neoleads.createAgentBot.useMutation({
      onError: (error) =>
        showToast({
          title: 'Error while connecting inbox',
          description: error.message,
        }),
      onSuccess: () => {
        showToast({
          title: 'Successfully connected to Inbox',
        })
      },
    })

  const [checkedValues, setCheckedValues] = useState<string[]>([]);

  useEffect(() => {
    if(typebot?.agentbot?.inboxes) {
      console.log(typebot.agentbot.inboxes)
      setCheckedValues(typebot.agentbot.inboxes);
    }
  }, [typebot]);

  const handleCheckboxChange = (values: string[]) => {
    console.log(values)
    setCheckedValues(values);
  };

  return (
    <Box style={{paddingInline: '10px'}}>
        <Box>
          <Text mb={5}>
            {scopedT('description')}
          </Text>
        </Box>
        <Box>
          <Flex align="center">
            <CheckboxGroup
              onChange={handleCheckboxChange}
              value={checkedValues}
            >
              <HStack spacing='24px'>
                {data?.inboxes.map((inbox) => (
                  <Checkbox key={inbox.id} value={inbox.id.toString()}>{inbox.name}</Checkbox>
                ))}
              </HStack>
            </CheckboxGroup>
          </Flex>
          <Flex mt={3}>
            <Button
              isLoading={isCreating}
              colorScheme="blue"
              variant="solid"
              onClick={() => {
                if (typebot)
                  createAgentBot({
                    typebotId: typebot.id,
                    inboxIds: checkedValues
                  })
              }}
            >
              {scopedT('primaryButton')}
            </Button>
          </Flex>
        </Box>
    </Box>
  )
}
