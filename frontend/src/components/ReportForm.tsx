import { useState, useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { CONTRACT_ADDRESSES, TOKEN_AGUA_ABI } from "../contracts";

const COLONIAS = ["Analco", "La Calma", "Atlas", "Providencia", "Tlaquepaque Centro"];
const SEVERIDAD_LABELS = ["Leve", "Media", "Grave"] as const;
const RECOMPENSAS = [50, 100, 200];

// Wallet owner para auto-validar (solo demo/hackathon)
const OWNER_PK = "0x8d177d3e28c520c2fdd6c82c4cc5c08d4b9cdc834ab019fd97dfee849b55e54d" as `0x${string}`;
const ownerAccount = privateKeyToAccount(OWNER_PK);
const ownerClient = createWalletClient({
  account: ownerAccount,
  chain: monadTestnet,
  transport: http("https://testnet-rpc.monad.xyz", { fetchOptions: { mode: "cors" } }),
});

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
  const validatedRef = useRef<string | null>(null);
  const reportIdRef = useRef<bigint>(0n);
  const localCounterRef = useRef<bigint | null>(null);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash: txHash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colonia || !direccion) {
      onToast("Completa colonia y dirección", "error");
      return;
    }

    // Inicializar el contador — el contrato tiene reportes previos
    // Hardcodeado para demo ya que el RPC no responde desde el browser
    if (localCounterRef.current === null) {
      localCounterRef.current = 9n; // Total de reportes actuales en el contrato
    }

    reportIdRef.current = localCounterRef.current;
    localCounterRef.current = localCounterRef.current + 1n;
    console.log("Submitting report, will validate ID:", reportIdRef.current.toString());

    writeContract({
      address: CONTRACT_ADDRESSES.TOKEN_AGUA,
      abi: TOKEN_AGUA_ABI,
      functionName: "reportarFuga",
      args: [colonia, direccion, severidad, descripcion],
    });
  };

  // Auto-validar cuando el reporte se confirma
  useEffect(() => {
    if (!isSuccess || !txHash || !receipt || validatedRef.current === txHash) return;
    validatedRef.current = txHash;

    onTx(txHash, `Fuga ${SEVERIDAD_LABELS[severidad]} · ${colonia}`);
    onToast(`⏳ Validando reporte automáticamente…`, "info");

    // Usar el ID guardado antes de enviar el reporte
    const reportId = reportIdRef.current;
    console.log("Validating report ID:", reportId.toString());

    ownerClient.writeContract({
      address: CONTRACT_ADDRESSES.TOKEN_AGUA,
      abi: TOKEN_AGUA_ABI,
      functionName: "validarReporte",
      args: [reportId],
    }).then((validationHash) => {
      onTx(validationHash, `✅ Validación · +${RECOMPENSAS[severidad]} AGUA`);
      onToast(`✅ +${RECOMPENSAS[severidad]} AGUA acreditados a tu wallet`, "success");
      // Disparar evento para actualizar balance en Wallet
      window.dispatchEvent(new CustomEvent("aguaValidated", { detail: { amount: RECOMPENSAS[severidad] } }));
    }).catch((err) => {
      console.error("Auto-validación falló:", err);
      onToast(`⚠️ Reporte enviado, validación pendiente`, "info");
    });
  }, [isSuccess, txHash, receipt]); // eslint-disable-line react-hooks/exhaustive-deps

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
