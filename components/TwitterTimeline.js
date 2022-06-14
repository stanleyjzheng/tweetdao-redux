import {
  Box,
} from '@chakra-ui/react'

export default function TwitterTimeline() {
  return (
    <Box>
      <a
        className="twitter-timeline"
        href={`https://twitter.com/${process.env.NEXT_PUBLIC_TWITTER_USERNAME}`}
      >
        Tweets by @{process.env.NEXT_PUBLIC_TWITTER_USERNAME}
      </a>
      <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
    </Box>
  )
}