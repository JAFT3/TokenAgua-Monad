import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES, TOKEN_AGUA_DAO_ABI } from "../contracts";

interface Props {
  onTx: (hash: string, type: string) => void;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

// Propuestas demo — en producción se leen dinámicamente del contrato
const DEMO_PROPOSALS = [
  {
    id: 0n,
    titulo: "Reparar red primaria Analco Norte",
    descripcion: "Liberar $85,000 MXN del fideicomiso para reparar 340m de tubería de 4\" en Analco Norte. Presupuesto validado por SIAPA.",
    pct: 73,
    votos: 128,
    dias: 3,
  },
  {
    id: 1n,
    titulo: "Instalar 40 sensores adicionales en Tlaquepaque",
    descripcion: "Expandir la red IoT LoRaWAN a 40 puntos nuevos en Tlaquepaque Centro con presupuesto de $62,000 MXN del fondo.",
    pct: 58,
    votos: 89,
    dias: 6,
  },
  {
    id: 2n,
    titulo: "Alianza técnica con UdeG CUCEI",
    descripcion: "Formalizar convenio de colaboración técnica con CUCEI para mantenimiento de oráculos y auditoría de smart contracts.",
    pct: 91,
    votos: 214,
    dias: 1,
  },
];

function ProposalCard({
  proposal,
  onTx,
  onToast,
}: {
  proposal: (typeof DEMO_PROPOSALS)[0];
  onTx: Props["onTx"];
  onToast: Props["onToast"];
}) {
  const { authenticated: isConnected, login } = usePrivy();
  const { address } = useAccount();

  const { data: yaVoto } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_AGUA_DAO,
    abi: TOKEN_AGUA_DAO_ABI,
    functionName: "haVotado",
    args: address ? [proposal.id, address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  useWaitForTransactionReceipt({ hash: txHash });

  const votar = (aFavor: boolean) => {
    if (!isConnected) { onToast("Conecta tu wallet para votar", "error"); login(); return; }
    writeContract({
      address: CONTRACT_ADDRESSES.TOKEN_AGUA_DAO,
      abi: TOKEN_AGUA_DAO_ABI,
      functionName: "votar",
      args: [proposal.id, aFavor],
    });
    if (txHash) onTx(txHash, `Voto ${aFavor ? "a favor" : "en contra"} · ${proposal.titulo}`);
    onToast(`Voto registrado en blockchain`, "success");
  };

  return (
    <div className="proposal-card">
      <div className="p-title">{proposal.titulo}</div>
      <div className="p-desc">{proposal.descripcion}</div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${proposal.pct}%` }} />
      </div>
      <div className="vote-meta">
        <span>{proposal.pct}% a favor · {proposal.votos} votos</span>
        <span>{proposal.dias} día{proposal.dias !== 1 ? "s" : ""} restante{proposal.dias !== 1 ? "s" : ""}</span>
      </div>
      <div className="vote-actions">
        {yaVoto ? (
          <span className="voted-badge">✓ Ya votaste</span>
        ) : (
          <>
            <button className="btn btn-green btn-sm" disabled={isPending} onClick={() => votar(true)}>
              ✓ A favor
            </button>
            <button className="btn btn-red btn-sm" disabled={isPending} onClick={() => votar(false)}>
              ✗ En contra
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function DAOProposals({ onTx, onToast }: Props) {
  return (
    <div className="card" id="dao">
      <div className="card-header">
        <div className="card-icon">🗳️</div>
        <div>
          <div className="card-title">Gobernanza DAO</div>
          <div className="card-sub">Vota con tus tokens AGUA · Snapshot + smart contract</div>
        </div>
      </div>
      <div className="proposals-list">
        {DEMO_PROPOSALS.map((p) => (
          <ProposalCard key={p.id.toString()} proposal={p} onTx={onTx} onToast={onToast} />
        ))}
      </div>
    </div>
  );
}
