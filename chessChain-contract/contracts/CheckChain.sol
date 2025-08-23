// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CheckChain
 * @dev Contrat pour gérer des parties avec mise (stake) fixe : 10, 25 ou 50 tokens ERC20 (ex: USDC).
 */
interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
}

contract CheckChain {
    IERC20 public immutable token;

    enum GameStatus { Waiting, Ready, Finished }

    struct Game {
        address player1;
        address player2;
        uint256 stake;
        GameStatus status;
    }

    uint256 public gameCount;
    mapping(uint256 => Game) public games;

    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 stake);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event GameFinished(uint256 indexed gameId, address winner);

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    /// @notice Créer une nouvelle partie avec un stake fixe (10, 25, 50)
    function createGame(uint256 stake) external returns (uint256) {
        require(stake == 10 || stake == 25 || stake == 50, "Stake not allowed");

        // Transfert des tokens du joueur1 vers le contrat
        require(token.transferFrom(msg.sender, address(this), stake), "Token transfer failed");

        gameCount++;
        games[gameCount] = Game({
            player1: msg.sender,
            player2: address(0),
            stake: stake,
            status: GameStatus.Waiting
        });

        emit GameCreated(gameCount, msg.sender, stake);
        return gameCount;
    }

    /// @notice Rejoindre une partie existante
    function joinGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Game not available");
        require(game.player1 != msg.sender, "Cannot join your own game");

        // Transfert des tokens du joueur2 vers le contrat
        require(token.transferFrom(msg.sender, address(this), game.stake), "Token transfer failed");

        game.player2 = msg.sender;
        game.status = GameStatus.Ready;

        emit GameJoined(gameId, msg.sender);
    }

    /// @notice Terminer la partie et désigner un gagnant
    function finishGame(uint256 gameId, address winner) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Ready, "Game not ready");
        require(winner == game.player1 || winner == game.player2, "Invalid winner");

        // Transfert de la cagnotte au gagnant
        uint256 prize = game.stake * 2;
        require(token.transfer(winner, prize), "Payout failed");

        game.status = GameStatus.Finished;

        emit GameFinished(gameId, winner);
    }
}
