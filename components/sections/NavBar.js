import Link from 'next/link'

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Link as ChakraLink,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react'

import {
  ExternalLinkIcon,
} from '@chakra-ui/icons'

import { eth } from '../../state/eth'
import EtherscanIcon from '../icons/EtherscanIcon'
import OpenSeaIcon from '../icons/OpenSeaIcon'
import TwitterIcon from '../icons/TwitterIcon'

export default function NavBar() {
  const { address, unlock } = eth.useContainer()

  return (
    <Flex alignItems='center'>
      <VStack spacing={0}>
        <Box mb={0}>
        <Link href='/' passHref>
          <Text
            fontSize='2xl'
            fontWeight='bold'
            cursor='pointer'
            _hover={{
              textDecoration: 'underline',
            }}
          >
            {process.env.NEXT_PUBLIC_APP_NAME}
          </Text>
        </Link>
        </Box>
        <HStack w='full' mt={0} justifyItems='stretch'>
          <NavBarIcon href={`https://twitter.com/${process.env.NEXT_PUBLIC_TWITTER_USERNAME}`} icon={<TwitterIcon />} />
          <NavBarIcon href='https://opensea.io/collection/bluebirddao' icon={<OpenSeaIcon />} />
          <NavBarIcon
            href={`https://etherscan.io/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
            icon={<EtherscanIcon />}
          />
        </HStack>
      </VStack>
      <Spacer />
      {!address
        ? <Button
            bg='black'
            color='white'
            borderRadius='full'
            _hover={{ filter: 'brightness(80%)', }}
            _active={{ filter: 'brightness(80%)', }}
            _focus={{ outline: '', }}
            onClick={() => unlock()}
          >
            Connect Wallet
          </Button>
        : <Button
            bg='gray.100'
            color='gray.500'
            borderRadius='full'
            rightIcon={<ExternalLinkIcon />}
            _hover={{ filter: 'brightness(80%)', }}
            _active={{ filter: 'brightness(80%)', }}
            _focus={{ outline: '', }}
          >
            <ChakraLink
              href={`https://etherscan.io/address/${address}`}
              target='_blank'
              rel='noreferrer'
            >
              {address.slice(0, 9)}…
            </ChakraLink>
          </Button>}
    </Flex>
  )
}

function NavBarIcon({ icon, href, }) {
  return (
    <ChakraLink href={href} target='_blank' rel='noreferrer'>
      <IconButton
        bg='none'
        h='1.5rem'
        icon={icon}
        _hover={{ bg: 'none', }}
        _active={{ bg: 'none', }}
        _focus={{ bg: 'none', outline: 'none', }}
      />
    </ChakraLink>
  )
}
