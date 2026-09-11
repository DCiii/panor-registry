const hre = require("hardhat");

async function main() {
  console.log("🚀 Desplegando contrato TOTUM...");

  const TotumRegistry = await hre.ethers.getContractFactory("TotumRegistry");
  const contract = await TotumRegistry.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`✅ Contrato TOTUM desplegado en: ${address}`);
  console.log(`🔗 Ver en: https://sepolia.etherscan.io/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});