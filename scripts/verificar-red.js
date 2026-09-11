const hre = require("hardhat");

async function main() {
  console.log("🔍 Verificando conexión a la red...\n");
  
  try {
    const network = await hre.ethers.provider.getNetwork();
    console.log(`✅ Conectado a: ${network.name}`);
    console.log(`📊 Chain ID: ${network.chainId}`);
    
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log(`📦 Bloque actual: ${blockNumber}`);
    
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    
    console.log(`\n👤 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} POL`);
    
    if (balance < hre.ethers.parseEther("0.01")) {
      console.log("\n⚠️  BALANCE BAJO - Necesitas POL");
      console.log("🔗 Faucet: https://faucet.polygon.technology/");
    } else {
      console.log("\n✅ Balance suficiente para desplegar");
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
  }
}

main().catch(console.error);