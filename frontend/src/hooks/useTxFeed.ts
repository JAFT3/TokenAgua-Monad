import { useState, useCallback } from "react";

export interface TxEntry {
  hash: string;
  type: string;
  timestamp: number;
}

export function useTxFeed() {
  const [txs, setTxs] = useState<TxEntry[]>([]);

  const addTx = useCallback((hash: string, type: string) => {
    setTxs((prev) => {
      if (prev.some((tx) => tx.hash === hash)) return prev;
      return [{ hash, type, timestamp: Date.now() }, ...prev].slice(0, 20);
    });
  }, []);

  return { txs, addTx };
}
