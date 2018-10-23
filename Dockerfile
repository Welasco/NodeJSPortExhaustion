FROM node:carbon

# Create app directory
WORKDIR /home/site/wwwroot

COPY startup /opt/startup
COPY sshd_config /etc/ssh/

# Install Tools
RUN apt-get update \
    && apt-get install -y net-tools nano openssh-server vim curl wget tcptraceroute

RUN npm install -g pm2 \
    && mkdir -p /home/LogFiles \
    && echo "root:Docker!" | chpasswd \
    && echo "cd /home" >> /etc/bash.bashrc \
    && apt install -y --no-install-recommends openssh-server vim curl wget tcptraceroute \
    && cd /opt/startup \
    && npm install \
    && chmod 755 /opt/startup/init_container.sh

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
ENV PATH ${PATH}:/home/site/wwwroot

ENV APP_HOME "/home/site/wwwroot"
ENV HTTPD_LOG_DIR "/home/LogFiles"

# CMD [ "npm", "start" ]
ENTRYPOINT ["/opt/startup/init_container.sh"]