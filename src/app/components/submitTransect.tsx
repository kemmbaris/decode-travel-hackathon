// submitTransaction.tsx
import React, { useState } from "react";
import { ethers } from "ethers";
import { SHA256 } from "crypto-js";

// Sabit kontrat adresi ve ABI
const CONTRACT_ADDRESS = "0x9Ab0cF5435F8Da71D9a0A10C8c52C2337c5ca30D";
const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_hash",
        type: "string",
      },
    ],
    name: "storeHash",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "getAllHashes",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "hashValue",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
        ],
        internalType: "struct HashStorage.HashRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getHashById",
    outputs: [
      {
        internalType: "string",
        name: "hashValue",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "getHashCount",
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
    name: "getMyLatestHash",
    outputs: [
      {
        internalType: "string",
        name: "hashValue",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

interface SubmitTransactionProps {
  jsonData: any; // JSON verisi prop olarak gelecek
  isConnected: boolean;
  onTransactionComplete: () => void; // Callback for notifying transaction completion
}

const SubmitTransaction: React.FC<SubmitTransactionProps> = ({
  jsonData,
  isConnected,
  onTransactionComplete,
}) => {
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const store = async () => {
    try {
      if (!window.ethereum || !isConnected) {
        setStatus("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      setStatus("Processing...");

      // JSON verisini string'e çevir
      const jsonString = JSON.stringify(jsonData);

      // SHA256 hash'ini al
      const hash = SHA256(jsonString).toString();

      // Provider ve signer'ı al
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Kontrat instance'ını oluştur
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Kontrat fonksiyonunu çağır
      const tx = await contract.storeHash(hash);

      setStatus("Waiting for confirmation...");

      // Transaction'ın tamamlanmasını bekle
      const receipt = await tx.wait();

      setStatus(`Success! Transaction: ${receipt.hash.slice(0, 10)}...`);

      // Trigger onTransactionComplete callback to notify parent
      onTransactionComplete();
    } catch (error) {
      console.error("Transaction error:", error);
      setStatus(error instanceof Error ? "Transaction failed" : "");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={store}
        disabled={!isConnected || !jsonData || isLoading}
        className={`${
          isLoading ? "cursor-not-allowed" : "cursor-pointer"
        } text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 focus-visible:outline-indigo-600 mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 w-full`}
      >
        {isLoading ? "Processing..." : "Store Hash in Blockchain"}
      </button>

      {status && (
        <div
          style={{
            marginTop: "10px",
            color:
              status.includes("error") || status.includes("failed")
                ? "red"
                : "green",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default SubmitTransaction;
