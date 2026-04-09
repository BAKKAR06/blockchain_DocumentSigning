import { describe, it, before } from "node:test";
import assert from "node:assert";
import { network } from "hardhat";

describe("DocumentSigning", () => {

  let contract: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let outsider: any;

  async function expectRevert(promise: Promise<any>) {
    let reverted = false;
    try { 
      await promise; 
    } catch { 
      reverted = true; 
    }
    assert.equal(reverted, true);
  }

  before(async () => {
    const { ethers } = await network.connect();
    [owner, user1, user2, outsider] = await ethers.getSigners();

    contract = await ethers.deployContract("DocumentSigning");
    await contract.waitForDeployment();
  });

  it("create", async () => {
    await contract.createDocument("hash", [user1.address, user2.address]);
    assert.equal(await contract.isAllowed(1, user1.address), true);
  });

  it("outsider blocked", async () => {
    await expectRevert(contract.connect(outsider).signDocument(1));
  });

  it("sign", async () => {
    await contract.connect(user1).signDocument(1);
    assert.equal(await contract.isSigned(1, user1.address), true);
  });

  it("double sign blocked", async () => {
    await expectRevert(contract.connect(user1).signDocument(1));
  });

  it("complete", async () => {
    await contract.connect(user2).signDocument(1);
    assert.equal(await contract.isCompleted(1), true);
  });

});