# Utiliser une image Node.js pour Alpine
FROM node:18-alpine

# Créer le dossier de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port que Vite utilise
EXPOSE 5173

# Lancer le serveur Vite
CMD ["npm", "run", "dev", "--", "--host"]
