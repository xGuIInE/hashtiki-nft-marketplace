// migrations/NN_deploy_upgradeable_box.js
const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const sampleNFT = artifacts.require("SampleNFT");

module.exports = async function (deployer) {
  const nft = await deployProxy(sampleNFT, [], { deployer, kind: "uups" });
  console.log("Sample NFT deployed to", nft.address);
};
