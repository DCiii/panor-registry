const hre = require("hardhat");

async function main() {
  const DESTINATION = "0x8323E6860551867c3c3eb9f4BA4B7e8544Ee3684";
  const AMOUNT = "0.03"; // 0.03 POL

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Enviando desde: ${deployer.address}`);
  console.log(`Hacia: ${DESTINATION}`);

  const tx = await deployer.sendTransaction({
    to: DESTINATION,
    value: hre.ethers.parseEther(AMOUNT),
  });

  await tx.wait();
  console.log(`✅ ${AMOUNT} POL enviados!`);
  console.log(`TX: https://amoy.polygonscan.com/tx/${tx.hash}`);
}

main().catch(console.error);