import dayjs from "dayjs"; // Date/time rendering
import stake from "@store/stake"; // Stake global state
import chain from "@store/chain"; // Chain global state
import { useState } from "react"; // React state management
import Card from "@components/Card"; // Component: card
import Layout from "@components/Layout"; // Component: layout wrapper
import Breadcrumb from "@components/Breadcrumb"; // Component: breadcrumb header
import relativeTime from "dayjs/plugin/relativeTime"; // Dayjs expansion for relative time
import styles from "@styles/pages/Stake.module.scss"; // Component styles
import PercentageSelect from "@components/PercentageSelect"; // Component: percentage selection

// Extend DayJS
dayjs.extend(relativeTime);

export default function Stake() {
	const stakeMethods = stake.useContainer();

	return (
		<Layout>
			<div className={styles.ohm__stake}>
				<Breadcrumb
					header="Statistics"
					text="High-level overview of the Olympus DAO staking mechanism."
				/>
				<StakeStatistics stake={stakeMethods} />
				<Breadcrumb header="Stake" text="Stake OHM or unstake your sOHM." />
				<StakeUtility stake={stakeMethods} />
			</div>
		</Layout>
	);
}

function StakeStatistics({ stake }) {
	const {
		price,
		balance,
		staked,
		timeToRebase,
		UpcomingRebaseReward,
		fiveDayRate,
		currentAPY,
		currentIndex,
	} = stake;
	const formatPercentage = (percentage) => {
		return percentage
			? percentage.toLocaleString("us-en", { minimumFractionDigits: 3 }) + "%"
			: "Loading...";
	};

	const formatBalance = (balance, price) => {
		return balance && price
			? `${parseFloat(balance).toLocaleString("us-en", {
					minimumFractionDigits: 3,
			  })} ($${(balance * price).toLocaleString("us-en", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  })})`
			: balance.toLocaleString("us-en", { minimumFractionDigits: 3 });
	};

	const capitalize = (s) => {
		if (typeof s !== "string") return "";
		return s.charAt(0).toUpperCase() + s.slice(1);
	};

	return (
		<div className={styles.ohm__stake_balances}>
			<Card title="OHM Balance" highlight>
				<h3>{formatBalance(balance, price)}</h3>
			</Card>
			<Card title="Staked OHM Balance" highlight>
				<h3>{formatBalance(staked, price)}</h3>
			</Card>
			<Card title="OHM Price">
				<h3>
					{price
						? "$" + price.toLocaleString("us-en", { minimumFractionDigits: 2 })
						: "Loading..."}
				</h3>
			</Card>
			<Card title="Time to Rebase">
				<h3>
					{!timeToRebase
						? "Loading..."
						: capitalize(
								dayjs(
									new Date().getTime() + parseFloat(timeToRebase) * 1000
								).fromNow()
						  )}
				</h3>
			</Card>
			<Card title="Upcoming Rebase">
				<h3>{formatPercentage(UpcomingRebaseReward)}</h3>
			</Card>
			<Card title="5D Reward Rate">
				<h3>{formatPercentage(fiveDayRate)}</h3>
			</Card>
			<Card title="APY">
				<h3>{formatPercentage(currentAPY)}</h3>
			</Card>
			<Card title="Current Index">
				<h3>{currentIndex ? currentIndex.toFixed(3) : "Loading..."}</h3>
			</Card>
		</div>
	);
}

