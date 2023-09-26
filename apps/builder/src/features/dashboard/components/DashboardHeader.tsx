import React from 'react'
import { HStack, Flex, Button, useDisclosure } from '@chakra-ui/react'
import { SettingsIcon } from '@/components/icons'
import { signOut } from 'next-auth/react'
import { useUser } from '@/features/account/hooks/useUser'
import { isNotDefined } from '@typebot.io/lib'
import Link from 'next/link'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { useScopedI18n } from '@/locales'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { WorkspaceDropdown } from '@/features/workspace/components/WorkspaceDropdown'
import { WorkspaceSettingsModal } from '@/features/workspace/components/WorkspaceSettingsModal'

export const DashboardHeader = () => {
  const scopedT = useScopedI18n('dashboard.header')
  const { user } = useUser()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { workspace, switchWorkspace, createWorkspace } = useWorkspace()

  const { isOpen, onOpen, onClose } = useDisclosure()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogOut = () => {
    signOut()
  }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateNewWorkspace = () =>
    createWorkspace(user?.name ?? undefined)

  return (
    <Flex w="full" borderBottomWidth="1px" justify="center">
      <Flex
        justify="space-between"
        alignItems="center"
        h="16"
        maxW="1000px"
        flex="1"
      >
        <Link href="" data-testid="typebot-logo">
          <EmojiOrImageIcon
            boxSize="30px"
            icon={'/icons/logo.svg'}
          />
        </Link>
        <HStack>
          {user && workspace && (
            <WorkspaceSettingsModal
              isOpen={isOpen}
              onClose={onClose}
              user={user}
              workspace={workspace}
            />
          )}
          <Button
            leftIcon={<SettingsIcon />}
            onClick={onOpen}
            isLoading={isNotDefined(workspace)}
          >
            {scopedT('settingsButton.label')}
          </Button>
          {/*<WorkspaceDropdown*/}
          {/*  currentWorkspace={workspace}*/}
          {/*  onLogoutClick={handleLogOut}*/}
          {/*  onCreateNewWorkspaceClick={handleCreateNewWorkspace}*/}
          {/*  onWorkspaceSelected={switchWorkspace}*/}
          {/*/>*/}
        </HStack>
      </Flex>
    </Flex>
  )
}
