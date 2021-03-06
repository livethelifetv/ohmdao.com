import { ethers } from "ethers"; // Ethers handler
import Web3Modal from "web3modal"; // Web3Modal
import { useState, useEffect } from "react"; // React state
import { createContainer } from "unstated-next"; // State provider setup
import WalletConnectProvider from "@walletconnect/web3-provider"; // WalletConnect provider

const providerOptions = {
  walletconnect: {
    // Inject WalletConnectProvider
    package: WalletConnectProvider,
    options: {
      // Fallback Infura ID
      infuraId: process.env.NEXT_PUBLIC_INFURA_RPC,
    },
  },
};

function useChain() {
  const [address, setAddress] = useState(null); // User address
  const [provider, setProvider] = useState(null); // Ethers provider
  const [web3Modal, setWeb3Modal] = useState(null); // Web3 modal

  /**
   * Unlock wallet, store ethers provider and address
   */
  const unlock = async () => {
    // Initiate WalletConnect
    const walletConnectProvider = await web3Modal.connect();
    await walletConnectProvider.enable();

    // Create new Ethers Web3Provider
    const provider = new ethers.providers.Web3Provider(walletConnectProvider);
    const signer = await provider.getSigner();

    // Collect primary account
    const address = await signer.getAddress();

    // Store account, and web3 instance
    setProvider(provider);
    setAddress(address);
  };

  /**
   * Lock wallet, remove ethers instance
   */
  const lock = async () => {
    // If provider is present
    if (provider && provider.provider && provider.provider.close) {
      // Close provider
      await provider.provider.close();
    }

    // Nullify signer instance
    setProvider(null);
    setAddress("");
  };

  /**
   * Setup Web3Modal on page load (requires window)
   */
  const initialSetupWeb3Modal = async () => {
    // Create new web3Modal
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      providerOptions,
    });

    // Set web3Modal globally in context
    setWeb3Modal(web3Modal);
  };

  // On load, configure Web3Modal
  useEffect(initialSetupWeb3Modal, []);

  return {
    provider,
    address,
    lock,
    unlock,
  };
}

// Setup chain state provider
const chain = createContainer(useChain);
export default chain;
