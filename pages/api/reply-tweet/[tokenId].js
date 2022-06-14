export default async function handler(req, res) {
  const { tokenId, tweetid, signature, message } = req.query

  const data = await (await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reply-tweet/?tweetid=${tweetid}?tokenid=${tokenId}&signature=${signature}` +
    `&message=${message}`
  )).json()
  res.status(200).json(data)
}
