import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACT_ADDRESSES, TOKEN_AGUA_ABI } from "../contracts";

const DEMO_HISTORY = [
  { label: "Fuga grave · Analco",   date: "23 abr 2026", reward: "+200 AGUA" },
  { label: "Fuga media · La Calma", date: "21 abr 2026", reward: "+100 AGUA" },
  { label: "Fuga leve · Atlas",     date: "18 abr 2026", reward: "+50 AGUA"  },
];

export default function Wallet() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_AGUA,
    abi: TOKEN_AGUA_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: authenticated && !!address },
  });

  const formattedBalance = balance
    ? Number(formatUnits(balance as bigint, 18)).toLocaleString()
    : "0";

  // Nombre o email del usuario Privy si existe
  const displayName =
    user?.email?.address ??
    user?.google?.email ??
    (address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "");

  return (
    <div className="card" id="wallet">
      <div className="card-header">
        <div className="card-icon">🪙</div>
        <div>
          <div className="card-title">Mi billetera</div>
          <div className="card-sub">Token AGUA · Monad Testnet</div>
        </div>
      </div>

      {!authenticated ? (
        <div className="wallet-connect-prompt">
          <div className="icon">🔐</div>
          <p>Conecta tu wallet para ver tu saldo y recompensas</p>
          <button className="btn btn-primary" onClick={login} disabled={!ready}>
            Conectar Wallet
          </button>
        </div>
      ) : (
        <div className="wallet-info">
          <div className="wallet-row">
            <div className="chain-badge">
              <span className="chain-dot" />
              Monad Testnet · Chain ID: 10143
            </div>
            <span className="block-num">Bloque #{blockNumber?.toString() ?? "—"}</span>
          </div>

          {displayName && (
            <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>
              👤 {displayName}
            </div>
          )}

          <div className="token-balance-box">
            <div>
              <div style={{ fontSize: ".75rem", color: "var(--muted)", marginBottom: ".25rem" }}>
                TOKENS AGUA
              </div>
              <div className="amount">{formattedBalance}</div>
              <div className="symbol">AGUA</div>
            </div>
            <div className="drop">💧</div>
          </div>

          <div>
            <div className="history-title">Historial de recompensas</div>
            <div className="history-list">
              {DEMO_HISTORY.map((h, i) => (
                <div className="history-item" key={i}>
                  <div>
                    <div>{h.label}</div>
                    <div className="meta">{h.date}</div>
                  </div>
                  <div className="reward">{h.reward}</div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-outline btn-sm" onClick={logout}>
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
}
