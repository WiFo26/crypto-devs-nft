import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as configuration } from "dotenv";
configuration({path: '.env'})

const ALCHEMY_KEY_URL = process.env.ALCHEMY_API_KEY_URL;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    'rinkeby': {
      url: ALCHEMY_KEY_URL,
      accounts: [RINKEBY_PRIVATE_KEY as string]
    }
  }
};

export default config;
