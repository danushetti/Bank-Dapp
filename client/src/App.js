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
  //const toString = bytes32 => ( ethers.utils.parseBytes32String(bytes32) );
  const toWei = ether => ( ethers.utils.parseEther(ether) );
  const toEther = wei => ( ethers.utils.formatEther(wei).toString() );
  const toRound = num => ( Number(num).toFixed(2) );

  useEffect(() => {
    const init = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const bankContract = await new ethers.Contract("0x2ED2BD2832573432ca508347aD4636fFb17f0301", bankArtifact.abi)
      setBankContract(bankContract)

      const maticContract = await new ethers.Contract("0x6fa805874201c5F77C7e07AcA0f4B1fAa2bA21Df", maticArtifact.abi)
      const shibContract = await new ethers.Contract("0xb81071D1ED34dB03C3E821a278184C2368e8c6b0", shibArtifact.abi)
      const usdtContract = await new ethers.Contract("0x72e66e54c569B06827bF86417AE9C9D7a5B997B4", usdtArtifact.abi)
      setTokenContracts({maticContract,shibContract,usdtContract})
      setTokenSymbols(["Eth","Matic","Shib","Usdt"])
    }
    init();
  }, [])

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
          <h2> Welcome, you can deposit and withdraw your tokens over here</h2>
            <p>
              You are connected to account : {signerAddress?.substring(0,10)}...
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