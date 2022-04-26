// migrations/NN_deploy_upgradeable_box.js
const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const sampleNFT = artifacts.require("SampleNFT");
const nftMarketplace = artifacts.require("NFTMarketPlace");

module.exports = async function (deployer) {
  const nft = await sampleNFT.deployed();

  const markeplace = await deployProxy(nftMarketplace, [nft.address], {
    deployer,
    kind: "uups",
  });
  console.log("Marketplace deployed to", markeplace.address);
  await nft.setMarketplaceAdd(markeplace.address);
  console.log("Marketplace address setted in NFT");
};
