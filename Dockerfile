# Build stage
FROM node:22.17.0 AS build

# Define and create work directory
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all production dependencies (Ignore devDependencies to the final image)
RUN npm install --only=production

# Copy all source code
COPY . .

FROM node:22.17.0 AS production

WORKDIR /src

COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/dist ./dist

EXPOSE 80

CMD ["node", "dist/server.js"]