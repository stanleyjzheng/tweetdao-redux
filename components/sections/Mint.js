import {
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react'

import { ethers } from 'ethers'

import { eth } from '../../state/eth'
import EthereumIcon from '../icons/EthereumIcon'

export default function Mint({ currentSupply, }) {
  const { address, contract, unlock } = eth.useContainer()

  async function mint() {
    if (!address) {
      await unlock()
    } else {
      const ethValue = ethers.utils.parseEther(process.env.NEXT_PUBLIC_MINT_PRICE).mul(Math.ceil(currentSupply / 100))
      await contract.mint({
        value: ethValue,
      })
    }
  }

  return (
    <Box>
      <Flex mt={8}>
        <Box w={['50%', '40%', '40%']} position='relative'>
          <Image
            objectFit='cover'
            src='/image.png'
            alt='image.png'
            borderRadius={16}
            boxShadow='md'
          />
        </Box>
        <VStack w='60%' pl={8} spacing={2}>
          <Text w='100%' textAlign='right' fontWeight='bold'>{process.env.NEXT_PUBLIC_APP_NAME} NFT</Text>
          <Text w='100%' textAlign='right'>Each NFT gets 1 Tweet/day</Text>
          <Text w='100%' textAlign='right'>Prices increases <EthereumIcon />
            {process.env.NEXT_PUBLIC_MINT_PRICE}/100 mints
          </Text>
          <Divider />
          <Text w='100%' textAlign='right' fontWeight='bold'>
            Current Price: <Text as='span' fontWeight='normal'>
              {
                (isNaN(currentSupply) ? "" : (<EthereumIcon />))
              }
              {
                (isNaN(currentSupply) ? "Connect wallet" : (0.0321 * Math.ceil(currentSupply / 100)))
              }
            </Text>
          </Text>
          <Text w='100%' textAlign='right' fontWeight='bold'>
            Remaining Supply: <Text as='span' fontWeight='normal'>
              {(isNaN(currentSupply) ? "Connect wallet" : process.env.NEXT_PUBLIC_TOTAL_SUPPLY - currentSupply)}
            </Text>
          </Text>
        </VStack>
      </Flex>
      <Button
        mt={4}
        w='100%'
        bg='black'
        color='white'
        borderRadius='full'
        boxShadow='xl'
        _hover={{ filter: 'brightness(80%)', }}
        _active={{ filter: 'brightness(80%)', }}
        _focus={{ outline: '', }}
        onClick={mint}
      >
        Mint 1 {process.env.NEXT_PUBLIC_APP_NAME} NFT
      </Button>
    </Box>
  )
}
