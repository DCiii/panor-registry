const hre = require("hardhat");

async function main() {
  // ⚠️ REEMPLAZA con tu NUEVA wallet
  const DESTINATION = "0x33eF3D4210BC1Aa74A60C2b1FBbB57e0fCf115C1";
  
  const TOKEN_ADDRESS = "0xD0aAe45DF910b363918b59A98110F630BB4a6296";
  const POL_AMOUNT = "0.02";
  const PANOR_AMOUNT = "500";

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📤 Enviando desde: ${deployer.address}`);
  console.log(`📥 Hacia: ${DESTINATION}\n`);

  // 1. Enviar POL
  console.log("💰 Enviando POL...");
  const polTx = await deployer.sendTransaction({
    to: DESTINATION,
    value: hre.ethers.parseEther(POL_AMOUNT),
  });
  await polTx.wait();
  console.log(`✅ ${POL_AMOUNT} POL enviados\n`);

  // 2. Enviar PANOR
  console.log("🪙 Enviando PANOR...");
  const PanorToken = await hre.ethers.getContractFactory("PanorToken");
  const token = PanorToken.attach(TOKEN_ADDRESS);
  const panorTx = await token.transfer(DESTINATION, hre.ethers.parseEther(PANOR_AMOUNT));
  await panorTx.wait();
  console.log(`✅ ${PANOR_AMOUNT} PANOR enviados\n`);

  console.log("🎉 ¡Listo para usar la nueva wallet!");
}

main().catch(console.error);