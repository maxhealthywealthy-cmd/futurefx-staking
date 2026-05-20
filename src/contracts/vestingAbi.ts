export const vestingAbi = [

  {
    "inputs": [
      {
        "internalType": "address",
        "name": "member",
        "type": "address"
      }
    ],
    "name": "getMemberVestings",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "vestingId",
        "type": "uint256"
      }
    ],
    "name": "getVesting",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "beneficiary",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "totalAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "claimedAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pausedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalPausedTime",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "paused",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "forfeited",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "sourceId",
            "type": "string"
          }
        ],
        "internalType": "struct FutureFXVesting.Vesting",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "vestingId",
        "type": "uint256"
      }
    ],
    "name": "claimable",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "vestingId",
        "type": "uint256"
      }
    ],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }

];