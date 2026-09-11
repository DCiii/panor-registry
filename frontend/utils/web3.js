import { ethers } from 'ethers';
import { 
  CONTRACT_ABI, 
  CONTRACT_ADDRESS, 
  TOKEN_ABI, 
  TOKEN_ADDRESS 
} from './contractABI';

// ===== RED AMOY =====
const AMOY_CHAIN_ID = '0x13882'; // 80002 en hex
const AMOY_NETWORK = {
  chainId: AMOY_CHAIN_ID,
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology'],
  blockExplorerUrls: ['https://amoy.polygonscan.com'],
};

// ===== CONECTAR WALLET =====
export const connectWallet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('🔗 MetaMask no está instalado');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Verificar/cambiar a red Amoy
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== AMOY_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AMOY_CHAIN_ID }],
        });
      } catch (switchError) {
        // Si la red no está agregada, agregarla
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AMOY_NETWORK],
          });
        } else {
          throw switchError;
        }
      }
    }

    // Escuchar cambios de cuenta
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        window.location.reload();
      }
    });

    return accounts[0];
  } catch (error) {
    console.error('Error conectando wallet:', error);
    throw error;
  }
};

// ===== OBTENER CONTRATO TOTUM =====
export const getContract = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('🔗 MetaMask no está instalado');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// ===== OBTENER CONTRATO TOKEN PANOR =====
export const getTokenContract = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('🔗 MetaMask no está instalado');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
};

// ===== REGISTRAR IDENTIDAD (.panor) =====
export const registerDomain = async (contract, domain, walletAddress) => {
  // domain: "anna" o "anna.panor"
  const cleanDomain = domain.replace('.panor', '').toLowerCase();
  
  // Generar hash del documento (puede ser vacío o algún identificador)
  const hashDocumento = ethers.keccak256(
    ethers.toUtf8Bytes(`identity-${walletAddress}-${Date.now()}`)
  );

  // Aprobar PANOR para TOTUM
  const token = await getTokenContract();
  const approveAmount = ethers.parseEther('1000');
  const approveTx = await token.approve(CONTRACT_ADDRESS, approveAmount);
  await approveTx.wait();

  // Registrar identidad
  const tx = await contract.registrarIdentidad(
    cleanDomain,      // nombre
    cleanDomain,      // dominio
    hashDocumento     // hash del documento
  );
  await tx.wait();
  return tx;
};

// ===== REGISTRAR PROPIEDAD INTELECTUAL =====
export const registerIntellectual = async (contract, title, content) => {
  // Generar hash del contenido
  const hashContenido = ethers.keccak256(
    ethers.toUtf8Bytes(`${title}-${content}-${Date.now()}`)
  );
  
  const sharingPercent = 50; // Default 50%
  
  const tx = await contract.registrarPropiedadIntelectual(
    title,
    hashContenido,
    sharingPercent
  );
  await tx.wait();
  return tx;
};

// ===== OBTENER IDENTIDAD =====
export const getIdentity = async (contract, walletAddress) => {
  return await contract.obtenerIdentidad(walletAddress);
};

// ===== OBTENER IDENTIDAD POR DOMINIO =====
export const getIdentityByDomain = async (contract, domain) => {
  return await contract.obtenerIdentidadPorDominio(domain);
};

// ===== OBTENER BALANCE PANOR =====
export const getPanorBalance = async (walletAddress) => {
  const token = await getTokenContract();
  const balance = await token.balanceOf(walletAddress);
  return ethers.formatEther(balance);
};

// ===== VERIFICAR SI METAMASK ESTÁ INSTALADO =====
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
};

// ===== OBTENER RED ACTUAL =====
export const getNetwork = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getNetwork();
};

// ===== VERIFICAR SI EL USUARIO YA ESTÁ REGISTRADO =====
export const isUserRegistered = async (contract, walletAddress) => {
  return await contract.verificarSiRegistrado(walletAddress);
};