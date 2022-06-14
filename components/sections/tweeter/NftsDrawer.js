import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  IconButton,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react'

import {
  CheckCircleIcon,
  CloseIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons'

import { secondsFormatter } from '../../../utils'

export default function NftsDrawer({
  btnRef,
  isOpen,
  onClose,
  ownedIds,
  contractAddress,
}) {
  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      finalFocusRef={btnRef}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton _focus={{ outline: '' }} />
        <DrawerHeader>Your {process.env.NEXT_PUBLIC_APP_NAME} NFTs</DrawerHeader>

        <DrawerBody>
          <TableContainer w='full'>
            <Table w='full' variant='striped'>
              <Thead>
                <Tr>
                  <Th textAlign='center'>Token ID</Th>
                  <Th textAlign='center'>Can Tweet</Th>
                </Tr>
              </Thead>
              <Tbody>
                {ownedIds.map((item, index) => {
                  return (
                    <Tr key={index}>
                      <Td textAlign='center'>
                        {item.id}
                        <Link
                          href={`https://opensea.io/assets/${contractAddress}/${item.id}`}
                          target='_blank'
                          rel='noreferrer'
                        >
                          <IconButton
                            bg='none'
                            color='gray.500'
                            icon={<ExternalLinkIcon />}
                            _hover={{ bg: 'none', }}
                            _active={{ bg: 'none', }}
                            _focus={{ outline: 'none' }}
                          />
                        </Link>
                      </Td>
                      <Td textAlign='center'>
                        {item.canTweet
                          ? <CheckCircleIcon color='green.500' />
                          : <Tooltip
                              label={`${secondsFormatter(86400 - item.lastTweeted)} left`}
                              hasArrow
                            >
                              <CloseIcon color='red.500' />
                            </Tooltip>}
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
