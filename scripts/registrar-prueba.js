const hre = require("hardhat");

async function main() {
  const TOTUM_ADDRESS = "0x7d64B65267E51Cc34F5C562209562430AD1f5BC7";
  const TOKEN_ADDRESS = "0xD0aAe45DF910b363918b59A98110F630BB4a6296";
  
  console.log("🚀 ========================================");
  console.log("🚀 REGISTRANDO IDENTIDAD + PROPIEDAD INTELECTUAL");
  console.log("🚀 ========================================\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}`);
  
  const polBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance POL: ${hre.ethers.formatEther(polBalance)} POL\n`);

  // Cargar contratos
  const Totum = await hre.ethers.getContractFactory("Totum");
  const totum = Totum.attach(TOTUM_ADDRESS);
  
  const PanorToken = await hre.ethers.getContractFactory("PanorToken");
  const token = PanorToken.attach(TOKEN_ADDRESS);

  // Verificar balance PANOR
  const panorBalance = await token.balanceOf(deployer.address);
  console.log(`🪙 Balance PANOR: ${hre.ethers.formatEther(panorBalance)} PANOR\n`);

  // Verificar allowance
  const allowance = await token.allowance(deployer.address, TOTUM_ADDRESS);
  console.log(`✅ Allowance TOTUM: ${hre.ethers.formatEther(allowance)} PANOR\n`);

  // Si no hay allowance, aprobar
  if (allowance < hre.ethers.parseEther("1000")) {
    console.log("🔓 Aprobando PANOR para TOTUM...");
    const approveTx = await token.approve(TOTUM_ADDRESS, hre.ethers.parseEther("5000"));
    await approveTx.wait();
    console.log("✅ Aprobado\n");
  }

  // Registrar identidad
  console.log("👤 [1/2] Registrando identidad 'genesis.panor'...");
  try {
    const registerTx = await totum.registrarIdentidad(
      "Panor Genesis",
      "genesis",
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    );
    const receipt = await registerTx.wait();
    console.log(`✅ Identidad registrada!`);
    console.log(`   TX: https://amoy.polygonscan.com/tx/${receipt.hash}\n`);
  } catch (error) {
    console.log(`⚠️  ${error.message}\n`);
  }

  // Consultar identidad
  const identidad = await totum.obtenerIdentidad(deployer.address);
  console.log("📋 Tu identidad en la Web4:");
  console.log(`   Nombre:      ${identidad.nombre}`);
  console.log(`   Dominio:     ${identidad.dominio}`);
  console.log(`   Reputación:  ${identidad.reputacion.toString()}`);
  console.log(`   Verificada:  ${identidad.estaVerificada}\n`);

  // Registrar propiedad intelectual
  console.log("🧠 [2/2] Registrando propiedad intelectual...");
  try {
    const hashTest = hre.ethers.keccak256(
      hre.ethers.toUtf8Bytes("TOTUM: La revolucion de la identidad digital - " + Date.now())
    );
    const ipTx = await totum.registrarPropiedadIntelectual(
      "TOTUM Whitepaper",
      hashTest,
      50
    );
    const ipReceipt = await ipTx.wait();
    console.log(`✅ Propiedad intelectual registrada!`);
    console.log(`   TX: https://amoy.polygonscan.com/tx/${ipReceipt.hash}\n`);
  } catch (error) {
    console.log(`⚠️  ${error.message}\n`);
  }

  // Resumen final
  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  const finalPanor = await token.balanceOf(deployer.address);
  
  console.log("✨ ========================================");
  console.log("✨ REGISTRO COMPLETO");
  console.log("✨ ========================================\n");
  
  console.log("📊 ESTADO FINAL:");
  console.log(`   POL restante:   ${hre.ethers.formatEther(finalBalance)} POL`);
  console.log(`   PANOR restante: ${hre.ethers.formatEther(finalPanor)} PANOR\n`);
  
  console.log("🔗 VER EN POLYGONSCAN:");
  console.log(`   Token:    https://amoy.polygonscan.com/address/${TOKEN_ADDRESS}`);
  console.log(`   TOTUM:    https://amoy.polygonscan.com/address/${TOTUM_ADDRESS}`);
  console.log(`   Deployer: https://amoy.polygonscan.com/address/${deployer.address}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });