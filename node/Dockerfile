# base image
FROM ubuntu

# File author / maintainer
MAINTAINER Maxim Geerinck

# Install node.js and depdencies
RUN apt-get update && \
    apt-get -y install curl && \
    apt-get -y install git && \
    curl -sL https://deb.nodesource.com/setup | sudo bash - && \
    apt-get -y install python build-essential nodejs

# Install nodemon
RUN npm install -g nodemon

# Provide cached layer for node_modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# define working directory
WORKDIR /src
ADD . /src

# expose port
EXPOSE 8080

# Run app using nodemon
CMD ["nodemon", "/src/server/app.js"]
