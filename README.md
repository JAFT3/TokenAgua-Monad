# TokenAgua 💧

Sistema descentralizado de gestión hídrica para la ZMG — Hackathon Ciudad Inteligente 2026.

Construido sobre **Monad Testnet** (chain 10143) con Foundry + React + wagmi/viem.

---

## Estructura

```
tokenagua/
├── contracts/          # Foundry — contratos Solidity
│   ├── src/
│   │   ├── TokenAgua.sol       # ERC20 AGUA + sistema de reportes
│   │   └── TokenAguaDAO.sol    # Gobernanza on-chain
│   └── script/Deploy.s.sol
└── frontend/           # Vite + React + wagmi
    └── src/
        ├── components/
        ├── hooks/
        ├── contracts.ts        # ABIs y direcciones
        └── wagmi.config.ts
```

---

## Deploy de contratos

```bash
cd contracts

# Instalar dependencias
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Compilar
forge build

# Generar wallet (guarda la clave privada de forma segura)
cast wallet new

# Fondear desde el faucet de Monad Testnet
curl -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"chainId": 10143, "address": "TU_ADDRESS"}'

# Deploy
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast
```

Después del deploy, copia las direcciones en `frontend/src/contracts.ts`:

```ts
export const CONTRACT_ADDRESSES = {
  TOKEN_AGUA:     "0x...",
  TOKEN_AGUA_DAO: "0x...",
};
```

### Verificar contratos

```bash
forge verify-contract <TOKEN_AGUA_ADDR> src/TokenAgua.sol:TokenAgua \
  --chain 10143 --show-standard-json-input > /tmp/standard-input.json

COMPILER_VERSION=$(jq -r '.metadata | fromjson | .compiler.version' out/TokenAgua.sol/TokenAgua.json)

curl -X POST https://agents.devnads.com/v1/verify \
  -H "Content-Type: application/json" \
  -d "{
    \"chainId\": 10143,
    \"contractAddress\": \"<TOKEN_AGUA_ADDR>\",
    \"contractName\": \"src/TokenAgua.sol:TokenAgua\",
    \"compilerVersion\": \"v${COMPILER_VERSION}\",
    \"standardJsonInput\": $(cat /tmp/standard-input.json),
    \"constructorArgs\": \"$(cast abi-encode 'constructor(address)' TU_ADDRESS | sed 's/0x//')\"
  }"
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173 y conecta MetaMask en Monad Testnet.

---

## Contratos desplegados (actualizar tras deploy)

| Contrato      | Dirección |
|---------------|-----------|
| TokenAgua     | `0x...`   |
| TokenAguaDAO  | `0x...`   |
