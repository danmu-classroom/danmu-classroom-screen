# Node 24 LTS (Electron 45 / electron-vite / Vite 8 need Node >= 22.12).
FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm

# Shared libraries Electron needs to run on Linux (window shown via the desktop-lite feature / noVNC).
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgtk-3-0 libgbm1 \
      libasound2 libxss1 libxshmfence1 libxkbcommon0 xvfb fonts-noto-cjk \
 && rm -rf /var/lib/apt/lists/*
