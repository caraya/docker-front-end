# Use the latest version of Ubuntu
FROM bitnami/node:latest

# Fetch and install system tools
RUN apt-get update && apt-get -y -q --no-install-recommends install \
    build-essential \
    curl \
    bash \
    git \
    libffi6 \
    libffi-dev \
    python \
    python-dev \
    # libvips-dev\
    # libvips-tools\
    # libvips42\
    # Remove the package installers to make image smaller :o)
    && rm -rf /var/lib/apt/lists/*

# Make bash the default shell by removing /bin/sh and linking bash to it
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Create a user
RUN groupadd -r newuser && useradd -r -g newuser newuser

# Set the root as user to create directories in /home,
# see if this works
USER newuser

# Create the development environment
RUN mkdir -p /home/newuser/code/\
    && chmod -R 777 /home/newuser/code/\
    && chown -R newuser:newuser /home/newuser

# Set the user as the current user
USER newuser
# Set the working directory
WORKDIR /home/newuser

# If this works it should copy the package.json
# and gulpfile.js to the code directory
COPY package.json gulpfile.js /home/newuser/

# Make the tree under /opt/bitnami/node/ publically writeable
# and make newuser the owner
# In theory, this shouold fix
RUN chmod -R 777 /opt/bitnami/node/\
    chown -R newuser:newuser /opt/bitnami/node

# Install Gyp related tools for Node binary packages
RUN npm install -g \
    node-pre-gyp \
    node-gyp

# Install global packages
RUN npm install -g \
    gulp-cli \
    && npm install --no-optional

# Expose default gulp port
EXPOSE 3000

# Run with bash
WORKDIR /app/
CMD ["/bin/bash"]
