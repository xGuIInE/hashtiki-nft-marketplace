const { upgradeProxy } = require("@openzeppelin/truffle-upgrades");
const { assert, expect } = require("chai");
const exp = require("constants");
const truffleAssert = require("truffle-assertions");

const sampleNFT = artifacts.require("SampleNFT");
const nftMarketplace = artifacts.require("NFTMarketPlace");

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

contract("Marketplace", function (wallets) {
  it("Admin can pause & unpause", async () => {
    const marketplace = await nftMarketplace.deployed();

    await truffleAssert.passes(marketplace.pause());
    await truffleAssert.passes(marketplace.unpause());
  });
  it("Can sell NFTs", async () => {
    const nft = await sampleNFT.deployed();
    const marketplace = await nftMarketplace.deployed();

    const userWallet = wallets[1];

    // Mint nft 0
    const TOKEN_ID = 0;
    await nft.safeMint(userWallet, TOKEN_ID);
    // Sell it for 1 ETH
    await marketplace.sellNFT(nft.address, 0, 1, { from: userWallet });

    const marketItems = await marketplace.fetchMarketItems();
    expect(marketItems[0].itemId).equal("1");
    expect(marketItems[0].nftContract).equal(nft.address);
    expect(marketItems[0].tokenId).equal(TOKEN_ID.toString());
    expect(marketItems[0].seller).equal(userWallet);
    expect(marketItems[0].owner).equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(marketItems[0].price).equal("1");
    expect(marketItems[0].sold).equal(false);
  });
  it("Can buy NFTs", async () => {
    const nft = await sampleNFT.deployed();
    const marketplace = await nftMarketplace.deployed();

    const adminWallet = wallets[0];

    let balanceAdmin = await nft.balanceOf(adminWallet);

    expect(balanceAdmin.toString()).equal("0");

    await truffleAssert.fails(marketplace.createMarketSale(1));

    balanceAdmin = await nft.balanceOf(adminWallet);

    expect(balanceAdmin.toString()).equal("0");
    await truffleAssert.passes(
      marketplace.createMarketSale(1, { value: web3.utils.toWei("1") })
    );
    balanceAdmin = await nft.balanceOf(adminWallet);

    expect(balanceAdmin.toString()).equal("1");
  });
});

contract("Upgradeable", function (wallets) {
  it("Can upgrade all contracts", async () => {
    const nft = await sampleNFT.deployed();
    const marketplace = await nftMarketplace.deployed();
    await upgradeProxy(nft.address, sampleNFT);
    await upgradeProxy(marketplace.address, nftMarketplace);
  });
});
