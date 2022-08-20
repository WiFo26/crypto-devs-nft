import { ethers } from "hardhat";
import { WHITELIST_CONTRACT_ADDRESS , METADATA_URL } from "../constants"

async function main() {
  
  const CryptoDev = await ethers.getContractFactory('CryptoDev');
  
  const cryptoDev  = await CryptoDev.deploy(
    METADATA_URL,
    WHITELIST_CONTRACT_ADDRESS
  )

  await cryptoDev.deployed()

  console.log(`
    CryptoDev Contract Addres: ${cryptoDev.address}
  `)

}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
