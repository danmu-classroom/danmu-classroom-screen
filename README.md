# danmu-classroom-screen

## 使用說明

1. 下載並解壓縮

   - Windows: <https://github.com/danmu-classroom/danmu-classroom-screen/releases/download/v0.4.1/danmu-classroom-screen.0.4.1.exe>
   - Mac: <https://github.com/danmu-classroom/danmu-classroom-screen/releases/download/v0.4.1/danmu-classroom-screen-0.4.1-mac.zip>
   - Linux: <https://github.com/danmu-classroom/danmu-classroom-screen/releases/download/v0.4.1/danmu-classroom-screen-0.4.1.AppImage>

2. 打開資料夾內的 `danmu-classroom-screen.exe` 或 `danmu-classroom-screen.app`

3. 掃描 QRCode 加入 Line 好友

4. 在 Line 聊天室中隨便打個字，等機器人回覆後按 `輸入房號`

5. 在 Line 聊天室輸入螢幕上的四位數字

6. 透過 Line 聊天室打字發送彈幕

## 開發

技術：Electron 45、TypeScript 6、electron-vite（Vite 8）、Stimulus 3、Bootstrap 5.3、Node.js 24。

用 VS Code 開啟專案後選「Reopen in Container」。Electron 視窗可在 <http://localhost:6080>（noVNC，密碼 `vscode`）看到。
開發時預設連到 `http://localhost:3001`（danmu-classroom-server 的 Dev Container）；在容器內透過 `DANMU_UPSTREAM` 改連 `http://host.docker.internal:3001`。

```bash
yarn dev        # electron-vite dev（HMR）
yarn start      # build 後以 development 模式啟動
yarn test       # vitest
yarn lint       # eslint + prettier
yarn typecheck  # tsc
yarn build      # 打包 Windows / macOS / Linux
```
