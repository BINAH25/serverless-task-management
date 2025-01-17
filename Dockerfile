# Use the Node.js image for building
FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json, then install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code and build it
COPY . .
RUN npm run build  

# Use a lightweight web server to serve the built app
FROM nginx:alpine

# Copy build files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the Nginx port
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
