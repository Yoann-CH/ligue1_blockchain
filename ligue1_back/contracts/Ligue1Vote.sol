// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Ligue1Vote {
    // Structure pour un club
    struct Club {
        uint256 id;
        string name;
        string logo;
        uint256 votes;
        bool exists;
    }
    
    // Mapping pour stocker les clubs
    mapping(uint256 => Club) public clubs;
    uint256 public clubCount;
    
    // Mapping pour vérifier si une adresse a déjà voté
    mapping(address => bool) public hasVoted;
    mapping(address => uint256) public voterChoice;
    
    // Propriétaire du contrat
    address public owner;
    
    // Événements
    event VoteCast(address indexed voter, uint256 indexed clubId, string clubName);
    event ClubAdded(uint256 indexed clubId, string name);
    
    // Modificateur pour le propriétaire
    modifier onlyOwner() {
        require(msg.sender == owner, "Seul le proprietaire peut effectuer cette action");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        _initializeClubs();
    }
    
    // Initialiser les clubs de Ligue 1
    function _initializeClubs() private {
        _addClub("Paris Saint-Germain", "https://upload.wikimedia.org/wikipedia/fr/8/86/Paris_Saint-Germain_Logo.svg");
        _addClub("Olympique de Marseille", "https://upload.wikimedia.org/wikipedia/fr/4/43/Logo_Olympique_de_Marseille.svg");
        _addClub("AS Monaco", "https://upload.wikimedia.org/wikipedia/fr/5/58/Logo_AS_Monaco_FC_-_2021.svg");
        _addClub("Olympique Lyonnais", "https://upload.wikimedia.org/wikipedia/fr/a/a5/Logo_Olympique_Lyonnais_-_2022.svg");
        _addClub("OGC Nice", "https://upload.wikimedia.org/wikipedia/fr/b/b1/Logo_OGC_Nice_2013.svg");
        _addClub("RC Lens", "https://upload.wikimedia.org/wikipedia/fr/c/c5/Logo_RC_Lens.svg");
        _addClub("Lille OSC", "https://upload.wikimedia.org/wikipedia/fr/6/62/Logo_LOSC_Lille_2018.svg");
        _addClub("Stade Rennais", "https://upload.wikimedia.org/wikipedia/fr/e/e9/Logo_Stade_Rennais_FC.svg");
        _addClub("RC Strasbourg", "https://upload.wikimedia.org/wikipedia/fr/3/3c/Logo_RC_Strasbourg_-_1976.svg");
        _addClub("Nantes", "https://upload.wikimedia.org/wikipedia/commons/4/45/Logo_FC_Nantes_%28avec_fond%29_-_2019.svg");
        _addClub("Montpellier HSC", "https://upload.wikimedia.org/wikipedia/commons/9/99/Montpellier_H%C3%A9rault_Sport_Club_%28logo%2C_2000%29.svg");
        _addClub("Stade Brestois", "https://upload.wikimedia.org/wikipedia/fr/1/14/Logo_Stade_Brestois.svg");
        _addClub("Le Havre AC", "https://upload.wikimedia.org/wikipedia/fr/e/e6/Logo_Havre_AC_2012.svg");
        _addClub("FC Metz", "https://upload.wikimedia.org/wikipedia/commons/4/4a/FC_Metz_2021_Logo.svg");
        _addClub("Toulouse FC", "https://upload.wikimedia.org/wikipedia/fr/5/58/Toulouse_FC_logo_2021.svg");
        _addClub("Stade de Reims", "https://upload.wikimedia.org/wikipedia/fr/9/9f/Logo_Stade_de_Reims_-_2020.svg");
        _addClub("Clermont Foot", "https://upload.wikimedia.org/wikipedia/fr/2/22/Logo_Clermont_Foot_63_2021.svg");
        _addClub("FC Lorient", "https://upload.wikimedia.org/wikipedia/fr/1/1d/Logo_FC_Lorient_Bretagne-Sud.svg");
    }
    
    // Ajouter un club (privé)
    function _addClub(string memory _name, string memory _logo) private {
        clubCount++;
        clubs[clubCount] = Club(clubCount, _name, _logo, 0, true);
        emit ClubAdded(clubCount, _name);
    }
    
    // Voter pour un club
    function vote(uint256 _clubId) external {
        require(!hasVoted[msg.sender], "Vous avez deja vote");
        require(_clubId > 0 && _clubId <= clubCount, "Club invalide");
        require(clubs[_clubId].exists, "Ce club n'existe pas");
        
        hasVoted[msg.sender] = true;
        voterChoice[msg.sender] = _clubId;
        clubs[_clubId].votes++;
        
        emit VoteCast(msg.sender, _clubId, clubs[_clubId].name);
    }
    
    // Récupérer les informations d'un club
    function getClub(uint256 _clubId) external view returns (Club memory) {
        require(_clubId > 0 && _clubId <= clubCount, "Club invalide");
        return clubs[_clubId];
    }
    
    // Récupérer tous les clubs avec leurs votes
    function getAllClubs() external view returns (Club[] memory) {
        Club[] memory allClubs = new Club[](clubCount);
        for (uint256 i = 1; i <= clubCount; i++) {
            allClubs[i-1] = clubs[i];
        }
        return allClubs;
    }
    
    // Récupérer les résultats triés par votes
    function getResults() external view returns (Club[] memory) {
        Club[] memory results = new Club[](clubCount);
        for (uint256 i = 1; i <= clubCount; i++) {
            results[i-1] = clubs[i];
        }
        
        // Tri par bulles (simple pour la démo)
        for (uint256 i = 0; i < clubCount - 1; i++) {
            for (uint256 j = 0; j < clubCount - i - 1; j++) {
                if (results[j].votes < results[j + 1].votes) {
                    Club memory temp = results[j];
                    results[j] = results[j + 1];
                    results[j + 1] = temp;
                }
            }
        }
        
        return results;
    }
    
    // Vérifier si une adresse a voté
    function checkHasVoted(address _voter) external view returns (bool) {
        return hasVoted[_voter];
    }
    
    // Récupérer le choix d'un votant
    function getVoterChoice(address _voter) external view returns (uint256) {
        require(hasVoted[_voter], "Cette adresse n'a pas encore vote");
        return voterChoice[_voter];
    }
    
    // Récupérer le total des votes
    function getTotalVotes() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= clubCount; i++) {
            total += clubs[i].votes;
        }
        return total;
    }
} 