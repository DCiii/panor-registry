"use client";

import { useState, useEffect, useRef } from "react";

const AMOY_CHAIN_ID = '0x13882';
const AMOY_NETWORK = {
  chainId: AMOY_CHAIN_ID,
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: ['https://rpc-amoy.polygon.technology'],
  blockExplorerUrls: ['https://amoy.polygonscan.com'],
};

const TOTUM_ADDRESS = '0x7d64B65267E51Cc34F5C562209562430AD1f5BC7';
const TOKEN_ADDRESS = '0xD0aAe45DF910b363918b59A98110F630BB4a6296';

const GAS_CONFIG = {
  maxPriorityFeePerGas: BigInt('30000000000'),
  maxFeePerGas: BigInt('50000000000'),
};

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [domainName, setDomainName] = useState("");
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [searching, setSearching] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [generatedHash, setGeneratedHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStatus, setShowStatus] = useState<{ message: string; type: string } | null>(null);
  const [networkName, setNetworkName] = useState("");
  const [isUserConnected, setIsUserConnected] = useState(false);
  const [userDomain, setUserDomain] = useState<string | null>(null);

  const [showSearchInfo, setShowSearchInfo] = useState(false);
  const [showShortenInfo, setShowShortenInfo] = useState(false);
  const [showIntellectualInfo, setShowIntellectualInfo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const networks: { [key: string]: string } = {
              '0x1': 'Ethereum Mainnet',
              '0xaa36a7': 'Sepolia',
              '0x89': 'Polygon',
              '0x13882': 'Polygon Amoy',
            };
            setNetworkName(networks[chainId] || 'Unknown Network');
          }
        } catch (error) {}
      }
    };
    checkConnection();
  }, []);

  const switchToAmoy = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId === AMOY_CHAIN_ID) return true;
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AMOY_CHAIN_ID }],
        });
        return true;
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AMOY_NETWORK],
          });
          return true;
        }
        return false;
      }
    } catch { return false; }
  };

  const handleConnectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setShowStatus({ message: "🔗 Instala MetaMask para continuar", type: "error" });
      setTimeout(() => setShowStatus(null), 5000);
      return;
    }
    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsUserConnected(true);
        await switchToAmoy();
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networks: { [key: string]: string } = {
          '0x1': 'Ethereum Mainnet',
          '0xaa36a7': 'Sepolia',
          '0x89': 'Polygon',
          '0x13882': 'Polygon Amoy',
        };
        setNetworkName(networks[chainId] || 'Unknown Network');
        try {
          const { ethers } = await import('ethers');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const TOTUM_ABI = [
            "function verificarSiRegistrado(address _usuario) public view returns (bool)",
            "function obtenerIdentidad(address _usuario) public view returns (tuple(address dueno, string nombre, string dominio, string hashDocumento, bool estaVerificada, uint256 fechaRegistro, uint256 reputacion, bool tieneDominio, bytes32 chainlinkRequestId, bool verificadoPorChainlink))"
          ];
          const totum = new ethers.Contract(TOTUM_ADDRESS, TOTUM_ABI, provider);
          const registrado = await totum.verificarSiRegistrado(accounts[0]);
          if (registrado) {
            const identidad = await totum.obtenerIdentidad(accounts[0]);
            setUserDomain(identidad.dominio);
            setShowStatus({ message: `✨ Bienvenido, ${identidad.dominio}`, type: "success" });
          } else {
            setShowStatus({ message: "✨ ¡Wallet conectada! Crea tu dominio", type: "success" });
          }
        } catch {
          setShowStatus({ message: "✨ ¡Wallet conectada!", type: "success" });
        }
      }
    } catch (error: any) {
      setShowStatus({
        message: error.code === 4001 ? "❌ Cancelaste" : "❌ Error",
        type: "error"
      });
    }
    setIsLoading(false);
    setTimeout(() => setShowStatus(null), 6000);
  };

  const handleSearchDomain = async () => {
    if (!domainName.trim()) {
      setShowStatus({ message: "⚠️ Escribe un nombre", type: "warning" });
      setTimeout(() => setShowStatus(null), 3000);
      return;
    }
    setSearching(true);
    setDomainAvailable(null);
    setTimeout(() => {
      const domain = domainName.toLowerCase().replace('.panor', '');
      const ocupados = ['anna', 'genesis', 'totum', 'panor', 'darwin', 'maria', 'juan'];
      if (ocupados.includes(domain)) {
        setDomainAvailable(false);
        setShowStatus({ message: `❌ ${domain}.panor no disponible`, type: "error" });
      } else {
        setDomainAvailable(true);
        setShowStatus({ message: `✅ ¡${domain}.panor disponible!`, type: "success" });
      }
      setSearching(false);
      setTimeout(() => setShowStatus(null), 5000);
    }, 1000);
  };

  const handleRegisterDomain = async () => {
    if (!domainName.trim() || domainAvailable !== true) {
      setShowStatus({ message: "⚠️ Verifica disponibilidad primero", type: "warning" });
      setTimeout(() => setShowStatus(null), 3000);
      return;
    }
    if (typeof window === 'undefined' || !window.ethereum) {
      setShowStatus({ message: "🔗 Instala MetaMask", type: "error" });
      setTimeout(() => setShowStatus(null), 5000);
      return;
    }
    setIsLoading(true);
    try {
      let currentAddress = walletAddress;
      if (!currentAddress) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAddress = accounts[0];
        setWalletAddress(accounts[0]);
        setIsUserConnected(true);
      }
      await switchToAmoy();
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== AMOY_CHAIN_ID) {
        setShowStatus({ message: "❌ Cambia a Polygon Amoy", type: "error" });
        setIsLoading(false);
        return;
      }
      setShowStatus({ message: "🦊 Confirma en MetaMask...", type: "info" });

      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const TOTUM_ABI = [
        "function registrarIdentidad(string memory _nombre, string memory _dominio, string memory _hashDocumento) public",
        "function verificarSiRegistrado(address _usuario) public view returns (bool)"
      ];
      const TOKEN_ABI = [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function balanceOf(address account) public view returns (uint256)"
      ];

      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const totumContract = new ethers.Contract(TOTUM_ADDRESS, TOTUM_ABI, signer);

      const yaRegistrado = await totumContract.verificarSiRegistrado(currentAddress);
      if (yaRegistrado) {
        setShowStatus({ message: "⚠️ Esta wallet ya tiene dominio", type: "warning" });
        setIsLoading(false);
        setTimeout(() => setShowStatus(null), 6000);
        return;
      }

      const balance = await tokenContract.balanceOf(currentAddress);
      const balanceFormatted = ethers.formatEther(balance);
      if (parseFloat(balanceFormatted) < 100) {
        setShowStatus({
          message: `⚠️ Necesitas 100 PANOR. Tienes: ${parseFloat(balanceFormatted).toFixed(2)}`,
          type: "warning"
        });
        setIsLoading(false);
        setTimeout(() => setShowStatus(null), 8000);
        return;
      }

      setShowStatus({ message: "🔓 Paso 1/2: Aprobando...", type: "info" });
      const approveTx = await tokenContract.approve(TOTUM_ADDRESS, ethers.parseEther('1000'), GAS_CONFIG);
      await approveTx.wait();

      setShowStatus({ message: "🌿 Paso 2/2: Registrando...", type: "info" });
      const hashDocumento = ethers.keccak256(ethers.toUtf8Bytes(`identity-${currentAddress}-${Date.now()}`));
      const registerTx = await totumContract.registrarIdentidad(
        domainName.toLowerCase(),
        domainName.toLowerCase(),
        hashDocumento,
        GAS_CONFIG
      );
      const receipt = await registerTx.wait();

      const fullDomain = `${domainName.toLowerCase()}.panor`;
      setUserDomain(fullDomain);
      setShowStatus({
        message: `🎉 ¡${fullDomain} registrado! TX: ${receipt.hash.slice(0, 16)}...`,
        type: "success"
      });
      localStorage.setItem('panor_domain', fullDomain);
      setIsLoading(false);
      setTimeout(() => setShowStatus(null), 10000);
    } catch (error: any) {
      let msg = "❌ Error al registrar";
      if (error.code === 4001) msg = "❌ Cancelaste";
      else if (error.message?.includes("insufficient funds")) msg = "❌ Fondos insuficientes";
      else if (error.message?.includes("usuario ya esta registrado")) msg = "❌ Wallet ya tiene dominio";
      else if (error.message) msg = `❌ ${error.message.slice(0, 60)}`;
      setShowStatus({ message: msg, type: "error" });
      setIsLoading(false);
      setTimeout(() => setShowStatus(null), 8000);
    }
  };

  const handleRegisterIntellectual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      setShowStatus({ message: "⚠️ Conecta tu wallet", type: "warning" });
      setTimeout(() => setShowStatus(null), 3000);
      return;
    }
    if (!projectName.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      const mockHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setGeneratedHash(mockHash.slice(0, 20) + "...");
      setShowStatus({ message: `🧠 ¡"${projectName}" protegido!`, type: "success" });
      setIsLoading(false);
      setTimeout(() => setShowStatus(null), 5000);
    }, 1500);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.8,
      hue: Math.random() * 60 + 180,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      particles.forEach((p) => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250 && dist > 0) {
          const force = (250 - dist) / 250 * 0.15;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const distToMouse = Math.sqrt((mouse.x - p.x) ** 2 + (mouse.y - p.y) ** 2);
        const glow = distToMouse < 200 ? 1 - distToMouse / 200 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + glow * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, ${60 + glow * 20}%, ${0.5 + glow * 0.5})`;
        ctx.shadowBlur = glow * 15;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 70%, ${glow})`;
        ctx.fill();
      });

      ctx.shadowBlur = 0;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            const mx = (particles[i].x + particles[j].x) / 2;
            const my = (particles[i].y + particles[j].y) / 2;
            const dMouse = Math.sqrt((mouse.x - mx) ** 2 + (mouse.y - my) ** 2);
            const proximityGlow = dMouse < 200 ? 1 - dMouse / 200 : 0;

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${particles[i].hue}, 80%, 60%, ${(0.12 - d / 1500) + proximityGlow * 0.3})`;
            ctx.lineWidth = 0.5 + proximityGlow * 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `hsla(200, 100%, 70%, ${0.4 - d / 300})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      const cursorGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 40);
      cursorGlow.addColorStop(0, 'hsla(200, 100%, 70%, 0.3)');
      cursorGlow.addColorStop(1, 'hsla(200, 100%, 70%, 0)');
      ctx.fillStyle = cursorGlow;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#020024] flex flex-col">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      <div className="absolute top-10 left-5 w-40 h-40 bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* ═══ CONTENIDO ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-3">
            <div className="w-14 h-14 bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-pulse-slow">
              🌳
            </div>
            <h1 className="ml-3 text-4xl font-bold text-white tracking-wider drop-shadow-[0_0_25px_rgba(0,212,255,0.5)]">
              TOTUM
            </h1>
          </div>
          <p className="text-white text-sm font-bold tracking-[0.35em] uppercase">CRUZANDO BARRERAS</p>
          <p className="text-white text-sm font-bold tracking-[0.35em] uppercase">FÍSICAS ⇔ DIGITALES</p>
          <p className="text-cyan-300 text-[10px] tracking-[0.35em] uppercase mt-2">CONECTANDO FRONTERAS</p>
          <p className="text-pink-300 text-[9px] tracking-[0.25em] uppercase">Físicas ✧ Digitales</p>
        </div>

        {/* STATUS */}
        {showStatus && (
          <div className={`mb-4 p-3 rounded-xl text-[11px] backdrop-blur-xl border ${
            showStatus.type === "success" ? "bg-green-500/20 border-green-500/40 text-green-200" :
            showStatus.type === "error" ? "bg-red-500/20 border-red-500/40 text-red-200" :
            showStatus.type === "info" ? "bg-blue-500/20 border-blue-500/40 text-blue-200" :
            "bg-yellow-500/20 border-yellow-500/40 text-yellow-200"
          }`} style={{ width: '384px' }}>
            {showStatus.message}
          </div>
        )}

        {/* ═══ CARD 1 - DOMINIO ═══ */}
        <div className="relative group mb-4" style={{ width: '384px' }}>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-[28px] opacity-30 group-hover:opacity-70 blur-md transition-all duration-700 animate-pulse-slow pointer-events-none" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-3xl opacity-40 group-hover:opacity-100 transition-all duration-700 blur-sm pointer-events-none" />
          
          <div className="relative bg-[#05051a]/95 backdrop-blur-2xl rounded-3xl p-5 border border-cyan-400/30 group-hover:border-cyan-400/70 transition-all duration-500 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-gradient-to-br from-cyan-500/40 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
            
            <div className="absolute -left-3 top-4 w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-base shadow-[0_0_25px_rgba(0,212,255,0.8)] border-2 border-[#020024] z-10 animate-float">
              🌱
            </div>
            <div className="absolute -right-3 top-4 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-base shadow-[0_0_25px_rgba(168,85,247,0.8)] border-2 border-[#020024] z-10 animate-float-delayed">
              ⚡
            </div>
            
            <div className="flex items-center justify-between mb-3 pl-8 pr-8 relative z-10">
              <h2 className="text-base font-bold tracking-wide bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Crea tu dominio .panor
              </h2>
              <button
                onClick={() => setShowSearchInfo(!showSearchInfo)}
                className="text-cyan-300 text-[10px] border border-cyan-400/50 rounded-full w-5 h-5 flex items-center justify-center hover:bg-cyan-400/20 transition-all hover:scale-110 flex-shrink-0"
              >
                i
              </button>
            </div>

            {showSearchInfo && (
              <div className="bg-black/80 rounded-xl p-3 mb-3 text-left text-[11px] text-gray-300 border border-cyan-400/30 relative z-10">
                Tu identidad digital descentralizada. Una wallet = Un dominio único.
              </div>
            )}

            <div className="flex items-stretch gap-0 mb-3 relative z-10">
              <input
                type="text"
                placeholder="darwin"
                value={domainName}
                onChange={(e) => {
                  setDomainName(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
                  setDomainAvailable(null);
                }}
                className="flex-1 bg-black/70 border border-r-0 border-cyan-400/50 rounded-l-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_20px_rgba(0,212,255,0.5)] text-sm transition-all"
                maxLength={20}
              />
              <div className="bg-gradient-to-r from-cyan-500/40 to-blue-500/40 border border-l-0 border-cyan-400/50 rounded-r-xl py-2.5 px-4 flex items-center">
                <span className="text-cyan-300 font-bold text-sm tracking-wide">.panor</span>
              </div>
            </div>

            {domainName && domainAvailable === null && (
              <button
                onClick={handleSearchDomain}
                disabled={searching}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_25px_rgba(0,212,255,0.5)] relative z-10 hover:scale-[1.02]"
              >
                {searching ? "Verificando..." : "🔍 Verificar Disponibilidad"}
              </button>
            )}

            {domainAvailable === true && (
              <div className="space-y-2 relative z-10">
                <div className="bg-gradient-to-r from-green-500/30 to-cyan-500/30 border border-green-400/60 rounded-xl p-2.5 text-center">
                  <p className="text-green-200 text-xs font-bold">✅ {domainName}.panor disponible</p>
                </div>
                <button
                  onClick={handleRegisterDomain}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 hover:opacity-90 text-white font-bold text-sm py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(0,255,150,0.5)] hover:scale-[1.02]"
                >
                  {isLoading ? "Procesando..." : "🌿 Registrar con MetaMask"}
                </button>
                <button
                  onClick={() => { setDomainAvailable(null); setDomainName(''); }}
                  className="w-full text-gray-400 text-[10px] hover:text-white transition-colors py-1"
                >
                  ← Buscar otro
                </button>
              </div>
            )}

            {domainAvailable === false && (
              <div className="space-y-2 relative z-10">
                <div className="bg-gradient-to-r from-red-500/30 to-pink-500/30 border border-red-400/60 rounded-xl p-2.5 text-center">
                  <p className="text-red-200 text-xs font-bold">❌ {domainName}.panor ya registrado</p>
                </div>
                <button
                  onClick={() => { setDomainAvailable(null); setDomainName(''); }}
                  className="w-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border border-cyan-400/60 hover:bg-cyan-500/40 text-cyan-200 font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  ← Probar otro
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ═══ CARD 2 - ACORTADOR ═══ */}
        <div className="relative group mb-4" style={{ width: '384px' }}>
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-[28px] opacity-30 group-hover:opacity-70 blur-md transition-all duration-700 animate-pulse-slow pointer-events-none" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-3xl opacity-40 group-hover:opacity-100 transition-all duration-700 blur-sm pointer-events-none" />
          
          <div className="relative bg-[#05051a]/95 backdrop-blur-2xl rounded-3xl p-5 border border-purple-400/30 group-hover:border-purple-400/70 transition-all duration-500 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-gradient-to-br from-purple-500/40 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
            
            <div className="absolute -left-3 top-4 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-base shadow-[0_0_25px_rgba(168,85,247,0.8)] border-2 border-[#020024] z-10 animate-float">
              🦋
            </div>
            <div className="absolute -right-3 top-4 w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-base shadow-[0_0_25px_rgba(236,72,153,0.8)] border-2 border-[#020024] z-10 animate-float-delayed">
              ✨
            </div>
            
            <div className="flex items-center justify-between mb-3 pl-8 pr-8 relative z-10">
              <h2 className="text-base font-bold tracking-wide bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Acorta tu dirección
              </h2>
              <button
                onClick={() => setShowShortenInfo(!showShortenInfo)}
                className="text-purple-300 text-[10px] border border-purple-400/50 rounded-full w-5 h-5 flex items-center justify-center hover:bg-purple-400/20 transition-all hover:scale-110 flex-shrink-0"
              >
                i
              </button>
            </div>

            {showShortenInfo && (
              <div className="bg-black/80 rounded-xl p-3 mb-3 text-left text-[11px] text-gray-300 border border-purple-400/30 relative z-10">
                Tu nombre + 4 números. Fácil de recordar.
              </div>
            )}

            <div className="flex items-stretch gap-0 mb-3 relative z-10">
              <input
                type="text"
                placeholder="anna1900"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())}
                className="flex-1 bg-black/70 border border-r-0 border-purple-400/50 rounded-l-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:shadow-[0_0_20px_rgba(168,85,247,0.5)] text-sm transition-all"
                maxLength={20}
              />
              <div className="bg-gradient-to-r from-purple-500/40 to-pink-500/40 border border-l-0 border-purple-400/50 rounded-r-xl py-2.5 px-4 flex items-center">
                <span className="text-purple-300 font-bold text-sm tracking-wide">.panor</span>
              </div>
            </div>

            <button
              onClick={handleRegisterDomain}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:opacity-90 text-white font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_25px_rgba(168,85,247,0.5)] relative z-10 hover:scale-[1.02]"
            >
              {isLoading ? "Creando..." : "🦋 Acortar Dirección"}
            </button>
          </div>
        </div>

        {/* ═══ CARD 3 - INTELECTUAL ═══ */}
        <div className="relative group mb-6" style={{ width: '384px' }}>
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-[28px] opacity-30 group-hover:opacity-70 blur-md transition-all duration-700 animate-pulse-slow pointer-events-none" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 rounded-3xl opacity-40 group-hover:opacity-100 transition-all duration-700 blur-sm pointer-events-none" />
          
          <div className="relative bg-[#05051a]/95 backdrop-blur-2xl rounded-3xl p-5 border border-pink-400/30 group-hover:border-pink-400/70 transition-all duration-500 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-gradient-to-br from-pink-500/40 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
            
            <div className="absolute -left-3 top-4 w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-base shadow-[0_0_25px_rgba(236,72,153,0.8)] border-2 border-[#020024] z-10 animate-float">
              🧠
            </div>
            <div className="absolute -right-3 top-4 w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-base shadow-[0_0_25px_rgba(0,212,255,0.8)] border-2 border-[#020024] z-10 animate-float-delayed">
              🛡️
            </div>
            
            <div className="flex items-center justify-between mb-3 pl-8 pr-8 relative z-10">
              <h2 className="text-base font-bold tracking-wide bg-gradient-to-r from-pink-300 via-cyan-300 to-pink-300 bg-clip-text text-transparent">
                Intelectual — Protege tu idea
              </h2>
              <button
                onClick={() => setShowIntellectualInfo(!showIntellectualInfo)}
                className="text-pink-300 text-[10px] border border-pink-400/50 rounded-full w-5 h-5 flex items-center justify-center hover:bg-pink-400/20 transition-all hover:scale-110 flex-shrink-0"
              >
                i
              </button>
            </div>

            {showIntellectualInfo && (
              <div className="bg-black/80 rounded-xl p-3 mb-3 text-left text-[11px] text-gray-300 border border-pink-400/30 relative z-10">
                Huella criptográfica + tecnología VERT. Demuestra que tú creaste tu obra.
              </div>
            )}

            <form onSubmit={handleRegisterIntellectual} className="flex gap-2 relative z-10">
              <input
                type="text"
                placeholder="Mi proyecto"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="flex-1 bg-black/70 border border-pink-400/50 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-300 focus:shadow-[0_0_20px_rgba(236,72,153,0.5)] text-sm transition-all"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white font-bold text-xs px-4 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:scale-105"
              >
                🧠
              </button>
            </form>

            {generatedHash && (
              <div className="mt-3 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-xl p-2.5 border border-pink-400/50 relative z-10">
                <p className="text-pink-200 text-[10px] font-mono break-all text-center">
                  {generatedHash}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* WALLET */}
        {isUserConnected && walletAddress ? (
          <div className="relative" style={{ width: '384px' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-40 blur-md animate-pulse-slow pointer-events-none" />
            <div className="relative bg-[#05051a]/95 backdrop-blur-2xl rounded-2xl p-4 border border-cyan-400/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(74,222,128,1)]" />
                  <span className="text-green-400 text-[11px] font-bold">
                    {userDomain ? `✦ ${userDomain}` : "Wallet conectada"}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">{networkName}</span>
              </div>
              <p className="font-mono text-cyan-300 break-all text-[10px] mb-2 text-center">
                {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
              </p>
              <button
                onClick={() => {
                  setIsUserConnected(false);
                  setWalletAddress(null);
                  setUserDomain(null);
                }}
                className="w-full text-gray-400 text-[10px] hover:text-red-400 transition-colors"
              >
                Desconectar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-sm py-3 px-10 rounded-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_45px_rgba(168,85,247,0.9)] disabled:opacity-50 hover:scale-105"
          >
            {isLoading ? "Conectando..." : "🌿 Conectar Wallet (MetaMask)"}
          </button>
        )}
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 text-center pb-4 px-4">
        <p className="text-gray-400 text-[10px] tracking-widest">
          @PANOR 2026 — ✦ Construyendo la Web4 con $PANOR ✦
        </p>
        <p className="text-gray-500 text-[9px] tracking-widest mt-1">
          Unificando la colaboración física y virtual
        </p>
      </footer>
    </main>
  );
}