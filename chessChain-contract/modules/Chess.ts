import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ChessModule = buildModule("ChessModule", (m) => {
  const chess = m.contract("Chess"); // nom du contrat .sol dans /contracts

  // Tu peux appeler des fonctions du contrat après déploiement
  // m.call(chess, "initialize", [arg1, arg2]);

  return { chess };
});

export default ChessModule;
