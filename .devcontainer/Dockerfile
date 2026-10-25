# Node 16 (bookworm; bullseye security repo is gone): parcel-bundler 1.x / electron 15 / electron-builder 22 era toolchain.
FROM mcr.microsoft.com/devcontainers/typescript-node:16-bookworm

# Shared libraries Electron needs to run on Linux (window shown via the desktop-lite feature / noVNC).
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgtk-3-0 libgbm1 \
      libasound2 libxss1 libxshmfence1 libxkbcommon0 xvfb fonts-noto-cjk \
 && rm -rf /var/lib/apt/lists/*

# deasync (pulled in by parcel-bundler 1.x) has no prebuilt linux-arm64 binary and is built with node-gyp.
RUN npm install -g node-gyp@9
