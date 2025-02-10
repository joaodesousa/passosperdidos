# Use Node 16 image
FROM node:16

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json /app/
RUN npm install

# Copy the Next.js app
COPY . /app/

# Expose the port Next.js will run on
EXPOSE 3000

# Build and run Next.js app
CMD ["npm", "run", "dev"]
