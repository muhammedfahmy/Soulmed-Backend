//require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/fdbc148fc16c4677a27feb601ced123e",
      accounts: [
        "066bcf6ce3200632f0da193a13ce6ea4d0db9af36c23c6cf7525b1233230c0ef",
      ],
    }, 
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 80,
    coinmarketcap: "d73b1606-2227-4aa5-8337-1f260b3e7d3c",
  },
  etherscan: {
    apiKey: "UDQJ8EGXWDCEJJKV4DHCZ9S1SBUJJFMJ7J",
  },
};

//066bcf6ce3200632f0da193a13ce6ea4d0db9af36c23c6cf7525b1233230c0ef