import axios from "axios";
import { ethers } from "ethers";
import { abi as sOHMABI } from "@constants/abi/sOHM";
import { abi as stakingABI } from "@constants/abi/OlympusStaking";

const EPOCH_INTERVAL = 2200;
const BLOCK_RATE_SECONDS = 13.14;

// Setup provider
const provider = new ethers.providers.InfuraProvider(
	"mainnet",
	process.env.NEXT_PUBLIC_INFURA_RPC
);

// Setup token(sOhm) contract
const sohmContract = new ethers.Contract(
	process.env.NEXT_PUBLIC_SOHM_TOKEN,
	sOHMABI,
	provider
);

// Setup staking contract
const stakingContract = new ethers.Contract(
	process.env.NEXT_PUBLIC_STAKING_ADDRESS,
	stakingABI,
	provider
);

const calculateSecondsUntilRebase = async () => {
	const height = await provider.getBlockNumber();

	if (height % EPOCH_INTERVAL === 0) {
		return 0;
	}

	const next = height + EPOCH_INTERVAL - (height % EPOCH_INTERVAL);
	const blocksAway = next - height;
	const secondsAway = blocksAway * BLOCK_RATE_SECONDS;

	return secondsAway;
};

export default async (req, res) => {
	const response = await axios.get(
		"https://api.coingecko.com/api/v3/coins/olympus"
	);
	const price = response.data.market_data.current_price.usd;
	const marketCap = response.data.market_data.market_cap.usd;
	const circulatingSupply = await sohmContract.circulatingSupply();
	const circulatingSupplyFormatted = ethers.utils.formatUnits(
		circulatingSupply,
		9
	);

	// Collect stakingRebase
	const stakingReward = await stakingContract.ohmToDistributeNextEpoch();
	const stakingRebase = stakingReward / circulatingSupply;

	// Collect APY statistics
	const upcomingRebase = stakingRebase * 100;
	const fiveDayRate = (Math.pow(1 + stakingRebase, 5 * 3) - 1) * 100;
	const stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) * 100;

	// Collect current index
	const currentIndex = await sohmContract.balanceOf(
		process.env.NEXT_PUBLIC_SOHM_INDEX_ADDRESS
	);
	const currentIndexFormatted = parseFloat(
		ethers.utils.formatUnits(currentIndex, 9)
	);

	res.send({
		price,
		marketCap,
		circulatingSupply: circulatingSupplyFormatted,
		timeUntilRebase: await calculateSecondsUntilRebase(),
		upcomingRebase,
		fiveDayRate,
		stakingAPY,
		index: currentIndexFormatted,
	});
};
