FROM node:16.3.0-buster

# Create app directory
WORKDIR /usr/src/app

COPY startup /opt/startup

# Install Tools - nscd is a DNS Cache
RUN apt-get update \
    && apt-get install -y net-tools nano openssh-server vim curl wget tcptraceroute nscd tcpdump dnsutils

RUN npm install -g pm2 \
    && mkdir -p /usr/src/app \
    && echo "root:Docker!" | chpasswd \
    && echo "cd /usr/src/app" >> /etc/bash.bashrc \
    && cd /opt/startup \
    && npm install \
    && chmod 755 /opt/startup/init_container.sh

COPY sshd_config /etc/ssh/
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 3000

ENV PM2HOME /pm2home

ENV PORT 3000
ENV WEBSITE_ROLE_INSTANCE_ID localRoleInstance
ENV WEBSITE_INSTANCE_ID localInstance
ENV PATH ${PATH}:/usr/src/app

ENV APP_HOME "/usr/src/app"
ENV HTTPD_LOG_DIR "/usr/src/app/LogFiles"

# CMD [ "npm", "start" ]
ENTRYPOINT ["/opt/startup/init_container.sh"]