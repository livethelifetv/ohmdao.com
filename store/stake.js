import axios from "axios"; // Axios for requests
import { ethers } from "ethers"; // Ethers handler
import chain from "@store/chain"; // Chain state provider
import { useState, useEffect } from "react"; // React state management
import { createContainer } from "unstated-next"; // Global state provider
import { abi as erc20ABI } from "@studydefi/money-legos/erc20"; // ABI: ERC20
import { abi as stakingABI } from "@constants/abi/OlympusStaking"; // ABI: Olympus Staking Contract

function useStake() {
  // Chain provider
  const { address, provider } = chain.useContainer();

  // Wallet specific retrieval
  const [balance, setBalance] = useState(0);
  const [staked, setStaked] = useState(0);
  const [ohmApproval, setOhmApproval] = useState(null);
  const [sohmApproval, setSohmApproval] = useState(null);

  // Contracts
  const [ohmContract, setOhmContract] = useState(null);
  const [sohmContract, setSohmContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);

  // General (unauthenticated) statistics
  const [price, setPrice] = useState(null);
  const [marketCap, setMarketCap] = useState(null);
  const [circulatingSupply, setCirculatingSupply] = useState(null);
  const [timeToRebase, setTimeToRebase] = useState(null);
  const [UpcomingRebaseReward, setUpcomingRebaseReward] = useState(null);
  const [fiveDayRate, setFiveDayRate] = useState(null);
  const [currentAPY, setCurrentAPY] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);

  /**
   * Collect statistics that require authentication
   */
  const collectUserSpecificStatistics = async () => {
    // Collect signer from Ethers provider
    const signer = await provider.getSigner();

    // Setup token(ohm) contract
    const ohmContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_OHM_TOKEN,
      erc20ABI,
      signer
    );
    setOhmContract(ohmContract);

    // Setup token(sOhm) contract
    const sohmContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_SOHM_TOKEN,
      erc20ABI,
      signer
    );
    setSohmContract(sohmContract);

    // Setup Olympus Staking contract
    const stakingContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_STAKING_ADDRESS,
      stakingABI,
      signer
    );
    setStakingContract(stakingContract);

    // Collect OHM + sOHM balance
    const ohmBalance = await ohmContract.balanceOf(address);
    const sOhmBalance = await sohmContract.balanceOf(address);

    // Format OHM + sOHM balance for rendering
    const ohmBalanceFormatted = ethers.utils.formatUnits(ohmBalance, 9);
    const sOhmBalanceFormatted = ethers.utils.formatUnits(sOhmBalance, 9);

    // Store balances
    setBalance(ohmBalanceFormatted);
    setStaked(sOhmBalanceFormatted);

    // Collect OHM + sOHM approvals to Olympus Staking contract
    const ohmApproval = await ohmContract.allowance(
      address,
      process.env.NEXT_PUBLIC_STAKING_ADDRESS
    );
    const sOhmApproval = await sohmContract.allowance(
      address,
      process.env.NEXT_PUBLIC_STAKING_ADDRESS
    );

    // Set string(approvals) to Olympus Staking contract
    setOhmApproval(ohmApproval.toString());
    setSohmApproval(sOhmApproval.toString());
  };

  /**
   * Infinite approve OHM or sOHM to be spent by Olympus Staking contract
   * @param {Boolean} ohm approving for OHM (or false for sOHM)
   */
  const approveStakingContract = async (ohm) => {
    let tx;
    if (ohm) {
      tx = await ohmContract.approve(
        process.env.NEXT_PUBLIC_STAKING_ADDRESS,
        ethers.constants.MaxUint256
      );
    } else {
      tx = await sohmContract.approve(
        process.env.NEXT_PUBLIC_STAKING_ADDRESS,
        ethers.constants.MaxUint256
      );
    }

    // Wait for a confirmation
    await tx.wait(1);

    // Collect user specific statistics again
    await collectUserSpecificStatistics();
  };

  /**
   * Stake OHM in Olympus Staking contract
   * @param {Number} amount of OHM to stake
   */
  const stakeOHM = async (amount) => {
    // Stake OHM via contract
    const amountWei = ethers.utils.parseUnits(amount.toString(), 9);
    const tx = await stakingContract.stakeOHM(amountWei);

    // Wait for a confirmation
    await tx.wait(1);

    // Collect user specific statistics again
    await collectUserSpecificStatistics();
  };

  /**
   * Unstake sOHM in Olympus Staking contract
   * @param {Number} amount of sOHM to unstake
   */
  const unstakeOHM = async (amount) => {
    // Unstake sOHM via contract
    const amountWei = ethers.utils.parseUnits(amount.toString(), 9);
    const tx = await stakingContract.unstakeOHM(amountWei);

    // Wait for a confirmation
    await tx.wait(1);

    // Collect user specific statistics again
    await collectUserSpecificStatistics();
  };

  /**
   * Collect general (unauthenticated) statistics
   */
  const collectGeneralStatistics = async () => {
    // Collect from stats endpoint
    const response = await axios.get("/api/stake");

    // Destructure statistics from response
    const {
      price,
      marketCap,
      circulatingSupply,
      timeUntilRebase,
      upcomingRebase,
      fiveDayRate,
      stakingAPY,
      index,
    } = response.data;

    // Update statistics via state mutaters
    setPrice(price);
    setMarketCap(marketCap);
    setCirculatingSupply(circulatingSupply);
    setTimeToRebase(timeUntilRebase);
    setUpcomingRebaseReward(upcomingRebase);
    setFiveDayRate(fiveDayRate);
    setCurrentAPY(stakingAPY);
    setCurrentIndex(index);
  };

  /**
   * Collects statistics if user is authenticated (change in address or provider)
   */
  const collectUserSpecificStatisticsEffect = async () => {
    // If user is authenticated
    if (address && provider && provider.provider) {
      // Collect user specific statistics
      collectUserSpecificStatistics();
    } else {
      // Else, nullify user specific statistics (post-unauthenticate)
      setBalance(0);
      setStaked(0);
    }
  };

  // Collect general statistics on page load
  useEffect(collectGeneralStatistics, []);
  // Collect user specific statistics on [address, provider] change
  useEffect(collectUserSpecificStatisticsEffect, [address, provider]);

  return {
    price,
    marketCap,
    circulatingSupply,
    balance,
    ohmApproval,
    staked,
    sohmApproval,
    timeToRebase,
    UpcomingRebaseReward,
    fiveDayRate,
    currentAPY,
    currentIndex,
    approveStakingContract,
    stakeOHM,
    unstakeOHM,
  };
}

// Setup stake global provider
const stake = createContainer(useStake);
export default stake;
