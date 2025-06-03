const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ligue1Vote", function () {
  let ligue1Vote;
  let owner;
  let voter1;
  let voter2;
  let addrs;

  beforeEach(async function () {
    [owner, voter1, voter2, ...addrs] = await ethers.getSigners();
    
    const Ligue1Vote = await ethers.getContractFactory("Ligue1Vote");
    ligue1Vote = await Ligue1Vote.deploy();
    await ligue1Vote.waitForDeployment();
  });

  describe("Déploiement", function () {
    it("Devrait définir le bon propriétaire", async function () {
      expect(await ligue1Vote.owner()).to.equal(owner.address);
    });

    it("Devrait initialiser 18 clubs", async function () {
      expect(await ligue1Vote.clubCount()).to.equal(18);
    });

    it("Devrait avoir Paris Saint-Germain comme premier club", async function () {
      const club = await ligue1Vote.getClub(1);
      expect(club.name).to.equal("Paris Saint-Germain");
      expect(club.votes).to.equal(0);
    });
  });

  describe("Voting", function () {
    it("Devrait permettre à un utilisateur de voter", async function () {
      await expect(ligue1Vote.connect(voter1).vote(1))
        .to.emit(ligue1Vote, "VoteCast")
        .withArgs(voter1.address, 1, "Paris Saint-Germain");

      const club = await ligue1Vote.getClub(1);
      expect(club.votes).to.equal(1);
    });

    it("Devrait empêcher le double vote", async function () {
      await ligue1Vote.connect(voter1).vote(1);
      
      await expect(ligue1Vote.connect(voter1).vote(2))
        .to.be.revertedWith("Vous avez deja vote");
    });

    it("Devrait empêcher de voter pour un club inexistant", async function () {
      await expect(ligue1Vote.connect(voter1).vote(0))
        .to.be.revertedWith("Club invalide");
      
      await expect(ligue1Vote.connect(voter1).vote(20))
        .to.be.revertedWith("Club invalide");
    });

    it("Devrait suivre qui a voté", async function () {
      expect(await ligue1Vote.checkHasVoted(voter1.address)).to.be.false;
      
      await ligue1Vote.connect(voter1).vote(1);
      
      expect(await ligue1Vote.checkHasVoted(voter1.address)).to.be.true;
      expect(await ligue1Vote.getVoterChoice(voter1.address)).to.equal(1);
    });
  });

  describe("Résultats", function () {
    beforeEach(async function () {
      // Setup: voter1 vote pour PSG (id:1), voter2 vote pour OM (id:2)
      await ligue1Vote.connect(voter1).vote(1);
      await ligue1Vote.connect(voter2).vote(2);
    });

    it("Devrait retourner tous les clubs", async function () {
      const clubs = await ligue1Vote.getAllClubs();
      expect(clubs.length).to.equal(18);
      expect(clubs[0].name).to.equal("Paris Saint-Germain");
    });

    it("Devrait calculer le total des votes", async function () {
      expect(await ligue1Vote.getTotalVotes()).to.equal(2);
    });

    it("Devrait retourner les résultats triés", async function () {
      const results = await ligue1Vote.getResults();
      // Les clubs avec le plus de votes devraient être en premier
      expect(results[0].votes).to.be.gte(results[1].votes);
    });
  });

  describe("Sécurité", function () {
    it("Devrait rejeter les votes de clubs inexistants", async function () {
      await expect(ligue1Vote.connect(voter1).vote(999))
        .to.be.revertedWith("Club invalide");
    });

    it("Devrait protéger contre les tentatives de re-vote", async function () {
      await ligue1Vote.connect(voter1).vote(1);
      
      // Tenter de voter à nouveau devrait échouer
      await expect(ligue1Vote.connect(voter1).vote(1))
        .to.be.revertedWith("Vous avez deja vote");
    });
  });
}); 