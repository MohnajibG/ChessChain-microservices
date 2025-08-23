CheckChain/
├── public/
│ ├── index.html
│ ├── pieces/ # Images des pièces
│ │ └── 3d/
│ ├── textures/ # Textures bois clair / foncé
│ └── favicon.ico
│
├── src/
│ ├── assets/ # Images/logo/icônes custom
│ │ └── logo.png
│ │
│ ├── components/ # Composants réutilisables
│ │ ├── ChessBoard/ # Dossier spécifique au board
│ │ │ ├── ChessBoard.tsx # Wrapper principal
│ │ │ ├── ChessAI.tsx # Mode IA
│ │ │ ├── ChessWeb3.tsx # Mode Web3 (wallet + stake)
│ │ │ └── ChessFree.tsx # Mode libre / entraînement
│ │ │
│ │ ├── Dashboard.tsx # Dashboard (user, bets, gains…)
│ │ ├── ModeSelectModal.tsx # Modal pour choisir le mode
│ │ ├── Layout.tsx # Layout global (navbar/footer)
│ │ └── TransactionModal.tsx # Modal de feedback TX Web3
│ │
│ ├── pages/ # Pages avec React Router
│ │ ├── Home.tsx # Page d’accueil
│ │ ├── Play.tsx # Page Play (rend ChessBoard selon mode choisi)
│ │ ├── Profile.tsx # Page profil utilisateur
│ │ └── NotFound.tsx # Page 404
│ │
│ ├── lib/ # Librairies et config
│ │ ├── web3Config.ts # Setup wagmi / RainbowKit
│ │ ├── contracts.ts # ABI + addresses smart contracts
│ │ └── ai.ts # Fonctions AI (random / minmax…)
│ │
│ ├── styles/ # Styles globaux
│ │ └── index.css # Tailwind + styles custom
│ │
│ ├── App.tsx # Routes + Layout global
│ ├── main.tsx # Entrée ReactDOM
│ └── vite-env.d.ts
│
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── vite.config.ts
