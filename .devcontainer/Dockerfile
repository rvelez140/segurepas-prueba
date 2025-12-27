# Development Container for SecurePass
FROM mcr.microsoft.com/devcontainers/typescript-node:1-18-bullseye

# Install additional tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    wget \
    vim \
    nano \
    htop \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g \
    nodemon \
    ts-node \
    typescript \
    @commitlint/cli \
    standard-version \
    npm-check-updates

# Configure git
RUN git config --global core.autocrlf input

# Set working directory
WORKDIR /workspace

# Keep container running
CMD ["sleep", "infinity"]
