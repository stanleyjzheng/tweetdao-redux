export default async function handler(req, res) {
  const { tokenId } = req.query

  const data = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL}/last-tweet/?tokenid=${tokenId}`)).json()
  res.status(200).json(data)
}
