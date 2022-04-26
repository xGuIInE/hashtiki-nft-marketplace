const { upgradeProxy } = require("@openzeppelin/truffle-upgrades");
const { assert } = require("chai");
const truffleAssert = require("truffle-assertions");

const sampleNFT = artifacts.require("SampleNFT");

const BASE_URI = "https://mynfturl";

contract("Sample NFT", function (wallets) {
  it("Admin can pause & unpause", async () => {
    const nft = await sampleNFT.deployed();

    await truffleAssert.passes(nft.pause());
    await truffleAssert.passes(nft.unpause());
  });
  it("Can mint tokens", async () => {
    const nft = await sampleNFT.deployed();

    const adminWallet = wallets[0];
    const userWallet = wallets[1];

    let balanceUser = await nft.balanceOf(userWallet);

    assert.equal(balanceUser.toString(), 0);

    await nft.safeMint(userWallet, 0);
    balanceUser = await nft.balanceOf(userWallet);

    assert.equal(balanceUser.toString(), 1);
  });
  it("Can give permissions to other wallet", async () => {
    const nft = await sampleNFT.deployed();

    const userWallet = wallets[1];
    const otherWallet = wallets[2];

    await nft.approve(otherWallet, 0, { from: userWallet });

    let balanceOther = await nft.balanceOf(otherWallet);
    assert.equal(balanceOther.toString(), 0);

    await nft.safeTransferFrom(userWallet, otherWallet, 0, {
      from: otherWallet,
    });

    balanceOther = await nft.balanceOf(otherWallet);
    assert.equal(balanceOther.toString(), 1);
  });
});

contract("Upgradeable", function (wallets) {
  it("Can upgrade all contracts", async () => {
    const nft = await sampleNFT.deployed();

    await upgradeProxy(nft.address, sampleNFT);
  });
});
