import Link from 'next/link'

import {
  useEffect,
  useState,
} from 'react'

import {
  Container,
  Divider,
} from '@chakra-ui/react'

import NavBar from './sections/NavBar'
import Tweeter from './sections/tweeter/Tweeter'
import Mint from './sections/Mint'

import { eth } from '../state/eth'
import TwitterTimeline from './TwitterTimeline'

export default function HomePage() {
  const { contract } = eth.useContainer()
  const [currentSupply, setCurrentSupply] = useState('loading...')

  useEffect(() => {
    if (!contract) return

    async function totalSupply() {
      try {
        const totalSupplyAmt = await contract.totalSupply()
        setCurrentSupply(totalSupplyAmt)
      } catch (err) {
        console.error(err)
      }
    }

    totalSupply()
  }, [contract])

  return (
    <Container p={[4, 8, 12]}>
      <NavBar />
      <Tweeter contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS} />
      <Divider my={8} />
      <Mint currentSupply={currentSupply} />
      <Divider my={8} />
      <TwitterTimeline />
    </Container>
  )
}
