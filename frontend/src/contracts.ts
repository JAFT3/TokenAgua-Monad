/// Direcciones de contratos desplegados en Monad Testnet (chain 10143)
/// Actualiza estas direcciones después de ejecutar el script de deploy
export const CONTRACT_ADDRESSES = {
  TOKEN_AGUA: "0x7DA81C6dbC05F682775cd97B6f87ff659C62e9a8" as `0x${string}`,
  TOKEN_AGUA_DAO: "0xD0e42B6967A5724227cb8Cd1Ef06af728705B679" as `0x${string}`,
};

export const TOKEN_AGUA_ABI = [
  // ERC20
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Reportes
  {
    name: "reportarFuga",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "colonia", type: "string" },
      { name: "direccion", type: "string" },
      { name: "severidad", type: "uint8" },
      { name: "descripcion", type: "string" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    name: "reportes",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "reportador", type: "address" },
      { name: "colonia", type: "string" },
      { name: "direccion", type: "string" },
      { name: "severidad", type: "uint8" },
      { name: "descripcion", type: "string" },
      { name: "estado", type: "uint8" },
      { name: "timestamp", type: "uint256" },
      { name: "recompensa", type: "uint256" },
    ],
  },
  {
    name: "totalReportes",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getReportesPorColonia",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "colonia", type: "string" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  // Constantes de recompensa
  {
    name: "RECOMPENSA_LEVE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Eventos
  {
    name: "FugaReportada",
    type: "event",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "reportador", type: "address", indexed: true },
      { name: "colonia", type: "string", indexed: false },
      { name: "severidad", type: "uint8", indexed: false },
      { name: "recompensa", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

export const TOKEN_AGUA_DAO_ABI = [
  {
    name: "propuestas",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "titulo", type: "string" },
      { name: "descripcion", type: "string" },
      { name: "presupuesto", type: "uint256" },
      { name: "destino", type: "address" },
      { name: "votosAFavor", type: "uint256" },
      { name: "votosEnContra", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "estado", type: "uint8" },
    ],
  },
  {
    name: "totalPropuestas",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "votar",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "propuestaId", type: "uint256" },
      { name: "aFavor", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "haVotado",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "propuestaId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "porcentajeAFavor",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "propuestaId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "crearPropuesta",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "titulo", type: "string" },
      { name: "descripcion", type: "string" },
      { name: "presupuesto", type: "uint256" },
      { name: "destino", type: "address" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    name: "VotoEmitido",
    type: "event",
    inputs: [
      { name: "propuestaId", type: "uint256", indexed: true },
      { name: "votante", type: "address", indexed: true },
      { name: "aFavor", type: "bool", indexed: false },
      { name: "peso", type: "uint256", indexed: false },
    ],
  },
] as const;
