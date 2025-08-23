FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Commande pour lancer les tests / compilation
CMD ["npx", "hardhat", "test"]
