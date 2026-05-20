"use client";

import { vestingAbi } from "../contracts/vestingAbi";

import { VESTING_CONTRACT }
from "../contracts/constants";

import { useState, useEffect } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";

import {
  useAccount,
  useWriteContract,
  useReadContract,
} from "wagmi";

import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

import {
  STAKING_CONTRACT,
  TOKEN_CONTRACT,
} from "../contracts/constants";

import { stakingAbi } from "../contracts/stakingAbi";
import { tokenAbi } from "../contracts/tokenAbi";

  const publicClient = createPublicClient({
    chain: base,
    transport: http("https://base-mainnet.g.alchemy.com/v2/D8VsZrtnXxPm5EB9vWnXl"),
  });

  

export default function Home() {

  const { address, isConnected } = useAccount();

  const [amount, setAmount] = useState("");
  const [mounted, setMounted] = useState(false);

  const [lockPeriod, setLockPeriod] = useState("0");

  const [allStakes, setAllStakes] = useState<any[]>([]);
  const [totalStakedAmount, setTotalStakedAmount] = useState(0);
  const [totalPendingRewards, setTotalPendingRewards] = useState(0);
  const [globalTotalStaked, setGlobalTotalStaked] = useState(0);
  const [allVestings, setAllVestings] = useState<any[]>([]);
  const [totalClaimableVesting, setTotalClaimableVesting] = useState(0);

  const { writeContract } = useWriteContract();
  const { data: futfxBalance } = useReadContract({
    address: TOKEN_CONTRACT,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: stakeCount } = useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingAbi,
    functionName: "getStakeCount",
    args: address ? [address] : undefined,
  });

  const { data: globalTotalStakedData } = useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingAbi,
    functionName: "totalStaked",
  });

  const { data: stakingCapData } = useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingAbi,
    functionName: "maxTotalStaked",
  });

  const { data: totalRewardsClaimedData } = useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingAbi,
    functionName: "totalRewardsClaimed",
  });

   useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {

    const loadStakes = async () => {

      if (!address || !stakeCount) return;

      try {

        const stakesArray = [];
        let totalStaked = 0;
        let totalRewards = 0;

        for (let i = 0; i < Number(stakeCount); i++) {

          const stake = await publicClient.readContract({
            address: STAKING_CONTRACT,
            abi: stakingAbi,
            functionName: "getStake",
            args: [address, BigInt(i)],
          });
          console.log("STAKE DATA:", stake);

          const reward = await publicClient.readContract({
            address: STAKING_CONTRACT,
            abi: stakingAbi,
            functionName: "pendingReward",
            args: [address, BigInt(i)],
          });

          if (!(stake as any).withdrawn) {

            stakesArray.push({
              amount: Number((stake as any).amount) / 1e18,
              startTime: Number((stake as any).startTime),
              lockDuration: Number((stake as any).lockDuration),
              apy: Number((stake as any).apy),
              lastClaimTime: Number((stake as any).lastClaimTime),
              claimedRewards: Number((stake as any).claimedRewards) / 1e18,
              withdrawn: (stake as any).withdrawn,
              pendingReward: Number(reward) / 1e18,
              stakeId: i,
            });

            totalStaked += Number((stake as any).amount);
            totalRewards += Number(reward);

          }

        }

        setAllStakes(stakesArray);
        setTotalStakedAmount(totalStaked / 1e18);
        setTotalPendingRewards(totalRewards / 1e18);
        setGlobalTotalStaked(totalStaked / 1e18);

      } catch (err) {

        console.error("LOAD STAKES ERROR:", err);

      }

    };

    const loadVestings = async () => {

      if (!address) return;

      try {

        const vestingIds = await publicClient.readContract({
          address: VESTING_CONTRACT,
          abi: vestingAbi,
          functionName: "getMemberVestings",
          args: [address],
        });

        const vestingsArray = [];

        let totalClaimable = 0;

        for (const vestingId of vestingIds as bigint[]) {

          const vesting = await publicClient.readContract({
            address: VESTING_CONTRACT,
            abi: vestingAbi,
            functionName: "getVesting",
            args: [vestingId],
          });

          const claimableAmount = await publicClient.readContract({
            address: VESTING_CONTRACT,
            abi: vestingAbi,
            functionName: "claimable",
            args: [vestingId],
          });

          vestingsArray.push({
            vestingId: Number(vestingId),
            beneficiary: (vesting as any).beneficiary,
            totalAmount:
              Number((vesting as any).totalAmount) / 1e18,
            claimedAmount:
              Number((vesting as any).claimedAmount) / 1e18,
            claimableAmount:
              Number(claimableAmount) / 1e18,
            startTime:
              Number((vesting as any).startTime),
            paused:
              (vesting as any).paused,
            forfeited:
              (vesting as any).forfeited,
            sourceId:
              (vesting as any).sourceId,
          });

          totalClaimable += Number(claimableAmount);

        }

        setAllVestings(vestingsArray);

        setTotalClaimableVesting(
          totalClaimable / 1e18
        );

      } catch (err) {

        console.error(
          "LOAD VESTINGS ERROR:",
          err
        );

      }

    };

    loadStakes();

    loadVestings();

  }, [address, stakeCount]);
  

  


  
    
  const handleApprove = async () => {

    const parsedAmount = BigInt(Number(amount) * 1e18);

    writeContract({
      address: TOKEN_CONTRACT,
      abi: tokenAbi,
      functionName: "approve",
      args: [STAKING_CONTRACT, parsedAmount],
    });

  };

  const handleStake = async () => {

    const parsedAmount = BigInt(Number(amount) * 1e18);

    writeContract({
      address: STAKING_CONTRACT,
      abi: stakingAbi,
      functionName: "stake",
      args: [parsedAmount, BigInt(lockPeriod)],
    });

  };

  const handleClaim = async () => {

    for (const stake of allStakes) {

      if (stake.pendingReward > 0) {

        writeContract({
          address: STAKING_CONTRACT,
          abi: stakingAbi,
          functionName: "claim",
          args: [BigInt(stake.stakeId)],
        });

      }

    }

  };

  const handleVestingClaim = async (
    vestingId: number
  ) => {

    writeContract({
      address: VESTING_CONTRACT,
      abi: vestingAbi,
      functionName: "claim",
      args: [BigInt(vestingId)],
    });

  };

  const handleUnstake = async (
    stakeId: number
  ) => {

    writeContract({
      address: STAKING_CONTRACT,
      abi: stakingAbi,
      functionName: "unstake",
      args: [BigInt(stakeId)],
    });

  };

  const realGlobalTotalStaked =
    globalTotalStakedData
      ? Number(globalTotalStakedData) / 1e18
      : 0;

  const realStakingCap =
    stakingCapData
      ? Number(stakingCapData) / 1e18
      : 0;

  const totalRewardsClaimed =
    totalRewardsClaimedData
      ? Number(totalRewardsClaimedData) / 1e18
      : 0;

  const remainingCapacity =
    realStakingCap - realGlobalTotalStaked;

  const utilizationPercent =
    realStakingCap > 0
      ? (realGlobalTotalStaked / realStakingCap) * 100
      : 0;

  if (!mounted) {
    return null;
  } 
  return (
    <main className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}

      <div className="max-w-7xl mx-auto mb-10">

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          <div>
            <h1 className="text-5xl font-bold text-blue-500 mb-2">
              FutureFX Staking
            </h1>

            <p className="text-gray-400 text-lg">
              Stake FUTFX and earn passive rewards on Base Network
            </p>
          </div>

          <ConnectButton />

        </div>

      </div>

      {/* DASHBOARD */}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {/* WALLET */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            Wallet Status
          </p>

          <h2 className="text-2xl font-bold">
            {isConnected ? "Connected" : "Disconnected"}
          </h2>

          {isConnected && (
            <p className="text-xs text-gray-500 mt-4 break-all">
              {address}
            </p>
          )}

        </div>

        {/* FUTFX BALANCE */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            FUTFX Balance
          </p>

          <h2 className="text-2xl font-bold text-blue-400">
            {futfxBalance
              ? (Number(futfxBalance) / 1e18).toLocaleString()
              : "0"} FUTFX
          </h2>

        </div>

        {/* TOTAL STAKED */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            Total Staked
          </p>

          <h2 className="text-2xl font-bold text-green-400">
            {totalStakedAmount.toLocaleString()} FUTFX
          </h2>

        </div>

        {/* CLAIMABLE REWARDS */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            Claimable Rewards
          </p>

          <h2 className="text-2xl font-bold text-yellow-400">
            {totalPendingRewards.toFixed(6)} FUTFX
          </h2>

        </div>

      </div>

      {/* GLOBAL STATS */}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            Platform Total Staked
          </p>

          <h2 className="text-3xl font-bold text-blue-400">
            {realGlobalTotalStaked.toLocaleString()} FUTFX
          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            Remaining Capacity
          </p>

          <h2 className="text-3xl font-bold text-green-400">
            {remainingCapacity.toLocaleString()} FUTFX
          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            Staking Utilization
          </p>

          <h2 className="text-3xl font-bold text-yellow-400">
            {utilizationPercent.toFixed(2)}%
          </h2>

          <div className="w-full bg-zinc-800 rounded-full h-3 mt-4 overflow-hidden">

            <div
              className="bg-yellow-400 h-3 rounded-full"
              style={{
                width: `${utilizationPercent}%`,
              }}
            />

          </div>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            Rewards Distributed
          </p>

          <h2 className="text-3xl font-bold text-purple-400">
            {totalRewardsClaimed.toLocaleString()} FUTFX
          </h2>

        </div>

      </div>

      {/* MAIN CONTENT */}

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* STAKING PANEL */}

        <div className="xl:col-span-1 bg-zinc-900 border border-blue-500 rounded-3xl p-8">

          <h2 className="text-3xl font-bold mb-8">
            Stake FUTFX
          </h2>

          {/* AMOUNT */}

          <div className="mb-6">

            <label className="block text-gray-400 mb-2">
              Amount
            </label>

            <input
              type="number"
              placeholder="Enter FUTFX amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700"
            />

          </div>

          {/* LOCK PERIOD */}

          <div className="mb-8">

            <label className="block text-gray-400 mb-2">
              Lock Period
            </label>

            <select
              value={lockPeriod}
              onChange={(e) => setLockPeriod(e.target.value)}
              className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700"
            >
              <option value="0">
                No Lock — 5% APR
              </option>

              <option value="7776000">
                3 Months — 8% APR
              </option>

              <option value="15552000">
                6 Months — 15% APR
              </option>

              <option value="31536000">
                12 Months — 25% APR
              </option>

              <option value="63072000">
                24 Months — 40% APR
              </option>

            </select>

          </div>

          {/* BUTTONS */}

          <div className="flex flex-col gap-4">

            <button
              onClick={handleApprove}
              className="w-full bg-yellow-500 hover:bg-yellow-600 transition rounded-xl py-4 text-lg font-bold"
            >
              Approve FUTFX
            </button>

            <button
              onClick={handleStake}
              className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-4 text-lg font-bold"
            >
              Stake Tokens
            </button>

          </div>

        </div>

        {/* ACTIVE STAKES */}

        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                Active Stakes
              </h2>

              <p className="text-gray-500 mt-2">
                Manage your active FutureFX staking positions
              </p>

            </div>

            <div className="flex items-center gap-4">

              <button
                onClick={handleClaim}
                className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-xl font-bold text-white"
              >
                Claim Rewards
              </button>

              <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-sm">
                Live on Base
              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-zinc-800 text-left text-gray-400 text-sm">

                  <th className="pb-4">Stake</th>
                  <th className="pb-4">APR</th>
                  <th className="pb-4">Lock</th>
                  <th className="pb-4">Rewards</th>
                  <th className="pb-4">Unlock Date</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Action</th>

                </tr>

              </thead>

              <tbody>

                {allStakes.map((stake, index) => {

                  const unlockTime =
                    stake.startTime + stake.lockDuration;

                  const unlocked =
                    Date.now() / 1000 > unlockTime;

                  return (

                    <tr
                      key={index}
                      className="border-b border-zinc-800"
                    >

                      <td className="py-6 font-bold text-white">
                        {stake.amount.toLocaleString()} FUTFX
                      </td>

                      <td className="py-6 text-blue-400">
                        {stake.apy / 100}%
                      </td>

                      <td className="py-6 text-gray-300">

                        {stake.lockDuration === 0
                          ? "No Lock"
                          : `${Math.floor(
                              stake.lockDuration / 86400
                            )} Days`}

                      </td>

                      <td className="py-6 text-yellow-400">
                        {stake.pendingReward.toFixed(6)} FUTFX
                      </td>

                      <td className="py-6 text-gray-300">

                        {stake.lockDuration === 0
                          ? "Anytime"
                          : new Date(
                              (stake.startTime + stake.lockDuration) * 1000
                            ).toLocaleDateString()}

                      </td>

                      <td className="py-6">

                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            unlocked
                              ? "bg-green-500/20 text-green-400"
                              : "bg-orange-500/20 text-orange-400"
                          }`}
                        >

                          {unlocked ? "Unlocked" : "Locked"}

                        </span>

                      </td>

                      <td className="py-6">

                        <button
                          disabled={!unlocked}
                          onClick={() => handleUnstake(stake.stakeId)}
                          className={`px-4 py-2 rounded-lg font-bold transition ${
                            unlocked
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                          }`}
                        >

                          Unstake

                        </button>

                      </td>

                        

                      

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* VESTING POSITIONS */}

      <div className="max-w-7xl mx-auto mt-12 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">

          <div>

            <h2 className="text-3xl font-bold">
              Vesting Positions
            </h2>

            <p className="text-gray-500 mt-2">
              FutureFX commission vesting dashboard
            </p>

          </div>

          <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-sm">

            Claimable:
            {" "}
            {totalClaimableVesting.toFixed(6)}
            {" "}
            FUTFX

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-zinc-800 text-left text-gray-400 text-sm">

                <th className="pb-4">Source</th>
                <th className="pb-4">Total</th>
                <th className="pb-4">Claimed</th>
                <th className="pb-4">Claimable</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Start Date</th>
                <th className="pb-4">Action</th>

              </tr>

            </thead>

            <tbody>

              {Array.isArray(allVestings) &&
                allVestings.map((vesting, index) => (

                <tr
                  key={index}
                  className="border-b border-zinc-800"
                >

                  <td className="py-6 text-blue-400 font-bold">
                    {vesting.sourceId}
                  </td>

                  <td className="py-6 text-white">
                    {vesting.totalAmount.toLocaleString()}
                    {" "}
                    FUTFX
                  </td>

                  <td className="py-6 text-gray-300">
                    {vesting.claimedAmount.toFixed(6)}
                  </td>

                  <td className="py-6 text-yellow-400 font-bold">
                    {vesting.claimableAmount.toFixed(6)}
                  </td>

                  <td className="py-6">

                    {vesting.forfeited ? (

                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm font-bold">
                        Forfeited
                      </span>

                    ) : vesting.paused ? (

                      <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg text-sm font-bold">
                        Paused
                      </span>

                    ) : (

                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm font-bold">
                        Active
                      </span>

                    )}

                  </td>

                  <td className="py-6 text-gray-300">

                    {new Date(
                      vesting.startTime * 1000
                    ).toLocaleDateString()}

                  </td>
                  <td className="py-6">

                    <button
                      disabled={
                        vesting.claimableAmount <= 0
                        || vesting.paused
                        || vesting.forfeited
                      }
                      onClick={() =>
                        handleVestingClaim(
                          vesting.vestingId
                        )
                      }
                      className={`px-4 py-2 rounded-lg font-bold transition ${
                        vesting.claimableAmount > 0
                        && !vesting.paused
                        && !vesting.forfeited
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      }`}
                    >

                      Claim

                    </button>

                  </td>

                </tr>

              ))
              }

            </tbody>

          </table>

        </div>

      </div> 
               
    </main>
  );
}