FROM node:20-alpine

WORKDIR /app

# Add legacy build dependencies for older packages
RUN apk add --no-cache python3 make g++ bash

COPY package*.json ./
RUN npm install -g npm@11.1.0
RUN npm install --legacy-peer-deps

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "dev"]
