export default async function handler(req, res) {
  const { address } = req.query

  const data = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nfts-for-address/?address=${address}`)).json()
  res.status(200).json(data)
}
