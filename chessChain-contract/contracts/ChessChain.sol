// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ChessChainDecentralized
 * @notice Plateforme d'échecs décentralisée avec mises en USDC/USDT
 * @dev Le frontend gère la logique du jeu avec chess.js, la blockchain gère uniquement les finances
 */
contract ChessChainDecentralized {
    
    // ==================== VARIABLES D'ÉTAT ====================
    
    IERC20 public immutable usdc;
    IERC20 public immutable usdt;
    address public immutable treasury;
    
    uint256 public constant FEE_PERCENT = 2;
    uint256 public constant MOVE_TIMEOUT = 15 minutes;
    
    enum GameStatus { 
        WaitingForPlayer,    // En attente du joueur 2
        Active,              // Partie en cours
        Finished,            // Partie terminée
        Cancelled            // Annulée par le créateur
    }
    
    enum Token { USDC, USDT }
    
    struct Game {
        // Joueurs
        address player1;
        address player2;
        address whitePlayer;
        address blackPlayer;
        
        // Finances
        Token token;                // USDC ou USDT
        uint256 stakeAmount;        // 10, 25 ou 50
        uint256 netStake1;          // Mise player1 après frais (98%)
        uint256 netStake2;          // Mise player2 après frais (98%)
        
        // État de la partie
        GameStatus status;
        uint256 moveCount;
        address lastMovePlayer;
        uint256 lastMoveTime;
        bytes32 lastPositionHash;   // Hash FEN de la dernière position
        
        // Résultat
        address winner;             // address(0) si match nul
        bool isDraw;
    }
    
    // ==================== STORAGE ====================
    
    uint256 public gameCounter;
    mapping(uint256 => Game) public games;
    
    // Propositions de match nul
    mapping(uint256 => bool) public player1OfferedDraw;
    mapping(uint256 => bool) public player2OfferedDraw;
    
    // ==================== EVENTS ====================
    
    event GameCreated(
        uint256 indexed gameId, 
        address indexed player1, 
        Token token,
        uint256 stake
    );
    
    event GameJoined(
        uint256 indexed gameId, 
        address indexed player2,
        address whitePlayer,
        address blackPlayer
    );
    
    event MoveMade(
        uint256 indexed gameId,
        address indexed player,
        uint256 moveNumber,
        bytes32 positionHash
    );
    
    event GameFinished(
        uint256 indexed gameId,
        address winner,
        uint256 prize,
        bool isDraw
    );
    
    event GameCancelled(uint256 indexed gameId);
    
    event DrawOffered(uint256 indexed gameId, address indexed player);
    event DrawAccepted(uint256 indexed gameId);
    
    event TimeoutClaimed(uint256 indexed gameId, address indexed winner);
    
    // ==================== CONSTRUCTOR ====================
    
    constructor(
        address _usdc,
        address _usdt,
        address _treasury
    ) {
        require(_usdc != address(0), "Invalid USDC");
        require(_usdt != address(0), "Invalid USDT");
        require(_treasury != address(0), "Invalid treasury");
        
        usdc = IERC20(_usdc);
        usdt = IERC20(_usdt);
        treasury = _treasury;
    }
    
    // ==================== MODIFIERS ====================
    
    modifier onlyPlayer(uint256 gameId) {
        Game storage game = games[gameId];
        require(
            msg.sender == game.player1 || msg.sender == game.player2,
            "Not a player"
        );
        _;
    }
    
    // ==================== FONCTIONS PRINCIPALES ====================
    
    /**
     * @notice Créer une nouvelle partie
     * @param tokenChoice 0 pour USDC, 1 pour USDT
     * @param stake Mise (10, 25 ou 50)
     */
    function createGame(Token tokenChoice, uint256 stake) external returns (uint256) {
        require(
            stake == 10 ether || stake == 25 ether || stake == 50 ether,
            "Stake must be 10, 25 or 50"
        );
        
        IERC20 token = (tokenChoice == Token.USDC) ? usdc : usdt;
        
        // Calculer les frais (2%)
        uint256 fee = (stake * FEE_PERCENT) / 100;
        uint256 netStake = stake - fee;
        
        // Transférer les tokens
        require(
            token.transferFrom(msg.sender, address(this), stake),
            "Transfer failed"
        );
        require(
            token.transfer(treasury, fee),
            "Treasury transfer failed"
        );
        
        // Créer la partie
        gameCounter++;
        
        games[gameCounter] = Game({
            player1: msg.sender,
            player2: address(0),
            whitePlayer: address(0),
            blackPlayer: address(0),
            token: tokenChoice,
            stakeAmount: stake,
            netStake1: netStake,
            netStake2: 0,
            status: GameStatus.WaitingForPlayer,
            moveCount: 0,
            lastMovePlayer: address(0),
            lastMoveTime: block.timestamp,
            lastPositionHash: keccak256("INITIAL"),
            winner: address(0),
            isDraw: false
        });
        
        emit GameCreated(gameCounter, msg.sender, tokenChoice, stake);
        
        return gameCounter;
    }
    
    /**
     * @notice Rejoindre une partie existante
     * @param gameId ID de la partie à rejoindre
     */
    function joinGame(uint256 gameId) external {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.WaitingForPlayer, "Game not available");
        require(msg.sender != game.player1, "Cannot join own game");
        
        IERC20 token = (game.token == Token.USDC) ? usdc : usdt;
        
        // Calculer les frais (2%)
        uint256 fee = (game.stakeAmount * FEE_PERCENT) / 100;
        uint256 netStake = game.stakeAmount - fee;
        
        // Transférer les tokens
        require(
            token.transferFrom(msg.sender, address(this), game.stakeAmount),
            "Transfer failed"
        );
        require(
            token.transfer(treasury, fee),
            "Treasury transfer failed"
        );
        
        // Assigner aléatoirement blanc/noir
        bool player1IsWhite = _pseudoRandom(gameId) % 2 == 0;
        
        game.player2 = msg.sender;
        game.netStake2 = netStake;
        game.status = GameStatus.Active;
        game.lastMoveTime = block.timestamp;
        
        if (player1IsWhite) {
            game.whitePlayer = game.player1;
            game.blackPlayer = game.player2;
        } else {
            game.whitePlayer = game.player2;
            game.blackPlayer = game.player1;
        }
        
        emit GameJoined(gameId, msg.sender, game.whitePlayer, game.blackPlayer);
    }
    
    /**
     * @notice Annuler une partie en attente
     * @param gameId ID de la partie
     */
    function cancelGame(uint256 gameId) external {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.WaitingForPlayer, "Cannot cancel");
        require(msg.sender == game.player1, "Only creator");
        
        IERC20 token = (game.token == Token.USDC) ? usdc : usdt;
        
        // Rembourser (sans les frais déjà prélevés)
        require(
            token.transfer(game.player1, game.netStake1),
            "Refund failed"
        );
        
        game.status = GameStatus.Cancelled;
        
        emit GameCancelled(gameId);
    }
    
    /**
     * @notice Enregistrer un coup (validé par le frontend avec chess.js)
     * @param gameId ID de la partie
     * @param positionHash Hash de la position FEN après le coup
     */
    function makeMove(
        uint256 gameId,
        bytes32 positionHash
    ) external onlyPlayer(gameId) {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.Active, "Game not active");
        
        // Vérifier que c'est le bon joueur
        address currentPlayer = (game.moveCount % 2 == 0) 
            ? game.whitePlayer 
            : game.blackPlayer;
        
        require(msg.sender == currentPlayer, "Not your turn");
        
        // Enregistrer le coup
        game.moveCount++;
        game.lastMovePlayer = msg.sender;
        game.lastMoveTime = block.timestamp;
        game.lastPositionHash = positionHash;
        
        // Réinitialiser les offres de nul
        player1OfferedDraw[gameId] = false;
        player2OfferedDraw[gameId] = false;
        
        emit MoveMade(gameId, msg.sender, game.moveCount, positionHash);
    }
    
    /**
     * @notice Déclarer la victoire (échec et mat détecté par le frontend)
     * @param gameId ID de la partie
     * @param winner Adresse du gagnant
     * @param finalPositionHash Hash de la position finale
     */
    function declareWinner(
        uint256 gameId,
        address winner,
        bytes32 finalPositionHash
    ) external onlyPlayer(gameId) {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.Active, "Game not active");
        require(
            winner == game.player1 || winner == game.player2,
            "Invalid winner"
        );
        
        // Vérifier que la position correspond
        require(
            game.lastPositionHash == finalPositionHash,
            "Position mismatch"
        );
        
        // Finaliser la partie
        game.status = GameStatus.Finished;
        game.winner = winner;
        game.isDraw = false;
        
        // Payer le gagnant
        uint256 prize = game.netStake1 + game.netStake2;
        IERC20 token = (game.token == Token.USDC) ? usdc : usdt;
        
        require(token.transfer(winner, prize), "Prize transfer failed");
        
        emit GameFinished(gameId, winner, prize, false);
    }
    
    /**
     * @notice Proposer un match nul
     * @param gameId ID de la partie
     */
    function offerDraw(uint256 gameId) external onlyPlayer(gameId) {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.Active, "Game not active");
        
        if (msg.sender == game.player1) {
            player1OfferedDraw[gameId] = true;
        } else {
            player2OfferedDraw[gameId] = true;
        }
        
        emit DrawOffered(gameId, msg.sender);
        
        // Si les deux ont proposé, accepter automatiquement
        if (player1OfferedDraw[gameId] && player2OfferedDraw[gameId]) {
            _finalizeDraw(gameId);
        }
    }
    
    /**
     * @notice Accepter un match nul proposé
     * @param gameId ID de la partie
     */
    function acceptDraw(uint256 gameId) external onlyPlayer(gameId) {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.Active, "Game not active");
        
        bool otherPlayerOffered = (msg.sender == game.player1) 
            ? player2OfferedDraw[gameId] 
            : player1OfferedDraw[gameId];
        
        require(otherPlayerOffered, "No draw offer");
        
        _finalizeDraw(gameId);
    }
    
    /**
     * @notice Abandonner la partie
     * @param gameId ID de la partie
     */
    function resign(uint256 gameId) external onlyPlayer(gameId) {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.Active, "Game not active");
        
        address winner = (msg.sender == game.player1) 
            ? game.player2 
            : game.player1;
        
        game.status = GameStatus.Finished;
        game.winner = winner;
        game.isDraw = false;
        
        // Payer le gagnant
        uint256 prize = game.netStake1 + game.netStake2;
        IERC20 token = (game.token == Token.USDC) ? usdc : usdt;
        
        require(token.transfer(winner, prize), "Prize transfer failed");
        
        emit GameFinished(gameId, winner, prize, false);
    }
    
    /**
     * @notice Réclamer la victoire par timeout
     * @param gameId ID de la partie
     */
    function claimTimeout(uint256 gameId) external onlyPlayer(gameId) {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.Active, "Game not active");
        require(
            block.timestamp >= game.lastMoveTime + MOVE_TIMEOUT,
            "No timeout yet"
        );
        
        address opponent = (msg.sender == game.player1) 
            ? game.player2 
            : game.player1;
        
        require(game.lastMovePlayer == opponent, "You played last");
        
        game.status = GameStatus.Finished;
        game.winner = msg.sender;
        game.isDraw = false;
        
        // Payer le gagnant
        uint256 prize = game.netStake1 + game.netStake2;
        IERC20 token = (game.token == Token.USDC) ? usdc : usdt;
        
        require(token.transfer(msg.sender, prize), "Prize transfer failed");
        
        emit TimeoutClaimed(gameId, msg.sender);
        emit GameFinished(gameId, msg.sender, prize, false);
    }
    
    // ==================== FONCTIONS INTERNES ====================
    
    /**
     * @dev Finaliser un match nul
     */
    function _finalizeDraw(uint256 gameId) internal {
        Game storage game = games[gameId];
        
        game.status = GameStatus.Finished;
        game.winner = address(0);
        game.isDraw = true;
        
        IERC20 token = (game.token == Token.USDC) ? usdc : usdt;
        
        // Rembourser chaque joueur
        require(
            token.transfer(game.player1, game.netStake1),
            "Refund P1 failed"
        );
        require(
            token.transfer(game.player2, game.netStake2),
            "Refund P2 failed"
        );
        
        emit DrawAccepted(gameId);
        emit GameFinished(gameId, address(0), 0, true);
    }
    
    /**
     * @dev Génération pseudo-aléatoire (pour blanc/noir)
     */
    function _pseudoRandom(uint256 seed) internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    seed
                )
            )
        );
    }
    
    // ==================== VUES ====================
    
    /**
     * @notice Obtenir les détails d'une partie
     */
    function getGameDetails(uint256 gameId) external view returns (
        address player1,
        address player2,
        address whitePlayer,
        address blackPlayer,
        Token token,
        uint256 stakeAmount,
        GameStatus status,
        uint256 moveCount,
        address winner,
        bool isDraw
    ) {
        Game storage game = games[gameId];
        return (
            game.player1,
            game.player2,
            game.whitePlayer,
            game.blackPlayer,
            game.token,
            game.stakeAmount,
            game.status,
            game.moveCount,
            game.winner,
            game.isDraw
        );
    }
    
    /**
     * @notice Lister les parties en attente de joueur
     */
    function getWaitingGames(uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory waitingGames = new uint256[](limit);
        uint256 count = 0;
        
        for (uint256 i = offset + 1; i <= gameCounter && count < limit; i++) {
            if (games[i].status == GameStatus.WaitingForPlayer) {
                waitingGames[count] = i;
                count++;
            }
        }
        
        // Réduire le tableau à la taille réelle
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = waitingGames[i];
        }
        
        return result;
    }
}

