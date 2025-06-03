const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Déploiement du contrat Ligue1Vote...");

  // Récupérer le signataire par défaut
  const [deployer] = await ethers.getSigners();
  console.log("📝 Déploiement avec le compte:", deployer.address);

  // Vérifier le solde
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Solde du compte:", ethers.formatEther(balance), "ETH");

  // Déployer le contrat
  const Ligue1Vote = await ethers.getContractFactory("Ligue1Vote");
  const ligue1Vote = await Ligue1Vote.deploy();

  await ligue1Vote.waitForDeployment();
  const contractAddress = await ligue1Vote.getAddress();

  console.log("✅ Contrat Ligue1Vote déployé à l'adresse:", contractAddress);

  // Vérifier que le contrat fonctionne
  const clubCount = await ligue1Vote.clubCount();
  console.log("🏆 Nombre de clubs initialisés:", clubCount.toString());

  // Afficher quelques clubs pour vérification
  const psg = await ligue1Vote.getClub(1);
  const om = await ligue1Vote.getClub(2);
  
  console.log("⚽ Premier club:", psg.name);
  console.log("⚽ Deuxième club:", om.name);

  // Sauvegarder l'adresse du contrat pour l'utiliser dans le backend
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    './deployed-contract.json',
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("📄 Informations du contrat sauvegardées dans deployed-contract.json");
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur lors du déploiement:", error);
    process.exit(1);
  }); 