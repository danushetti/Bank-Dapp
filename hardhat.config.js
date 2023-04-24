require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");

const {API_URL, PRIVATE_KEY}= process.env;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks:{
    sepolia:{
      url: API_URL,
      accounts :[`0x${PRIVATE_KEY}`]
    }  
  },
  gasReporter:{
    enabled: true,
    }
};
