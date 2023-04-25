// import "./App.css";
// import { ethers } from "ethers";
// import { useEffect, useState } from "react";

// import bank from "./contracts/Bank.sol/Bank.json";
// import matic from "./contracts/Matic.sol/Matic.json";
// import shib from "./contracts/Shib.sol/Shib.json";
// import usdt from "./contracts/Usdt.sol/Usdt.json";

// function App() {
  
//   //signer is used to interact with the blockchain as a user
//   //a provider  is the most basic way to interact with the blockchain using ethers.js
//   const [Provider, setProvider] = useState(undefined);
//   const [Signer, setSigner] = useState(undefined);
//   const [SingerAddress, setSignerAddress] = useState(undefined);
//   const [BankContract, setBankContract] = useState(undefined);
  
//   const [tokenContracts, setTokenContract] = useState({});
//   const [tokenBalances, setTokenBalances] = useState({});
//   const [tokenSymbols, setTokenSymbols] = useState([]);

//   const [amount , setAmount] = useState(0);
//   const [showModal, setShowmodal] = useState(false);
//   const [selectedSymbol, setSelectedSymbol] = useState(undefined);
//   const [isDeposit, setIsDeposit] = useState(true);
  

//   //conversions
//   const toBytes32 = text => (ethers.utils.formatBytes32String(text)); 
//   const toString = bytes32 => (ethers.utils.parseBytes32String(bytes32));
//   const toWei = ether => (ethers.utils.parseEther(ether));
//   const toEther = wei => (ethers.utils.formatEther(wei).toString());
//   const toRound = num => (Number(num).toFixed(2));

//   useEffect(() => {
//     const bankAddress = "0x2ED2BD2832573432ca508347aD4636fFb17f0301";
//     const bankABI = bank.abi;

//     const maticAddress = "0x6fa805874201c5F77C7e07AcA0f4B1fAa2bA21Df";
//     const maticABI = matic.abi;

//     const shibAddress = "0xb81071D1ED34dB03C3E821a278184C2368e8c6b0";
//     const shibABI = shib.abi;

//     const usdtAddress = "0x72e66e54c569B06827bF86417AE9C9D7a5B997B4";
//     const usdtABI = usdt.abi;

//     const init = async () => {
//       //first we get the provider
//       const provider = await new ethers.providers.Web3Provider(window.ethereum);
//       setProvider(provider);
//       setSigner( provider.getSigner());

//       //then we get the instance of our bank contract
//       const bankContract = await new ethers.Contract(bankAddress, bankABI);
//       setBankContract(bankContract);

//       //to get token symbols from the contract
//       await bankContract.connect(provider).getWhiteListedTokensSymbols()
//       .then((result) => {
//         const symbols = result.map(s => toString(s));
//         setTokenSymbols(symbols);
//         console.log(symbols);
//       });   
//     };
//   });


//   const getTokenContract = async (symbol, BankContract, Provider) =>{

//     const address = await BankContract.connect(Provider).getWhiteListedTokensAddress(toBytes32(symbol))
//     const abi = symbol === "Matic" ? matic.abi :(symbol === "Shib" ? shib.abi :  usdt.abi )
//     const tokenContract = new ethers.Contract(address, abi)
//     return tokenContract
//   }

//   const getTokenContracts = async (symbols, BankContract, Provider) =>{
//     symbols.map(async symbol =>{
//       const contract = await getTokenContract(symbol, BankContract, Provider)
//       setTokenContract(prev => ({...prev, [symbol]: contract}))
//     })
//   }

//   const isConnected = () => (Signer !== "undefined") 

//   return 
//   <div className="App">
//     <header className="App-Header">
//       {isConnected() ?(
//       <div>
//         <p> welcome {SingerAddress?.substring(0,10)}...</p>
//       </div>
//       ) : (
//       <div>
//         <p> you are not connected.</p>
//         <button onClick="">Connect MetaMask</button>
//       </div>
//       ) }
//     </header>
//   </div>;
// }

// export default App;
import './App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Modal from './Modal.js';

import bankArtifact from './contracts/Bank.sol/Bank.json';
import maticArtifact from './contracts/Matic.sol/Matic.json';
import shibArtifact from './contracts/Shib.sol/Shib.json';
import usdtArtifact from './contracts/Usdt.sol/Usdt.json';

