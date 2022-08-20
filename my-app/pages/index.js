import { Contract, ethers, utils } from 'ethers';
import Web3Modal from 'web3modal';
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { abi, NFT_CONTRACT_ADDRESS } from './constants';
import styles from '../styles/Home.module.css'

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokensIdsMinted, setTokensIdsMinted] = useState("0");
  const web3ModalRef = useRef()

  const getProviderOrSigner = async (isSigner = false) => {
    try {
      const instance = await web3ModalRef.current.connect()
      const provider = new ethers.providers.Web3Provider(instance)

      const { chainId } = await provider.getNetwork();
      if (chainId !== 4) {
        window.alert("Change the network to Rinkeby")
        throw new Error("Change the network to Rinkeby")
      }

      if(isSigner){
        const signer = provider.getSigner();
        return signer;
      }

      return provider;

    } catch (error) {
      console.error(e)
    }
  }

  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const cryptoDevContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const tx = await cryptoDevContract.mintPresale({
        value: utils.parseEther("0.01"),
      })
      setIsLoading(true);
      await tx.wait()
      setIsLoading(false)
      window.alert("You successfully minted a Crypto Dev")

    } catch (error) {
      console.error(error)
    }
  }

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const cryptoDevContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const tx = await cryptoDevContract.mint({
        value: utils.parseEther("0.01")
      })
      setIsLoading(true)
      await tx.wait()
      setIsLoading(false)
      window.alert("You successfully minted a Crypto Dev!")

    } catch (error) {
      console.error(error)
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true)
    } catch (error) {
      console.error(error)
    }
  }

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const cryptoDevContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      )
      const tx = await cryptoDevContract.startPresale()
      setIsLoading(true)
      await tx.wait()
      setIsLoading(false)
      await checkIfPresaleStarted()

    } catch (error) {
      console.error(error)
    }
  }

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner()
      const cryptoDevContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      )
      const _presaleStarted = await cryptoDevContract.presaleStarted()
      if (!presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted)
      return _presaleStarted
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const checkIfPresaleEnd = async () => {
    try {
      const provider = await getProviderOrSigner()
      const cryptoDevContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      )
      const _presaleEndTime = await cryptoDevContract.presaleEnd()
      const hasEnded =_presaleEndTime.lt(Math.floor(Date.now()/1000))
      if (hasEnded) {
        setPresaleEnded(true)
      } else {
        setPresaleEnded(false)
      }
      return hasEnded
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner()
      const cryptoDevContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      )

      const _owner = await cryptoDevContract.owner()
      const signer = await getProviderOrSigner(true)
      const address = await signer.getAddress()
      if(address.toLowerCase() === _owner.toLowerCase()){
        setIsOwner(true)
      }

    } catch (error) {
      console.error(error)
    }
  }

  const getTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner()
      const cryptoDevContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      )
      const _tokensMinted = await cryptoDevContract.tokensIds()
      setTokensIdsMinted(_tokensMinted.toString())

    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'rinkeby',
        providerOptions: {},
        disableInjectedProvider: false,
      })
      connectWallet()

      const _presaleStarted = checkIfPresaleStarted()
      if (_presaleStarted) {
        checkIfPresaleEnd()
      } 

      getTokensMinted()

      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted()
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnd()
          if(_presaleEnded) {
            clearInterval(presaleEndedInterval)
          }
        }
      }, 5 * 1000);

      setInterval(async function () {
        await getTokensMinted();
      }, 5 * 1000)
    }
  }, [walletConnected])

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    }

    if (isLoading) {
      return <button className={styles.button}>Loading...</button>
    }

    if (isOwner && !presaleStarted) {
      return (
        <button onClick={startPresale} className={styles.button}>
          Start Presale!
        </button>
      )
    }

    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      )
    }

    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      )
    }

    if(presaleStarted && presaleEnded){
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      )
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Crypto Devs NFT</title>
        <meta name="description" content="Amazing Crypto Devs NFTs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokensIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img
            className={styles.image} 
            alt='Crypto devs NFT image'
            src="/cryptodevs/0.svg"
          />
        </div>
      </div>
    </div>
  )
}
