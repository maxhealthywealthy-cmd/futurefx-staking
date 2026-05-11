import { NextResponse } from "next/server";

import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

import { stakingAbi } from "@/contracts/stakingAbi";

import {
  STAKING_CONTRACT,
} from "@/contracts/constants";

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://base-mainnet.g.alchemy.com/v2/D8VsZrtnXxPm5EB9vWnXl"),
});

const WIX_SYNC_SECRET = "FutureFX21#";
const WIX_SYNC_URL =
  "https://www.futurefx.tech/_functions/syncStakingData";

export async function GET() {

  try {

    // ================================
    // GLOBAL STAKING DATA
    // ================================

    const totalStaked = await publicClient.readContract({
      address: STAKING_CONTRACT,
      abi: stakingAbi,
      functionName: "totalStaked",
    });

    const stakingCap = await publicClient.readContract({
      address: STAKING_CONTRACT,
      abi: stakingAbi,
      functionName: "maxTotalStaked",
    });

    const rewardsDistributed = await publicClient.readContract({
      address: STAKING_CONTRACT,
      abi: stakingAbi,
      functionName: "totalRewardsClaimed",
    });

    // ================================
    // FORMAT VALUES
    // ================================

    const formattedTotalStaked =
      Number(totalStaked) / 1e18;

    const formattedStakingCap =
      Number(stakingCap) / 1e18;

    const formattedRewardsDistributed =
      Number(rewardsDistributed) / 1e18;

    const remainingCapacity =
      formattedStakingCap - formattedTotalStaked;

    const stakingUtilization =
      formattedStakingCap > 0
        ? (formattedTotalStaked / formattedStakingCap) * 100
        : 0;

    // ================================
    // SEND TO WIX
    // ================================

    const response = await fetch(WIX_SYNC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sync-secret": WIX_SYNC_SECRET,
      },
      body: JSON.stringify({

        walletAddress: "global",

        totalStaked: formattedTotalStaked,
        stakingCap: formattedStakingCap,
        remainingCapacity,
        stakingUtilization,
        rewardsDistributed: formattedRewardsDistributed,

      }),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      wixResponse: result,
    });

  } catch (err: any) {

    console.error("SYNC ERROR:", err);

    return NextResponse.json({
      success: false,
      error: err.message,
    });

  }

}