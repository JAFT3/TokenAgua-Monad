import type { TxEntry } from "../hooks/useTxFeed";

interface Props {
  txs: TxEntry[];
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `hace ${s}s`;
  if (s < 3600) return `hace ${Math.floor(s / 60)}m`;
  return `hace ${Math.floor(s / 3600)}h`;
}

export default function TxFeed({ txs }: Props) {
  return (
    <div className="card" id="blockchain">
      <div className="card-header">
        <div className="card-icon">⛓️</div>
        <div>
          <div className="card-title">Feed de transacciones</div>
          <div className="card-sub">Monad Testnet · tiempo real</div>
        </div>
      </div>

      {txs.length === 0 ? (
        <div className="tx-empty">Aún no hay transacciones en esta sesión</div>
      ) : (
        <div className="tx-list">
          {txs.map((tx) => (
            <div className="tx-item" key={tx.hash}>
              <div>
                <div className="tx-type">{tx.type}</div>
                <a
                  className="tx-hash"
                  href={`https://monad-testnet.socialscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tx.hash.slice(0, 10)}…{tx.hash.slice(-6)}
                </a>
              </div>
              <div className="tx-time">{timeAgo(tx.timestamp)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
