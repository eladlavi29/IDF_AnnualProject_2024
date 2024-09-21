# Using the official Node.js 16 image as the base image
FROM node:16

# Setting the working directory inside the container
WORKDIR /app

# Copying package.json and package-lock.json to the working directory
COPY package*.json ./

# Installing the dependencies
RUN npm install --force

# Copying the rest of the application code to the working directory
COPY . .

# Building the Vite project
RUN npm run build

# Exposing the port on which the application will run
EXPOSE 80

# Setting the command to run the application
CMD ["npm", "run", "dev"]
