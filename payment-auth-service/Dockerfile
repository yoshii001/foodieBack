# 1. Use official Node.js image
FROM node:18-bullseye

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the entire app code
COPY . .

# 6. Expose the port your app runs on
EXPOSE 5004

# 7. Run the app
CMD ["node", "server.js"]
