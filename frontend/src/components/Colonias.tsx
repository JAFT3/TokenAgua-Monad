import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, TOKEN_AGUA_ABI } from "../contracts";

const COLONIAS = [
  { name: "Analco",             key: "Analco" },
  { name: "La Calma",           key: "La Calma" },
  { name: "Atlas",              key: "Atlas" },
  { name: "Providencia",        key: "Providencia" },
  { name: "Tlaquepaque Centro", key: "Tlaquepaque Centro" },
];

const SENSORS = [
  { id: "Analco-S01",      tipo: "Presión", valor: "3.2 bar ↓", status: "warn" },
  { id: "Analco-S02",      tipo: "Caudal",  valor: "⚠ anomalía", status: "alert" },
  { id: "LaCalma-S01",     tipo: "Presión", valor: "4.1 bar ✓",  status: "ok" },
  { id: "Tlaquepaque-S03", tipo: "—",       valor: "sin datos",  status: "warn" },
  { id: "Providencia-S01", tipo: "Presión", valor: "4.8 bar ✓",  status: "ok" },
];

function ColoniaCard({ name, coloniaKey }: { name: string; coloniaKey: string }) {
  const { data: ids } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_AGUA,
    abi: TOKEN_AGUA_ABI,
    functionName: "getReportesPorColonia",
    args: [coloniaKey],
  });

  const count = (ids as bigint[] | undefined)?.length ?? 0;
  const statusClass = count === 0 ? "status-ok" : count <= 2 ? "status-warn" : "status-alert";
  const statusText  = count === 0 ? "OK" : `${count} fuga${count > 1 ? "s" : ""}`;

  return (
    <div className="colonia-card">
      <div className="name">{name}</div>
      <div className={`status ${statusClass}`}>{statusText}</div>
    </div>
  );
}

export default function Colonias() {
  return (
    <div className="card" id="colonias">
      <div className="card-header">
        <div className="card-icon">🗺️</div>
        <div>
          <div className="card-title">Colonias piloto</div>
          <div className="card-sub">Estado de la red hídrica en tiempo real</div>
        </div>
      </div>

      <div className="colonias-grid">
        {COLONIAS.map((c) => (
          <ColoniaCard key={c.key} name={c.name} coloniaKey={c.key} />
        ))}
      </div>

      <div className="sensors-title">Sensores IoT · LoRaWAN</div>
      <div className="sensor-list">
        {SENSORS.map((s) => (
          <div className="sensor-item" key={s.id}>
            <span className="sensor-name">{s.id} · {s.tipo}</span>
            <span className={`status-${s.status}`}>{s.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
