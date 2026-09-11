// ABI del contrato TOTUM desplegado en Amoy
export const CONTRACT_ABI = [
  // ===== REGISTRAR IDENTIDAD =====
  {
    "inputs": [
      { "name": "_nombre", "type": "string" },
      { "name": "_dominio", "type": "string" },
      { "name": "_hashDocumento", "type": "string" }
    ],
    "name": "registrarIdentidad",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ===== REGISTRAR PROPIEDAD INTELECTUAL =====
  {
    "inputs": [
      { "name": "_titulo", "type": "string" },
      { "name": "_hashContenido", "type": "string" },
      { "name": "_porcentajeCompartir", "type": "uint256" }
    ],
    "name": "registrarPropiedadIntelectual",
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ===== OBTENER IDENTIDAD =====
  {
    "inputs": [{ "name": "_usuario", "type": "address" }],
    "name": "obtenerIdentidad",
    "outputs": [
      {
        "components": [
          { "name": "dueno", "type": "address" },
          { "name": "nombre", "type": "string" },
          { "name": "dominio", "type": "string" },
          { "name": "hashDocumento", "type": "string" },
          { "name": "estaVerificada", "type": "bool" },
          { "name": "fechaRegistro", "type": "uint256" },
          { "name": "reputacion", "type": "uint256" },
          { "name": "tieneDominio", "type": "bool" },
          { "name": "chainlinkRequestId", "type": "bytes32" },
          { "name": "verificadoPorChainlink", "type": "bool" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ===== OBTENER IDENTIDAD POR DOMINIO =====
  {
    "inputs": [{ "name": "_dominio", "type": "string" }],
    "name": "obtenerIdentidadPorDominio",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  // ===== OBTENER PROPIEDAD =====
  {
    "inputs": [{ "name": "_hash", "type": "bytes32" }],
    "name": "obtenerPropiedad",
    "outputs": [
      {
        "components": [
          { "name": "titulo", "type": "string" },
          { "name": "hashContenido", "type": "string" },
          { "name": "creador", "type": "address" },
          { "name": "fechaRegistro", "type": "uint256" },
          { "name": "porcentajeCompartir", "type": "uint256" },
          { "name": "registrada", "type": "bool" },
          { "name": "chainlinkRequestId", "type": "bytes32" },
          { "name": "verificadoPorChainlink", "type": "bool" },
          { "name": "valoracion", "type": "uint256" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ===== OBTENER PROPIEDADES DE USUARIO =====
  {
    "inputs": [{ "name": "_usuario", "type": "address" }],
    "name": "obtenerPropiedadesUsuario",
    "outputs": [{ "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  // ===== OBTENER REPUTACIÓN =====
  {
    "inputs": [{ "name": "_usuario", "type": "address" }],
    "name": "obtenerReputacion",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  // ===== VERIFICAR SI REGISTRADO =====
  {
    "inputs": [{ "name": "_usuario", "type": "address" }],
    "name": "verificarSiRegistrado",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  // ===== VALORAR PROPIEDAD =====
  {
    "inputs": [
      { "name": "_hash", "type": "bytes32" },
      { "name": "_puntuacion", "type": "uint256" }
    ],
    "name": "valorarPropiedad",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ===== ACTUALIZAR PORCENTAJE =====
  {
    "inputs": [
      { "name": "_hash", "type": "bytes32" },
      { "name": "_nuevoPorcentaje", "type": "uint256" }
    ],
    "name": "actualizarPorcentajeCompartir",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ===== EVENTOS =====
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "usuario", "type": "address" },
      { "indexed": false, "name": "nombre", "type": "string" },
      { "indexed": false, "name": "dominio", "type": "string" },
      { "indexed": false, "name": "fecha", "type": "uint256" },
      { "indexed": false, "name": "reputacion", "type": "uint256" }
    ],
    "name": "IdentidadRegistrada",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "name": "dominio", "type": "string" },
      { "indexed": true, "name": "dueno", "type": "address" }
    ],
    "name": "DominioRegistrado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "hash", "type": "bytes32" },
      { "indexed": true, "name": "creador", "type": "address" },
      { "indexed": false, "name": "titulo", "type": "string" },
      { "indexed": false, "name": "porcentajeCompartir", "type": "uint256" }
    ],
    "name": "PropiedadIntelectualRegistrada",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "usuario", "type": "address" },
      { "indexed": false, "name": "nuevaReputacion", "type": "uint256" }
    ],
    "name": "ReputacionActualizada",
    "type": "event"
  }
];

// ===== DIRECCIONES DESPLEGADAS EN AMOY =====
export const CONTRACT_ADDRESS = "0x7d64B65267E51Cc34F5C562209562430AD1f5BC7";
export const TOKEN_ADDRESS = "0xD0aAe45DF910b363918b59A98110F630BB4a6296";
export const CHAINLINK_ADDRESS = "0xC6De0BAA993000f0d462782546e011308D1973D3";

// ===== ABI DEL TOKEN PANOR (ERC-20) =====
export const TOKEN_ABI = [
  {
    "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];