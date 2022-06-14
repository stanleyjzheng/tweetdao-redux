import Head from 'next/head'
import dynamic from 'next/dynamic'

import { eth } from '../state/eth'
const NoMintPage = dynamic(() => import('../components/NoMint'))

export default function TweetDAO() {
    return (
        <eth.Provider>
            <Head>
                <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
                <meta charSet='utf-8' />
            </Head>

            <NoMintPage />
        </eth.Provider>
    )
}
