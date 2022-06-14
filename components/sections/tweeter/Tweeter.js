import {
  useEffect,
  useState,
  useRef,
} from 'react'

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Link,
  NumberInput,
  NumberInputField,
  Skeleton,
  Spacer,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  Divider,
  Input
} from '@chakra-ui/react'

import {
  ArrowForwardIcon,
  CheckCircleIcon,
  CloseIcon,
} from '@chakra-ui/icons'

import NftsDrawer from './NftsDrawer'

import { eth } from '../../../state/eth'
import { secondsFormatter, utf8ToB64 } from '../../../utils'

export default function Tweeter({ currentSupply, contractAddress }) {
  const { address, provider, unlock } = eth.useContainer()
  const [tweet, setTweet] = useState('')
  const [link, setLink] = useState('')
  const [ownedIds, setOwnedIds] = useState([])
  const [tokenIdToCheck, setTokenIdToCheck] = useState(1)
  const [checkTokenLoading, setCheckTokenLoading] = useState(true)
  const [lastTweeted, setLastTweeted] = useState(0)
  const [displayLastTweeted, setDisplayLastTweeted] = useState(false)

  const endpoint = contractAddress === process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ? '' : '-tweetdao'

  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()

  const signatureErrorToast = useToast()

  useEffect(() => {
    if (!address) return

    async function getOwnerNfts() {
      const data = await (await fetch(
        `/api/nfts-for-address${endpoint}/${address}`
      )).json()
      setOwnedIds(data.map((item) => {
        return {
          id: item.tokenid,
          lastTweeted: item.last_tweeted,
          canTweet: 86400 <= item.last_tweeted,
        }
      }).sort((a, b) => b.lastTweeted > a.lastTweeted))
    }
    
    getOwnerNfts()
  }, [address, endpoint])

  async function checkTokenId() {
    setDisplayLastTweeted(true)
    setCheckTokenLoading(true)
    const data = await (await fetch(
      `/api/last-tweet${endpoint}/${tokenIdToCheck}`
    )).json()
    const lastTimestamp = data.lastTweet
    setLastTweeted(lastTimestamp)
    setCheckTokenLoading(false)
  }

  async function onTweetChange(e) {
    const newTweet = e.target.value
    setTweet(newTweet)
  }

  async function onReplyChange(e) {
    const newLink = e.target.value
    setLink(newLink)
  }

  function onTokenIdChange(e) {
    setTokenIdToCheck(Number(e))
    setDisplayLastTweeted(false)
  }

  function userCannotTweet() {
    return ownedIds.length === 0 || tweet.length === 0
  }

  async function makeTweet() {
    const sortedList = ownedIds.sort((a, b) => b.lastTweeted > a.lastTweeted)
    const oldestNft = sortedList[0]
    const { id, lastTweeted, } = {...oldestNft}
    if (lastTweeted >= 86400) {
      const tweetBase64Encoded = utf8ToB64(tweet)
      provider.getSigner().signMessage(tweet)
        .then(async (signature) => {
          if (!link) {
            await fetch(
              `/api/tweet${endpoint}/${id}/?signature=${signature}&message=${tweetBase64Encoded}`
            )
          }
          else {
            var tweetID = link.split('/')
            tweetID = tweetID[tweetID.length - 1].split('?')[0] 
            await fetch(
              `/api/reply-tweet${endpoint}/${id}/?tweetid=${tweetID}&signature=${signature}`+
              `&message=${tweetBase64Encoded}`
            )
          }
          const data = await (await fetch(`/api/nfts-for-address/${address}`)).json()
          setOwnedIds(data.map((item) => {
            return {
              id: item.tokenid,
              lastTweeted: item.last_tweeted,
              canTweet: 86400 <= item.last_tweeted,
            }
          }).sort((a, b) => b.lastTweeted > a.lastTweeted))
        }
        )
    } else {
      signatureErrorToast({
        title: 'Signature request declined!',
        description: `Must wait ${secondsFormatter(86400 - lastTweeted)} to Tweet again!`,
        status: 'error',
        isClosable: true,
      })
    }
  }

  return (
    <>
      <Box mt={8}>
        <Heading fontSize='xl'>Token ID Cooldown Check</Heading>
        <HStack spacing={4} mt={2}>
          <NumberInput
            w='full'
            default={1}
            min={1}
            max={currentSupply}
            step={1}
            onChange={onTokenIdChange}
          >
            <NumberInputField />
          </NumberInput>
          <Button
            bg='gray.100'
            color='gray.500'
            borderRadius='full'
            _hover={{ filter: 'brightness(80%)', }}
            _active={{ filter: 'brightness(80%)', }}
            _focus={{ outline: '', }}
            onClick={checkTokenId}
          >
            Check
          </Button>
        </HStack>
        {displayLastTweeted
          ? checkTokenLoading
            ? <Skeleton w='50%' h='1rem' mt={2} />
            : <Text mt={2} color='gray.500'>
                {lastTweeted >= 86400
                  ? <CheckCircleIcon color='green.500' />
                  : <CloseIcon color='red.500' />}{' '}
                {lastTweeted >= 86400
                  ? <><Link
                      href={`https://opensea.io/assets/${contractAddress}/${tokenIdToCheck}`}
                      target='_blank'
                      rel='noreferrer'
                      fontWeight='bold'
                      color='blue.400'
                    >
                      Token #{tokenIdToCheck}
                    </Link> can tweet right now.</>
                  : <>
                      <Link
                        href={`https://opensea.io/assets/${contractAddress}/${tokenIdToCheck}`}
                        target='_blank'
                        rel='noreferrer'
                        fontWeight='bold'
                        color='blue.400'
                      >
                        Token #{tokenIdToCheck}
                      </Link>{' '}
                      can tweet again in {secondsFormatter(Math.round(86400 - lastTweeted))}.
                    </>}
              </Text>
          : <></>}
      </Box>

      <Divider my={4} />

      <Heading fontSize='xl'>Tweet</Heading>

      <Textarea
        mt={4}
        size='lg'
        placeholder={`Tweet from @${process.env.NEXT_PUBLIC_TWITTER_USERNAME}`}
        overflowWrap='text'
        onChange={onTweetChange}
      />

      <Input
        placeholder='Link to reply to Tweet (optional)...'
        mt={2}
        onChange={onReplyChange}
      />
      <Flex mt={2}>
        <Text
          color={ownedIds.length > 0 ? 'blue.400' : 'gray.500'}
          onClick={ownedIds.length > 0 ? onOpen : () => {}}
          cursor={ownedIds.length > 0 ? 'pointer' : ''}
          _hover={ownedIds.length > 0 ? { textDecoration: 'underline', } : {}}
        >
          You own {ownedIds.length} NFTs
        </Text>
        {ownedIds.length > 0
          ? <IconButton
              ref={btnRef}
              size='xs'
              bg='none'
              icon={<ArrowForwardIcon color='blue.400' />}
              onClick={ownedIds.length > 0 ? onOpen : () => {}}
              _hover={{ bg: 'none', }}
              _active={{ bg: 'none', }}
              _focus={{ outline: '', }}
            />
          : <></>}
        <NftsDrawer
          isOpen={isOpen}
          onClose={onClose}
          btnRef={btnRef}
          ownedIds={ownedIds}
          contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
        />

        <Spacer />
        <Button
          bg='#1DA1F2'
          color='white'
          borderRadius='full'
          disabled={userCannotTweet()}
          onClick={!address ? unlock : makeTweet}
          _hover={ userCannotTweet() ? {} : { filter: 'brightness(80%)', }}
          _active={ userCannotTweet() ? {} : { filter: 'brightness(80%)', }}
          _focus={{ outline: '', }}
        >
          Tweet
        </Button>
      </Flex>
    </>
  )
}
