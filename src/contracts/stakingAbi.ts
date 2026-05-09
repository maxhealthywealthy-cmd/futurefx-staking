export const stakingAbi = [

  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "lockDuration", type: "uint256" },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getStakeCount",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [
        { internalType: "address", name: "user", type: "address" },
        { internalType: "uint256", name: "stakeId", type: "uint256" },
    ],
    name: "getStake",
    outputs: [
        {
        components: [
            {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
            },
            {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
            },
            {
            internalType: "uint256",
            name: "lockDuration",
            type: "uint256",
            },
            {
            internalType: "uint256",
            name: "apy",
            type: "uint256",
            },
            {
            internalType: "uint256",
            name: "lastClaimTime",
            type: "uint256",
            },
            {
            internalType: "uint256",
            name: "claimedRewards",
            type: "uint256",
            },
            {
            internalType: "bool",
            name: "withdrawn",
            type: "bool",
            },
        ],
        internalType: "struct FutureFXStakingV1.StakeInfo",
        name: "",
        type: "tuple",
        },
    ],
    stateMutability: "view",
    type: "function",
    },
    {
    inputs: [
        { internalType: "address", name: "user", type: "address" },
        { internalType: "uint256", name: "stakeId", type: "uint256" },
    ],
    name: "pendingReward",
    outputs: [
        {
        internalType: "uint256",
        name: "",
        type: "uint256",
        },
    ],
    stateMutability: "view",
    type: "function",
    },

    {
        inputs: [
            { internalType: "address", name: "user", type: "address" },
            { internalType: "uint256", name: "stakeId", type: "uint256" },
        ],
        name: "pendingReward",
        outputs: [
            {
            internalType: "uint256",
            name: "",
            type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
        },
    {
        inputs: [
            {
            internalType: "uint256",
            name: "stakeId",
            type: "uint256",
            },
        ],
        name: "unstake",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },

    {
        inputs: [],
        name: "totalStaked",
        outputs: [
            {
            internalType: "uint256",
            name: "",
            type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
        },

        {
        inputs: [],
        name: "maxTotalStaked",
        outputs: [
            {
            internalType: "uint256",
            name: "",
            type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
        },

        {
        inputs: [],
        name: "totalRewardsClaimed",
        outputs: [
            {
            internalType: "uint256",
            name: "",
            type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
        },

    {
        inputs: [
            {
            internalType: "uint256",
            name: "stakeId",
            type: "uint256",
            },
        ],
        name: "claim",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
        },
];