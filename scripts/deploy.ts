import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const contract = await ethers.deployContract("DocumentSigning");
  await contract.waitForDeployment();

  console.log("Contract:", await contract.getAddress());
}

main().catch(console.error);