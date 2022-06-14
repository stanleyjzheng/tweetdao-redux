import Head from 'next/head'
import dynamic from 'next/dynamic'

import { eth } from '../state/eth'
const HomePage = dynamic(() => import('../components/HomePage'))

export default function Home(props) {
  return (
    <eth.Provider>
      <Head>
        <title>{props.test}Tweet DAO Redux</title>
        <meta charSet='utf-8' />
      </Head>

      <HomePage />
    </eth.Provider>
  )
}


function getStaticProps() {
    return {
        props: {
            test: props.env.TEST
        }
    }
}