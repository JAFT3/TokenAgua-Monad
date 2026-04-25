import Navbar from "./Navbar";
import ReportForm from "./ReportForm";
import Wallet from "./Wallet";
import Colonias from "./Colonias";
import CuotasPluviales from "./CuotasPluviales";
import DAOProposals from "./DAOProposals";
import TxFeed from "./TxFeed";
import ToastContainer from "./Toast";
import { useToast } from "../hooks/useToast";
import { useTxFeed } from "../hooks/useTxFeed";

// Stats estáticas de demo
const STATS = [
  { val: "247",    lbl: "Fugas reportadas" },
  { val: "18,420", lbl: "Tokens AGUA distribuidos" },
  { val: "5",      lbl: "Colonias piloto activas" },
  { val: "200",    lbl: "Sensores IoT activos" },
  { val: "$342K",  lbl: "Fondo reparaciones (MXN)" },
];

export default function App() {
  const { toasts, addToast } = useToast();
  const { txs, addTx } = useTxFeed();

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="badge">🌊 Hackathon Ciudad Inteligente · ZMG 2026</div>
        <h1>
          Agua limpia,<br />
          <span>ciudad transparente</span>
        </h1>
        <p>
          Sistema descentralizado de gestión hídrica para la Zona Metropolitana de Guadalajara.
          Reporta fugas, gana tokens AGUA, financia reparaciones.
        </p>
        <div className="ctas">
          <a href="#reportar" className="btn btn-primary">Reportar una fuga →</a>
          <a href="#dao" className="btn btn-outline">Ver propuestas DAO</a>
        </div>
        <div style={{ marginTop: "1.5rem", fontSize: ".8rem", color: "var(--muted)" }}>
          Monad Testnet · Chain 10143
        </div>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        {STATS.map((s) => (
          <div className="stat" key={s.lbl}>
            <div className="val">{s.val}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="container">
        <div className="sections">
          <ReportForm onTx={addTx} onToast={addToast} />
          <Wallet />
          <Colonias />
          <CuotasPluviales />
          <DAOProposals onTx={addTx} onToast={addToast} />
          <TxFeed txs={txs} />
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div>TokenAgua © 2026 · Hackathon Ciudad Inteligente GDL</div>
        <div>
          <a href="https://monad-testnet.socialscan.io" target="_blank" rel="noreferrer">
            Monad Testnet Explorer
          </a>
          {" · "}
          <a href="https://docs.monad.xyz" target="_blank" rel="noreferrer">
            docs.monad.xyz
          </a>
        </div>
        <div style={{ marginTop: ".5rem", fontFamily: "monospace" }}>
          Contrato TokenAgua: 0x742d35Cc… · IPFS: Qm3xFr…
        </div>
      </footer>

      <ToastContainer toasts={toasts} />
    </>
  );
}
