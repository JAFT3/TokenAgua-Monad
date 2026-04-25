import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { wagmiConfig } from "./wagmi.config";
import { monadTestnet } from "viem/chains";
import App from "./components/App";
import "./styles.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrivyProvider
      appId="cmodobz5200r30cl81qy0zma4"
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#06b6d4",
          logo: "https://i.imgur.com/placeholder.png",
        },
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
        // Métodos de login habilitados
        loginMethods: ["email", "wallet", "google"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        externalWallets: {
          coinbaseWallet: {
            connectionOptions: "eoaOnly",
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <App />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  </React.StrictMode>
);
