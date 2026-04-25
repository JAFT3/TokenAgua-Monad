import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES, TOKEN_AGUA_ABI } from "../contracts";

const COLONIAS = ["Analco", "La Calma", "Atlas", "Providencia", "Tlaquepaque Centro"];
const SEVERIDAD_LABELS = ["Leve", "Media", "Grave"] as const;
const RECOMPENSAS = [50, 100, 200];

interface Props {
  onTx: (hash: string, type: string) => void;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function ReportForm({ onTx, onToast }: Props) {
  const { authenticated: isConnected, login } = usePrivy();
  const [colonia, setColonia] = useState("");
  const [direccion, setDireccion] = useState("");
  const [severidad, setSeveridad] = useState<0 | 1 | 2>(0);
  const [descripcion, setDescripcion] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colonia || !direccion) {
      onToast("Completa colonia y dirección", "error");
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.TOKEN_AGUA,
        abi: TOKEN_AGUA_ABI,
        functionName: "reportarFuga",
        args: [colonia, direccion, severidad, descripcion],
      });
    } catch {
      onToast("Error al enviar la transacción", "error");
    }
  };

  // Notificar cuando se confirma
  if (isSuccess && txHash) {
    onTx(txHash, `Fuga ${SEVERIDAD_LABELS[severidad]} · ${colonia}`);
    onToast(`✅ Reporte enviado. +${RECOMPENSAS[severidad]} AGUA pendientes`, "success");
  }

  const loading = isPending || isConfirming;

  return (
    <div className="card" id="reportar">
      <div className="card-header">
        <div className="card-icon">💧</div>
        <div>
          <div className="card-title">Reportar fuga</div>
          <div className="card-sub">Gana tokens AGUA por cada reporte validado</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Colonia</label>
          <select value={colonia} onChange={(e) => setColonia(e.target.value)} required>
            <option value="">Selecciona tu colonia…</option>
            {COLONIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Dirección aproximada</label>
          <input
            type="text"
            placeholder="Ej. Calle Morelos 123"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Severidad</label>
          <div className="severity-btns">
            {SEVERIDAD_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                className={`severity-btn ${severidad === i ? `active-${label.toLowerCase()}` : ""}`}
                onClick={() => setSeveridad(i as 0 | 1 | 2)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Descripción (opcional)</label>
          <textarea
            placeholder="Describe la fuga brevemente…"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <button
          type={isConnected ? "submit" : "button"}
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={loading}
          onClick={!isConnected ? login : undefined}
        >
          {loading ? "Enviando…" : isConnected ? "Reportar en blockchain →" : "Conecta tu wallet primero"}
        </button>

        <p className="hint">
          +50 AGUA por reporte leve · +100 AGUA por media · +200 AGUA por grave.
          Los fondos se liberan automáticamente al validar 3 reportes convergentes.
        </p>
      </form>
    </div>
  );
}
