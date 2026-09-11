const hre = require("hardhat");

async function main() {
  const MY_WALLET = "0x8323E6860551867c3c3eb9f4BA4B7e8544Ee3684";
  const TOKEN_ADDRESS = "0xD0aAe45DF910b363918b59A98110F630BB4a6296";

  console.log(`📍 Wallet: ${MY_WALLET}\n`);

  // Verificar POL
  const polBalance = await hre.ethers.provider.getBalance(MY_WALLET);
  console.log(`💰 POL: ${hre.ethers.formatEther(polBalance)}`);

  // Verificar PANOR
  const PanorToken = await hre.ethers.getContractFactory("PanorToken");
  const token = PanorToken.attach(TOKEN_ADDRESS);
  const panorBalance = await token.balanceOf(MY_WALLET);
  console.log(`🪙 PANOR: ${hre.ethers.formatEther(panorBalance)}\n`);

  // Recomendaciones
  if (parseFloat(hre.ethers.formatEther(polBalance)) < 0.01) {
    console.log("⚠️  Necesitas POL: https://faucet.polygon.technology/");
  }
  if (parseFloat(hre.ethers.formatEther(panorBalance)) < 100) {
    console.log("⚠️  Necesitas PANOR: usa tu faucet");
  }
  if (parseFloat(hre.ethers.formatEther(polBalance)) >= 0.01 && 
      parseFloat(hre.ethers.formatEther(panorBalance)) >= 100) {
    console.log("✅ ¡Listo para la demo!");
  }
}

main().catch(console.error);