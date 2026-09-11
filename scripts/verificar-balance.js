const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Verificando balance de: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} POL`);
  
  if (balance < hre.ethers.parseEther("0.05")) {
    console.log("\n⚠️ BALANCE BAJO - Necesitas POL para desplegar");
    console.log("🔗 Obtén POL en: https://faucet.polygon.technology/");
    console.log(`📤 Tu dirección: ${deployer.address}`);
  } else {
    console.log("\n✅ Balance suficiente para desplegar");
  }
}

main().catch(console.error);