import base64
import json
import os
import sqlite3 as sqlite
import time

import requests
import tweepy
import uvicorn
from dotenv import load_dotenv
from eth_account.messages import defunct_hash_message
from fastapi import FastAPI
from web3.auto import w3

app = FastAPI()

load_dotenv()

CONSUMER_KEY = os.getenv('TWEEPY_CONSUMER_KEY')
CONSUMER_SECRET = os.getenv('TWEEPY_CONSUMER_SECRET')
ACCESS_TOKEN = os.getenv('TWEEPY_ACCESS_TOKEN')
ACCESS_TOKEN_SECRET = os.getenv('TWEEPY_ACCESS_SECRET')
BEARER = os.getenv('TWEEPY_BEARER_TOKEN')

client = tweepy.Client(
    bearer_token=BEARER,
    consumer_key=CONSUMER_KEY,
    consumer_secret=CONSUMER_SECRET,
    access_token=ACCESS_TOKEN,
    access_token_secret=ACCESS_TOKEN_SECRET)

os.environ['TZ'] = 'UTC'


def post_reply(message, reply_id):
    client.create_tweet(text=message, in_reply_to_tweet_id=reply_id)


def post_tweet(message):
    client.create_tweet(text=message)


def verify_signature(message_hash, signature, tokenID):
    signer = w3.eth.account.recoverHash(message_hash, signature=signature)

    contract_address = os.getenv('NEXT_PUBLIC_CONTRACT_ADDRESS')

    url = os.getenv('NEXT_PUBLIC_RPC_URL')
    url = f'{url}/getOwnersForToken/?contractAddress={contract_address}&tokenId={tokenID}'
    data = json.loads(requests.get(url).content.decode('utf8'))
    print(signer)
    print(data['owners'][0].lower())
    if data['owners'][0].replace('000000000000000000000000', '').lower() == signer.lower():
        return True
    else:
        return False


def finalize_tweet(tokenid, address, message):
    conn = sqlite.connect('db.db')
    c = conn.cursor()
    c.execute(f"INSERT INTO tweets (content, address) VALUES(?, ?)", (message, address))
    conn.commit()

    c.execute("UPDATE last_tweeted SET last_timestamp = ? WHERE token_id = ?", (int(time.time()), tokenid))
    conn.commit()
    conn.close()


def create_sqlite():
    conn = sqlite.connect('db.db')
    c = conn.cursor()

    c.execute("""CREATE TABLE IF NOT EXISTS last_tweeted (
        token_id INTEGER PRIMARY KEY,
        last_timestamp INTEGER
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS tweets (
        content TEXT,
        address TEXT
    )""")

    for i in range(1001):  # TODO PUT TOKEN COUNT HERE
        c.execute(f"INSERT INTO last_tweeted (token_id, last_timestamp) VALUES(?, ?)", (i, 1))
        conn.commit()

    conn.close()


def tweet_timestamp(tokenid):
    if True:
        conn = sqlite.connect('db.db')
        c = conn.cursor()

        last_tweet = c.execute("SELECT * FROM last_tweeted WHERE token_id = ?", (tokenid,)).fetchall()
        print(last_tweet)
        if time.time() - last_tweet[0][1] >= 86400:
            conn.close()
            return True

        else:
            conn.close()
            return False


@app.get('/nfts-for-address/')
async def nfts_for_address(address: str):
    out = []
    conn = sqlite.connect('db.db')
    c = conn.cursor()
    contract_address = os.getenv('NEXT_PUBLIC_CONTRACT_ADDRESS')
    url = os.getenv('NEXT_PUBLIC_RPC_URL')
    url = f'{url}/getNFTs/?owner={address}&contractAddresses[]={contract_address}'
    try:
        response = json.loads(requests.get(url).content.decode('utf8'))
        for i in response['ownedNfts']:
            tokenid = i['id']['tokenId']
            last_tweet = c.execute("SELECT * FROM last_tweeted WHERE token_id = ?", (int(tokenid, 16),)).fetchall()
            out.append({
                'tokenid': int(tokenid, 16),
                'last_tweeted': int(time.time() - last_tweet[0][1])
            })
        return out
    except Exception as e:
        print(e)
        return {
            'status': "Error, does not exist"
        }


@app.get('/last-tweet/')
async def last_tweet(tokenid: str):
    try:
        conn = sqlite.connect('db.db')
        c = conn.cursor()

        last_tweet = c.execute("SELECT * FROM last_tweeted WHERE token_id = ?", (tokenid,)).fetchall()
        return {
            'lastTweet': int(time.time() - last_tweet[0][1])
        }
    except sqlite.OperationalError:
        print("rip in pieces bozo")


@app.get('/tweet/')
async def tweet(signature: str, tokenid: str, message: str):
    message = base64.b64decode(message).decode('utf8')
    if verify_signature(defunct_hash_message(text=message), signature, int(tokenid)):
        if tweet_timestamp(tokenid):
            try:
                post_tweet(message)  # need better tweet error handling
                finalize_tweet(int(tokenid), defunct_hash_message(text=message), message)
            except Exception as e:
                print(e)
                return {
                    'status': 'Error: Input error.'
                }
            return {
                'status': 'success',
            }
        else:
            return {
                'status': 'Error: Please wait 24 hours before tweeting again.',
            }
    else:
        return {
            'status': 'Error: Invalid Signature.',
        }


@app.get('/reply-tweet/')
async def reply_tweet(signature: str, tokenid: str, message: str, tweetid: str):
    message = base64.b64decode(message).decode('utf8')
    if verify_signature(defunct_hash_message(text=message), signature, int(tokenid)):
        if tweet_timestamp(tokenid):
            try:
                post_reply(message, tweetid)
                finalize_tweet(int(tokenid), defunct_hash_message(text=message), message)
            except Exception as e:
                print(e)
                return {
                    'status': 'Error: Input error.'
                }
        else:
            return {
                'status': 'Error: Please wait 24 hours before tweeting again.',
            }
    else:
        return {
            'status': 'Error: Invalid Signature.',
        }


def get_id_from_link(link):
    return link.split('/')[-1].split('?')[0]


if __name__ == '__main__':
    uvicorn.run(app, debug=True)