function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [bankContract, setBankContract] = useState(undefined);
  const [tokenContracts, setTokenContracts] = useState({});
  const [tokenBalances, setTokenBalances] = useState({});
  const [tokenSymbols, setTokenSymbols] = useState([]);

  const [amount, setAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(undefined);
  const [isDeposit, setIsDeposit] = useState(true);

  const toBytes32 = text => ( ethers.utils.formatBytes32String(text) );
  const toString = bytes32 => ( ethers.utils.parseBytes32String(bytes32) );
  const toWei = ether => ( ethers.utils.parseEther(ether) );
  const toEther = wei => ( ethers.utils.formatEther(wei).toString() );
  const toRound = num => ( Number(num).toFixed(2) );

  useEffect(() => {
    const bankAddress = "0x2ED2BD2832573432ca508347aD4636fFb17f0301";
    const init = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const bankContract = await new ethers.Contract(bankAddress, bankArtifact.abi)
      setBankContract(bankContract)

      bankContract.connect(provider).getWhitelistedSymbols()
        .then((result) => {
          const symbols = result.map(s => toString(s))
          setTokenSymbols(symbols);
         getTokenContracts(symbols, bankContract, provider);

        })

    }
    init();
  },[]);

  const getTokenContract = async (symbol, bankContract, provider) => {
    const address = await bankContract.connect(provider).getWhitelistedTokenAddress( toBytes32(symbol) )
    const abi = symbol === 'Matic' ? maticArtifact.abi : (symbol === 'Shib' ? shibArtifact.abi : usdtArtifact.abi)
    const tokenContract = await new ethers.Contract(address, abi)
    return tokenContract;
  }

  const getTokenContracts = async (symbols, bankContract, provider) => {
    symbols.map(async symbol => {
      const contract = await getTokenContract(symbol, bankContract, provider)
      setTokenContracts(prev => ({...prev, [symbol]:contract}))
    })
  }

  const isConnected = () => (signer !== undefined)

  const getSigner = async provider => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    signer.getAddress()
      .then(address => {
        setSignerAddress(address)
      })

    return signer
  }

  const connect = () => {
    getSigner(provider)
      .then(signer => {
        setSigner(signer)
        getTokenBalances(signer)
      })
  }

  const getTokenBalance = async (symbol, signer) => {
    const balance = await bankContract.connect(signer).getTokenBalance( toBytes32(symbol) )
    return toEther(balance)
  }

  const getTokenBalances = (signer) => {
    tokenSymbols.map(async symbol => {
      const balance = await getTokenBalance(symbol, signer)
      setTokenBalances(prev => ({...prev, [symbol]: balance.toString()}))
    })
  }

  const displayModal = (symbol) => {
    setSelectedSymbol(symbol)
    setShowModal(true)
  }

  const depositTokens = (wei, symbol) => {
    if (symbol === 'Eth') {
      signer.sendTransaction({
        to: bankContract.address,
        value: wei
      })
    } else {
      const tokenContract = tokenContracts[ symbol ]
      tokenContract.connect(signer).approve(bankContract.address, wei)
        .then(() => {
          bankContract.connect(signer).depositTokens(wei, toBytes32(symbol));
        })
    }
  }

  const withdrawTokens = (wei, symbol) => {
    if (symbol === 'Eth') {
      bankContract.connect(signer).withdrawEth(wei)
    } else {
      bankContract.connect(signer).withdrawTokens(wei, toBytes32(symbol));
    }
  }

  const depositOrWithdraw = (e, symbol) => {
    e.preventDefault();
    const wei = toWei(amount)

    if(isDeposit) {
      depositTokens(wei, symbol)
    } else {
      withdrawTokens(wei, symbol)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        {isConnected() ? (
          <div>
            <p>
              Welcome {signerAddress?.substring(0,10)}...
            </p>
            <div>
              <div className="list-group">
                <div className="list-group-item">
                  {Object.keys(tokenBalances).map((symbol, idx) => (
                    <div className=" row d-flex py-3" key={idx}>

                      <div className="col-md-3">
                        <div>{symbol.toUpperCase()}</div>
                      </div>

                      <div className="d-flex gap-4 col-md-3">
                        <small className="opacity-50 text-nowrap">{toRound(tokenBalances[symbol])}</small>
                      </div>

                      <div className="d-flex gap-4 col-md-6">
                        <button onClick={ () => displayModal(symbol) } className="btn btn-primary">Deposit/Withdraw</button>
                        <Modal
                          show={showModal}
                          onClose={() => setShowModal(false)}
                          symbol={selectedSymbol}
                          depositOrWithdraw={depositOrWithdraw}
                          isDeposit={isDeposit}
                          setIsDeposit={setIsDeposit}
                          setAmount={setAmount}
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div>
            <p>
              You are not connected
            </p>
            <button onClick={connect} className="btn btn-primary">Connect Metamask</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;