# Use official Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port (Vite default is 5173)
EXPOSE 5173

# Start the dev server
CMD ["npm", "run", "dev"]
