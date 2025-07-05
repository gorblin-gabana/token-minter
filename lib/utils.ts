import { Connection } from "@solana/web3.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_GORB_RPC_URL || "https://rpc.gorbchain.xyz";
const WS_ENDPOINT =   process.env.NEXT_PUBLIC_GORB_WSS_URL||"wss://rpc.gorbchain.xyz/ws/";
export const GORB_CONNECTION = new Connection(RPC_ENDPOINT, {
  commitment: "confirmed",
  wsEndpoint: WS_ENDPOINT,
  disableRetryOnRateLimit: false,
});
