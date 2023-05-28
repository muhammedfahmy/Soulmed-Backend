const { expect } = require("chai");

const { ethers } = require("hardhat");

describe("Main tests", function () {

  let accounts;
  let soulproof;
  let soulproofOwner;
  let entityOwner;
  let sbtSoul;
  let externalUser;
  let sbtCollection;

  before(async function () {
    accounts = await ethers.getSigners();
    soulproofOwner = accounts[0];
    entityOwner = accounts[1];
    sbtSoul = accounts[2];
    externalUser = accounts[3];
    const contract = await ethers.getContractFactory("SoulProof", soulproofOwner);
    soulproof = await contract.deploy();
  })

  it("Creates entity", async () => {
    const user = soulproof.connect(soulproofOwner);
    await user.setAddCollectionFees(ethers.utils.parseEther("0.2"));
    let tx = await user.addEntity("AUC", entityOwner.address);
    const entities = await user.getAllEntities();
    expect(entities[0].owner).to.equal(entityOwner.address);
  })

  it("Transfers entity ownership", async () => {
    const user = soulproof.connect(entityOwner);
    await user.transferEntityOwnership(0, soulproofOwner.address);
    const entities = await user.getAllEntities();
    expect(entities[0].owner).to.equal(soulproofOwner.address);
    const user2 = soulproof.connect(soulproofOwner);
    await user2.transferEntityOwnership(0, entityOwner.address);
  })

  it("Creates SBT collection", async () => {
    const user = soulproof.connect(entityOwner);
    let name = "Summer 2020 graduates";
    let symbol = "SUM2020";
    await user.addNewCollection(0, name, symbol, true, "https://gateway.pinata.cloud/ipfs/QmUjB8qsG3o5tNe9c9UjthftvsLPLHF2FAfdZYgF99kREa/",{value: ethers.utils.parseEther("0.3")});
    let address = await user.collections(0);
    sbtCollection = await ethers.getContractAt("SoulboundToken", address, entityOwner);
    const collectionInfo = await sbtCollection.collectionInfo(); 
    expect(collectionInfo.entityId.toNumber()).to.equal(0);
    expect(await sbtCollection.name()).to.equal(name);
    expect(await sbtCollection.symbol()).to.equal(symbol);
  })

  it("Mints SBTs", async () => {
    const minter = soulproof.connect(entityOwner);
    for(var i = 0; i < 9; i++) {
      await minter.issueSBT(0, sbtCollection.address, accounts[i].address, "", {value: ethers.utils.parseEther("0.05")});
    }
    const owner = await minter.ownerOfSBT(sbtCollection.address, 3);
    expect(owner).to.equal(sbtSoul.address);
    const collections = await minter.getSoulCollections(sbtSoul.address);
    expect(collections[0].revoked).to.equal(false);
    expect(collections[0].collectionAddress).to.equal(sbtCollection.address);
  })

  it("Mints an SBT with a token URI", async () => {
    const minter = soulproof.connect(entityOwner);
    const tokenURI = "https://example/9.png";
    await minter.issueSBT(0, sbtCollection.address, accounts[9].address, tokenURI, {value: ethers.utils.parseEther("0.05")});
    const viewer = sbtCollection.connect(externalUser)
    const tokenId = await viewer.verify(accounts[9].address);
    expect(await viewer.sbtTokenURI(tokenId)).to.equal(tokenURI);
  })

  it("Updates a single SBT's token URI", async () => {
    const owner = soulproof.connect(entityOwner);
    const tokenURI = "https://example.com/5.png";
    await owner.setTokenURI(0, sbtCollection.address, 5, tokenURI)
    const viewer = sbtCollection.connect(externalUser)
    expect(await viewer.sbtTokenURI(4)).to.equal("https://gateway.pinata.cloud/ipfs/QmUjB8qsG3o5tNe9c9UjthftvsLPLHF2FAfdZYgF99kREa/4");
    expect(await viewer.sbtTokenURI(5)).to.equal(tokenURI);
    expect(await viewer.sbtTokenURI(6)).to.equal("https://gateway.pinata.cloud/ipfs/QmUjB8qsG3o5tNe9c9UjthftvsLPLHF2FAfdZYgF99kREa/6");
  })

  it("Verifies token ownership", async () => {
    const verifier = sbtCollection.connect(externalUser);
    const tokenId = await verifier.verify(sbtSoul.address);
    expect(tokenId.toNumber()).to.equal(3);
  })

  it("Gets all collections", async () => {
    const verifier = soulproof.connect(externalUser);
    const collections = await verifier.getAllCollections();
    expect(collections.length).to.equal(1);
  })

  it("Revokes SBT", async () => {
    const revoker = soulproof.connect(entityOwner);
    await revoker.revokeSBT(0, sbtCollection.address, sbtSoul.address);
    const collections = await revoker.getSoulCollections(sbtSoul.address);
    expect(collections[0].revoked).to.equal(true);
  })

  it("Unrevokes SBT", async () => {
    const unrevoker = soulproof.connect(entityOwner);
    await unrevoker.unrevokeSBT(0, sbtCollection.address, sbtSoul.address);
    const collections = await unrevoker.getSoulCollections(sbtSoul.address);
    expect(collections[0].revoked).to.equal(false);
    expect(collections[0].tokenId.toNumber()).to.equal(3);
  })

  // it("Confirm contract balance", async () => {
  //   let contractBalance = await ethers.provider.getBalance(soulproof.address);
  //   expect(ethers.utils.formatEther(contractBalance)).to.equal("0.35");
  // })
});