function StakeUtility({ stake }) {
	const { address, unlock } = chain.useContainer();
	const {
		balance,
		ohmApproval,
		stakeOHM,
		staked,
		sohmApproval,
		unstakeOHM,
		approveStakingContract,
	} = stake;

	const [toStake, setToStake] = useState(0);
	const [toStakeLoading, setToStakeLoading] = useState(false);

	const [toUnstake, setToUnstake] = useState(0);
	const [toUnstakeLoading, setToUnstakeLoading] = useState(false);

	const [lockLoading, setLockLoading] = useState(false);

	const unlockWithLoading = async () => {
		setLockLoading(true);
		await unlock();
		setLockLoading(false);
	};

	const stakeWithLoading = async () => {
		setToStakeLoading(true);

		try {
			await stakeOHM(toStake);
		} catch (error) {
			console.log(`Error when staking: ${error}`);
		}

		setToStakeLoading(false);
	};

	const unstakeWithLoading = async () => {
		setToUnstakeLoading(true);

		try {
			await unstakeOHM(toUnstake);
		} catch (error) {
			console.log(`Error when unstaking: ${error}`);
		}

		setToUnstakeLoading(false);
	};

	const approveWithLoading = async (ohm) => {
		ohm ? setToStakeLoading(true) : setToUnstakeLoading(true);

		try {
			await approveStakingContract(ohm);
		} catch (error) {
			console.log(`Error when approving: ${error}`);
		}

		ohm ? setToStakeLoading(false) : setToUnstakeLoading(false);
	};

	const renderButton = (stake) => {
		if (stake ? toStakeLoading : toUnstakeLoading) {
			return <button disabled={true}>Loading...</button>;
		} else if (!address) {
			return (
				<button onClick={unlockWithLoading} disabled={lockLoading}>
					{lockLoading ? "Connecting..." : "Connect Wallet"}
				</button>
			);
		} else if (
			stake
				? !ohmApproval || ohmApproval === "0"
				: !sohmApproval || sohmApproval === "0"
		) {
			return (
				<button onClick={() => approveWithLoading(stake ? true : false)}>
					Approve spending {stake ? "OHM" : "sOHM"}
				</button>
			);
		} else if (
			stake
				? !toStake || parseFloat(toStake) === 0
				: !toUnstake || parseFloat(toUnstake) === 0
		) {
			return (
				<button disabled={true}>
					Cannot {stake ? "stake" : "unstake"} nothing
				</button>
			);
		} else if (
			stake
				? parseFloat(toStake) > parseFloat(balance)
				: parseFloat(toUnstake) > parseFloat(staked)
		) {
			return <button disabled={true}>Insufficient balance</button>;
		} else if (
			stake
				? parseFloat(toStake) <= parseFloat(balance)
				: parseFloat(toUnstake) <= parseFloat(staked)
		) {
			return (
				<button
					onClick={stake ? stakeWithLoading : unstakeWithLoading}
					disabled={stake ? toStakeLoading : toUnstakeLoading}
				>
					{stake
						? `Stake ~${parseFloat(toStake).toFixed(3)} OHM`
						: `Unstake ~${parseFloat(toUnstake).toFixed(3)} sOHM`}
				</button>
			);
		}
	};

	return (
		<div className={styles.ohm__stake_utility}>
			<Card title="Stake OHM">
				<p>
					Staking OHM deposits your OHM to the Olympus DAO staking contract,
					where it accrues rewards every epoch.
				</p>
				<input
					type="number"
					placeholder="OHM to Stake"
					value={toStake}
					onChange={(e) => setToStake(e.target.value)}
					disabled={!address || toStakeLoading}
					max={parseFloat(balance)}
				/>
				<PercentageSelect
					max={balance}
					setter={setToStake}
					disabled={!address}
				/>
				{renderButton(true)}
			</Card>
			<Card title="Unstake sOHM">
				<p>
					Unstaking your sOHM from the Olympus DAO staking contract redeems it
					for OHM. You lose the last epochs reward in doing so.
				</p>
				<input
					type="number"
					placeholder="sOHM to Unstake"
					value={toUnstake}
					onChange={(e) => setToUnstake(e.target.value)}
					disabled={!address || toUnstakeLoading}
					max={parseFloat(staked)}
				/>
				<PercentageSelect
					max={staked}
					setter={setToUnstake}
					disabled={!address}
				/>
				{renderButton(false)}
			</Card>
		</div>
	);
}
