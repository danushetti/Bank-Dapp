import "./App.css";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

import bank from "./contracts/Bank.sol/Bank.json";
import matic from "./contracts/Matic.sol/Matic.json";
import shib from "./contracts/Shib.sol/Shib.json";
import usdt from "./contracts/Usdt.sol/Usdt.json";

function App() {
  //signer is used to interact with the blockchain as a user
  //a provider  is the most basic way to interact with the blockchain using ethers.js
  const [Provider, setProvider] = useState(undefined);
  const [Signer, setSigner] = useState(undefined);

  const [BankContract, setBankContract] = useState(undefined);
  const [MaticContract, setMaticContract] = useState(undefined);
  const [ShibContract, setShibContract] = useState(undefined);
  const [UsdtContract, setUsdtContract] = useState(undefined);

  const [Symbols, setSymbols] = useState(null);

  useEffect(() => {
    const bankAddress = "";
    const bankABI = bank.abi;

    const maticAddress = "";
    const maticABI = matic.abi;

    const shibAddress = "";
    const shibABI = shib.abi;

    const usdtAddress = "";
    const usdtABI = usdt.abi;

    const init = async () => {
      //first we get the provider
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      //then we get the instance of our bank contract
      const bankContract = await new ethers.Contract(bankAddress, bankABI);
      setBankContract(bankContract);

      const maticContract = await new ethers.Contract(maticAddress, maticABI);
      setMaticContract(maticContract);

      const shibContract = await new ethers.Contract(shibAddress, shibABI);
      setShibContract(shibContract);

      const usdtContract = await new ethers.Contract(usdtAddress, usdtABI);
      setUsdtContract(usdtContract);
      
      //to get token symbols from the contract
      await bankContract.connect(provider).getWhiteListedTokens()
      .then((result) => {
        const symbols = result.map(s => toString(s));
        setSymbols(symbols);
      });


    };
  });


  return <div className="App"></div>;
}

export default App;
