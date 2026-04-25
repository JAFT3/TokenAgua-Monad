import { createConfig, http } from "wagmi";
import { monadTestnet } from "viem/chains";

// Config de wagmi usado por PrivyWagmiConnector — sin connectors manuales,
// Privy los inyecta automáticamente según el método de login elegido.
export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
  },
});
