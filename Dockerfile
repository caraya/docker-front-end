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

# RUN useradd -ms /bin/bash newuser
# USER newuser
# WORKDIR /home/newuser

# Create a user
RUN useradd -m -d /app -s /bin/sh -g root -G sudo -u 1000 ubuntu
# Set the user as the current user
USER ubuntu
# Set the working directory
WORKDIR /app

# Create the development environment
RUN  mkdir -p /app/code/ && chmod -R 777 /app/code/

# If this works it should copy the package.json
# and gulpfile.js to the code directory
COPY package.json gulpfile.js /app/

# Make the tree under /opt/bitnami/node/lib/ publically writeable
RUN /bin/bash -c "chmod -R 777 /opt/bitnami/node/"
RUN /bin/bash -c "chmod -R 777 /opt/bitnami/node/lib/"
RUN /bin/bash -c "chmod -R 777 /opt/bitnami/node/lib/node_modules/"

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
