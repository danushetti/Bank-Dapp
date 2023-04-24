// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
// import {ethers} from "ethers";

async function main() {
  [signer1, signer2] = await hre.ethers.getSigners();

  const Bank = await hre.ethers.getContractFactory("Bank", signer1);
  const bank = await Bank.deploy();
  await bank.deployed();

  const Matic = await hre.ethers.getContractFactory("Matic", signer2);
  const matic = await Matic.deploy();
  await matic.deployed();

  const Shib = await hre.ethers.getContractFactory("Shib", signer2);
  const shib = await Shib.deploy();
  await shib.deployed();

  const Usdt = await hre.ethers.getContractFactory("Usdt", signer2);
  const usdt = await Usdt.deploy();
  await usdt.deployed();

  await bank.whiteListTokens(hre.ethers.utils.formatBytes32String("MATIC"),matic.address);
  await bank.whiteListTokens(hre.ethers.utils.formatBytes32String("SHIB"),shib.address);
  await bank.whiteListTokens(hre.ethers.utils.formatBytes32String("USDT"),usdt.address);
  await bank.whiteListTokens(hre.ethers.utils.formatBytes32String("ETH"),bank.address);
  
console.log("bank contract is deployed at address", bank.address, "by the signer", signer1.address);
console.log("matic contract is deployed at address", matic.address, "by the signer", signer2.address);
console.log("shib contract is deployed at address", shib.address, "by the signer", signer2.address);
console.log("usdt contract is deployed at address", usdt.address, "by the signer", signer2.address);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
