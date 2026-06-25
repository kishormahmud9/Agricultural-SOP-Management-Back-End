# 1. Base image (Node.js)
FROM node:20-alpine

# 2. App directory inside container
WORKDIR /app

# 3. Copy package.json & package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy all source code
COPY . .

# 6. Expose app port
EXPOSE 5000

# 7. Start the app
CMD ["npm", "run", "dev"]
