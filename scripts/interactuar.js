const hre = require("hardhat");

async function main() {
  const config = require("../deployed.json");
  
  console.log("🔗 Interactuando con TOTUM...\n");
  console.log(`Token: ${config.tokenAddress}`);
  console.log(`TOTUM: ${config.totumAddress}\n`);

  const [signer] = await hre.ethers.getSigners();
  
  // Cargar contratos
  const Totum = await hre.ethers.getContractFactory("Totum");
  const totum = Totum.attach(config.totumAddress);
  
  const PanorToken = await hre.ethers.getContractFactory("PanorToken");
  const token = PanorToken.attach(config.tokenAddress);
  
  // Consultar identidad
  const identidad = await totum.obtenerIdentidad(signer.address);
  console.log("👤 Tu identidad:");
  console.log(`  Nombre: ${identidad.nombre}`);
  console.log(`  Dominio: ${identidad.dominio}`);
  console.log(`  Reputación: ${identidad.reputacion.toString()}\n`);
  
  // Consultar balance
  const balance = await token.balanceOf(signer.address);
  console.log(`💰 Balance PANOR: ${hre.ethers.formatEther(balance)} PANOR\n`);
  
  // Consultar propiedades
  const propiedades = await totum.obtenerPropiedadesUsuario(signer.address);
  console.log(`🧠 Propiedades registradas: ${propiedades.length}\n`);
}

main().catch(console.error);