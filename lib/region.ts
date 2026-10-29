import "server-only";
import { connectionUrl } from "./db";

// Region database (dibaca dari alamat Neon) dipetakan ke region server Vercel terdekat.
const AWS_TO_VERCEL: Record<string, string> = {
  "us-east-1": "iad1",
  "us-east-2": "cle1",
  "us-west-1": "sfo1",
  "us-west-2": "pdx1",
  "ca-central-1": "yul1",
  "sa-east-1": "gru1",
  "eu-central-1": "fra1",
  "eu-west-1": "dub1",
  "eu-west-2": "lhr1",
  "eu-west-3": "cdg1",
  "eu-north-1": "arn1",
  "ap-southeast-1": "sin1",
  "ap-southeast-2": "syd1",
  "ap-northeast-1": "hnd1",
  "ap-northeast-2": "icn1",
  "ap-northeast-3": "kix1",
  "ap-south-1": "bom1",
  "ap-east-1": "hkg1",
  "me-central-1": "dxb1",
  "af-south-1": "cpt1",
  // Neon di Azure
  eastus2: "iad1",
  westus3: "sfo1",
  germanywestcentral: "fra1",
};

const VERCEL_NAMES: Record<string, string> = {
  iad1: "Washington DC, AS",
  cle1: "Cleveland, AS",
  sfo1: "San Francisco, AS",
  pdx1: "Portland, AS",
  yul1: "Montreal, Kanada",
  gru1: "São Paulo, Brasil",
  fra1: "Frankfurt, Jerman",
  dub1: "Dublin, Irlandia",
  lhr1: "London, Inggris",
  cdg1: "Paris, Prancis",
  arn1: "Stockholm, Swedia",
  sin1: "Singapura",
  syd1: "Sydney, Australia",
  hnd1: "Tokyo, Jepang",
  icn1: "Seoul, Korea Selatan",
  kix1: "Osaka, Jepang",
  bom1: "Mumbai, India",
  hkg1: "Hong Kong",
  dxb1: "Dubai, UEA",
  cpt1: "Cape Town, Afrika Selatan",
};

export type RegionInfo = {
  server: { code: string | null; name: string };
  database: { raw: string | null; vercelCode: string | null; name: string };
  mismatch: boolean;
};

export function regionInfo(): RegionInfo {
  const serverCode = process.env.VERCEL_REGION ?? null;
  let raw: string | null = null;
  try {
    const host = new URL(connectionUrl() ?? "").hostname; // ep-xxx-pooler.ap-southeast-1.aws.neon.tech
    const parts = host.split(".");
    const i = parts.findIndex((p) => p === "aws" || p === "azure");
    raw = i > 0 ? parts[i - 1] : null;
  } catch {
    raw = null;
  }
  const dbCode = raw ? (AWS_TO_VERCEL[raw] ?? null) : null;
  return {
    server: { code: serverCode, name: serverCode ? (VERCEL_NAMES[serverCode] ?? serverCode) : "Komputer lokal" },
    database: { raw, vercelCode: dbCode, name: dbCode ? (VERCEL_NAMES[dbCode] ?? raw ?? "") : (raw ?? "Tidak diketahui") },
    mismatch: Boolean(serverCode && dbCode && serverCode !== dbCode),
  };
}
