# Build stage
FROM node:22.17.0 AS build

# Define and create work directory
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

# Copy all source code
COPY . .

# Build the application
RUN npm run build

FROM node:22.17.0 AS production

WORKDIR /src

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=build /src/dist ./dist

EXPOSE 80

CMD ["node", "dist/src/ProsperifyApplication.js"]