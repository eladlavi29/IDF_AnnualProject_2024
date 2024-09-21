# Using the official Node.js image
FROM node:16

# Setting the working directory in the container
#WORKDIR /usr/src/app
WORKDIR app

# Copying package.json and package-lock.json to the working directory
COPY package*.json .


# Installing dependencies
RUN npm install --force

# Copying the rest of the application code
COPY . .

# Exposing the port your app runs on
EXPOSE 4000

# Command to run your application
CMD ["node", "index.js"]