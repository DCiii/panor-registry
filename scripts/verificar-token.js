const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x21C0a08537984bc88E8b89E1c2EEd3234D61549f";
  
  console.log(`🔍 Verificando token PANOR en: ${tokenAddress}`);
  
  try {
    const PanorToken = await hre.ethers.getContractFactory("PanorToken");
    const token = PanorToken.attach(tokenAddress);
    
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const totalSupply = await token.totalSupply();
    
    const [deployer] = await hre.ethers.getSigners();
    const balance = await token.balanceOf(deployer.address);
    
    console.log(`✅ Token: ${name} (${symbol})`);
    console.log(`📊 Decimales: ${decimals}`);
    console.log(`💰 Supply total: ${hre.ethers.formatEther(totalSupply)}`);
    console.log(`💰 Balance deployer: ${hre.ethers.formatEther(balance)}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);