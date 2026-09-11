const hre = require("hardhat");

async function main() {
  console.log("🚀 ========================================");
  console.log("🚀 DESPLEGANDO ECOSISTEMA TOTUM + PANOR");
  console.log("🚀 ========================================\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} POL\n`);

  // ===== 1. TOKEN PANOR =====
  console.log("📦 [1/4] Desplegando Token PANOR...");
  const PanorToken = await hre.ethers.getContractFactory("PanorToken");
  const token = await PanorToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`✅ PANOR Token: ${tokenAddress}\n`);

  // ===== 2. CHAINLINK MOCK =====
  console.log("📦 [2/4] Desplegando Chainlink Mock...");
  const ChainlinkMock = await hre.ethers.getContractFactory("ChainlinkMock");
  const chainlink = await ChainlinkMock.deploy();
  await chainlink.waitForDeployment();
  const chainlinkAddress = await chainlink.getAddress();
  console.log(`✅ Chainlink Mock: ${chainlinkAddress}\n`);

  // ===== 3. TOTUM =====
  console.log("📦 [3/4] Desplegando TOTUM...");
  const Totum = await hre.ethers.getContractFactory("Totum");
  const totum = await Totum.deploy(tokenAddress, chainlinkAddress);
  await totum.waitForDeployment();
  const totumAddress = await totum.getAddress();
  console.log(`✅ TOTUM: ${totumAddress}\n`);

  // ===== 4. CONFIGURACIÓN INICIAL =====
  console.log("⚙️  [4/4] Configurando ecosistema...\n");
  
  // 4.1 Mintear tokens PANOR
  console.log("💰 Minteando 10,000 PANOR al deployer...");
  const mintAmount = hre.ethers.parseEther("10000");
  const mintTx = await token.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log(`✅ ${hre.ethers.formatEther(mintAmount)} PANOR minteados\n`);

  // 4.2 Aprobar TOTUM
  console.log("🔓 Aprobando TOTUM para gastar PANOR...");
  const approveAmount = hre.ethers.parseEther("5000");
  const approveTx = await token.approve(totumAddress, approveAmount);
  await approveTx.wait();
  console.log(`✅ TOTUM aprobado para gastar ${hre.ethers.formatEther(approveAmount)} PANOR\n`);

  // 4.3 Registrar identidad de prueba
  console.log("👤 Registrando identidad de prueba...");
  const registerTx = await totum.registrarIdentidad(
    "Panor Genesis",
    "genesis",
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  );
  await registerTx.wait();
  console.log("✅ Identidad 'genesis.panor' registrada\n");

  // 4.4 Registrar propiedad intelectual de prueba
  console.log("🧠 Registrando propiedad intelectual de prueba...");
  const hashTest = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("TOTUM: La revolucion de la identidad digital")
  );
  const ipTx = await totum.registrarPropiedadIntelectual(
    "TOTUM Whitepaper",
    hashTest,
    50
  );
  await ipTx.wait();
  console.log("✅ Propiedad intelectual registrada\n");

  // ===== RESUMEN FINAL =====
  console.log("✨ ========================================");
  console.log("✨ DESPLIEGUE COMPLETO - EXITO TOTAL");
  console.log("✨ ========================================\n");
  
  console.log("📋 DIRECCIONES DESPLEGADAS:");
  console.log(`  🪙 PANOR Token:    ${tokenAddress}`);
  console.log(`  🔗 Chainlink Mock: ${chainlinkAddress}`);
  console.log(`  🌳 TOTUM:          ${totumAddress}`);
  console.log(`  👤 Deployer:       ${deployer.address}\n`);
  
  console.log("🔗 VER EN POLYGONSCAN:");
  console.log(`  Token:    https://amoy.polygonscan.com/address/${tokenAddress}`);
  console.log(`  Chainlink: https://amoy.polygonscan.com/address/${chainlinkAddress}`);
  console.log(`  TOTUM:    https://amoy.polygonscan.com/address/${totumAddress}\n`);
  
  // ===== GUARDAR CONFIGURACIÓN =====
  const fs = require("fs");
  const config = {
    network: "amoy",
    chainId: 80002,
    tokenAddress,
    chainlinkAddress,
    totumAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync("deployed.json", JSON.stringify(config, null, 2));
  console.log("📄 Configuracion guardada en deployed.json\n");
  
  console.log("🎉 ¡ECOSISTEMA TOTUM LISTO PARA LA WEB4! 🎉");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ ERROR EN DESPLIEGUE:");
    console.error(error);
    process.exit(1);
  });