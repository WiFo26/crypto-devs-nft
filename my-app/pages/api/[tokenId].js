export default function handler(req, res) {
  const tokenId = req.query.tonkenId;

  const image_url ='https://raw.githubusercontent.com/WiFo26/crypto-devs-nft/main/my-app/public/cryptodevs/'

  res.status(200).json({
    name: "Crypto Dev #" + tokenId,
    description: "Crypto Dev is a collection of developers in crypto",
    image: image_url + tokenId + ".svg",
  });
}