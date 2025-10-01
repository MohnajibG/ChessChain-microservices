// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
}

contract ChessChain {
    IERC20 public immutable token;     
    address public immutable treasury; 
    uint256 public constant FEE_PERCENT = 2; 

    address public arbiter; // Adresse de l'arbitre autorisé

    enum GameStatus { Waiting, Ready, Finished, Cancelled }

    struct Game {
        address player1;
        address player2;
        uint256 stake;      // mise initiale
        uint256 netStake1;  // mise après 2% prélevés
        uint256 netStake2;  
        GameStatus status;
        address winner;
        bool matchNull;     // pour suivre si c'est un match nul
    }

    uint256 public gameCount;
    mapping(uint256 => Game) public games;

    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 stake);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event GameCancelled(uint256 indexed gameId);
    event GameFinished(uint256 indexed gameId, address winner, uint256 prize);
    event GameReplayed(uint256 indexed gameId);

    constructor(address tokenAddress, address treasuryAddress, address arbiterAddress) {
        token = IERC20(tokenAddress);
        treasury = treasuryAddress;
        arbiter = arbiterAddress;
    }

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Only arbiter can call this function");
        _;
    }

    /// @notice Player1 crée une partie
    function createGame(uint256 stake) external returns (uint256) {
        require(stake == 10 || stake == 25 || stake == 50, "Stake not allowed");

        uint256 fee = (stake * FEE_PERCENT) / 100;
        uint256 net = stake - fee;

        require(token.transferFrom(msg.sender, address(this), stake), "Token transfer failed");
        require(token.transfer(treasury, fee), "Treasury transfer failed");

        gameCount++;
        games[gameCount] = Game({
            player1: msg.sender,
            player2: address(0),
            stake: stake,
            netStake1: net,
            netStake2: 0,
            status: GameStatus.Waiting,
            winner: address(0),
            matchNull: false
        });

        emit GameCreated(gameCount, msg.sender, stake);
        return gameCount;
    }

    /// @notice Player2 rejoint la partie
    function joinGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Game not available");
        require(msg.sender != game.player1, "Cannot join your own game");

        uint256 fee = (game.stake * FEE_PERCENT) / 100;
        uint256 net = game.stake - fee;

        require(token.transferFrom(msg.sender, address(this), game.stake), "Token transfer failed");
        require(token.transfer(treasury, fee), "Treasury transfer failed");

        game.player2 = msg.sender;
        game.netStake2 = net;
        game.status = GameStatus.Ready;

        emit GameJoined(gameId, msg.sender);
    }

    /// @notice Annuler une partie si personne n’a encore rejoint
    function cancelGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Game cannot be cancelled");
        require(msg.sender == game.player1, "Only creator can cancel");

        // Rembourse Player1 sans frais
        require(token.transfer(game.player1, game.netStake1), "Refund failed");

        game.status = GameStatus.Cancelled;

        emit GameCancelled(gameId);
    }

    /// @notice Fin de partie normale par l'arbitre
    function finishGame(uint256 gameId, address winner, bool isNull) external onlyArbiter {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Ready, "Game not ready");

        if (isNull) {
            // Partie nulle : rejouer avec la même mise
            game.matchNull = true;
            emit GameReplayed(gameId);
            return;
        }

        require(winner == game.player1 || winner == game.player2, "Invalid winner");
        _distributePrize(gameId, winner);
    }

    /// @notice L’arbitre peut gérer un abandon
    /// Si un joueur abandonne, l’autre gagne
    function arbitrateAbandon(uint256 gameId, address leaver) external onlyArbiter {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Ready, "Game not active");
        require(leaver == game.player1 || leaver == game.player2, "Invalid player");

        address winner = (leaver == game.player1) ? game.player2 : game.player1;
        _distributePrize(gameId, winner);
    }

    /// @dev Distribuer les gains
    function _distributePrize(uint256 gameId, address winner) internal {
        Game storage game = games[gameId];

        uint256 totalPool = game.netStake1 + game.netStake2;
        require(token.transfer(winner, totalPool), "Payout failed");

        game.status = GameStatus.Finished;
        game.winner = winner;

        emit GameFinished(gameId, winner, totalPool);
    }

    /// @notice Changer d'arbitre
    function updateArbiter(address newArbiter) external onlyArbiter {
        arbiter = newArbiter;
    }
}
