const hre = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = "0xD0aAe45DF910b363918b59A98110F630BB4a6296";
  const DESTINATION = "0x8323E6860551867c3c3eb9f4BA4B7e8544Ee3684";
  const AMOUNT = "1000";

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📤 Enviando desde: ${deployer.address}`);
  console.log(`📥 Hacia: ${DESTINATION}`);
  console.log(`🪙 Cantidad: ${AMOUNT} PANOR\n`);

  const PanorToken = await hre.ethers.getContractFactory("PanorToken");
  const token = PanorToken.attach(TOKEN_ADDRESS);

  const tx = await token.transfer(DESTINATION, hre.ethers.parseEther(AMOUNT));
  await tx.wait();
  
  console.log(`✅ ${AMOUNT} PANOR enviados!`);
  console.log(`🔗 TX: https://amoy.polygonscan.com/tx/${tx.hash}`);
}

main().catch(console.error);