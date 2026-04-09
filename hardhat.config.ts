import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [hardhatEthers, hardhatVerify],

  solidity: "0.8.20",

  networks: {
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545"
    },
    bscTestnet: {
      type: "http",
      url: process.env.RPC_URL as string,
      accounts: [process.env.PRIVATE_KEY as string],
      chainId: 97
    }
  },

  verify: {
    etherscan: {
      apiKey: process.env.BSCSCAN_API_KEY
    }
  }
});