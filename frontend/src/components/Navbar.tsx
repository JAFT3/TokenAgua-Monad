import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

export default function Navbar() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address } = useAccount();

  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  return (
    <nav>
      <div className="container inner">
        <div className="logo">💧 TokenAgua</div>
        <div className="links">
          <a href="#reportar">Reportar</a>
          <a href="#colonias">Colonias</a>
          <a href="#dao">DAO</a>
          <a href="#blockchain">Blockchain</a>
        </div>
        {authenticated ? (
          <button className="btn btn-outline btn-sm" onClick={logout}>
            {short || "Conectado"}
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={login}
            disabled={!ready}
          >
            Conectar Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
