
import {
    Container,
    Divider,
} from '@chakra-ui/react'

import NavBar from './sections/NavBar'
import Tweeter from './sections/tweeter/Tweeter'
import TwitterTimeline from './TwitterTimeline'

export default function TweetDAOPage() {
    return (
        <Container p={[4, 8, 12]}>
            <NavBar />
            <Tweeter contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS} />
            <Divider my={8} />
            <TwitterTimeline />
        </Container>
    )
}