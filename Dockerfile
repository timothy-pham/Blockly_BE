# Use an official Node.js runtime as a parent image
FROM node:18.16.1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Rebuild bcrypt to ensure compatibility
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the application runs on
EXPOSE 8000

# Define the command to run the application
CMD ["node", "index.js"]
