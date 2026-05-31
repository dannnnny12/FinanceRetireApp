# FinanceApp

一個使用 React Native、Node.js、Express 與 MongoDB Atlas 開發的退休理財管理 App。

---

# 系統需求

## Node.js

本專案指定使用：

```bash
Node.js 22.x
```

請勿使用 Node.js 24.x，以避免 MongoDB Atlas SSL/TLS 連線問題。

建議使用 nvm 管理版本：

```bash
nvm install 22
nvm use 22
```

確認版本：

```bash
node -v
```

應顯示：

```bash
v22.x.x
```

---

# 專案結構

```text
FinanceApp/
├── backend/              # Express API
├── ios/                  # iOS 專案
├── android/              # Android 專案
├── src/
│   ├── screens/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── navigation/
├── package.json
└── README.md
```

---

# 安裝前置需求

## macOS

安裝：

- Xcode
- Xcode Command Line Tools
- CocoaPods
- Node.js 22

安裝 CocoaPods：

```bash
sudo gem install cocoapods
```

確認版本：

```bash
pod --version
```

---

# 安裝專案

## 1. Clone 專案

```bash
git clone <repository-url>

cd FinanceApp
```

---

## 2. 安裝前端套件

```bash
npm install
```

---

## 3. 安裝 iOS Pods

```bash
cd ios

pod install

cd ..
```

---

## 4. 安裝後端套件

```bash
cd backend

npm install

cd ..
```

---

# 環境變數設定

建立：

```text
backend/.env
```

內容：

```env
PORT=3000

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financeapp
```

---

# MongoDB Atlas 設定

## Database User

建立資料庫使用者：

```text
username
password
```

並賦予讀寫權限。

---

## Network Access

新增：

```text
0.0.0.0/0
```

測試完成後再依需求限制 IP。

---

# 啟動後端 API

進入 backend：

```bash
cd backend
```

啟動：

```bash
npm start
```

或

```bash
node server.js
```

看到類似：

```text
Server running on port 3000
MongoDB Connected
```

表示成功。

---

# 啟動 React Native

確認：

- iOS Simulator 已啟動
- Backend 已啟動
- Pods 已安裝

在專案根目錄執行：

```bash
npx react-native run-ios
```

---

# 啟動 Metro

若需要單獨啟動 Metro：

```bash
npx react-native start
```

---

# Android

執行：

```bash
npx react-native run-android
```

---

# 清除快取

若出現奇怪錯誤：

## React Native

```bash
watchman watch-del-all

rm -rf node_modules

rm package-lock.json

npm install
```

---

## Metro Cache

```bash
npx react-native start --reset-cache
```

---

## iOS Pods

```bash
cd ios

rm -rf Pods

rm Podfile.lock

pod install

cd ..
```

---

## Xcode DerivedData

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

---

# Node 版本切換

若目前是 Node 24：

查看版本：

```bash
node -v
```

安裝 Node 22：

```bash
nvm install 22
```

切換：

```bash
nvm use 22
```

重新安裝依賴：

```bash
rm -rf node_modules

rm package-lock.json

npm install
```

backend 也需執行：

```bash
cd backend

rm -rf node_modules

rm package-lock.json

npm install
```

---

# 常見問題

## MongoDB SSL 錯誤

錯誤：

```text
ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR
```

解決方式：

1. 使用 Node.js 22
2. 更新 mongoose

```bash
npm install mongoose@latest
```

3. 確認 Atlas Network Access 已開放

```text
0.0.0.0/0
```

4. 檢查 MONGODB_URI

範例：

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financeapp
```

---

## CocoaPods 卡住

如果停在：

```text
Cloning spec repo `cocoapods`
```

執行：

```bash
pod repo remove trunk

pod setup
```

或：

```bash
pod install --repo-update
```

---

## iOS 白畫面

請確認：

```bash
npx react-native start
```

正在執行。

並重新啟動：

```bash
npx react-native run-ios
```

---

# 開發指令總覽

安裝依賴：

```bash
npm install
```

安裝 Pods：

```bash
cd ios && pod install
```

啟動 Backend：

```bash
cd backend

npm start
```

啟動 iOS：

```bash
npx react-native run-ios
```

啟動 Android：

```bash
npx react-native run-android
```

啟動 Metro：

```bash
npx react-native start
```

重置快取：

```bash
npx react-native start --reset-cache
```

---

# 技術架構

Frontend：

- React Native
- TypeScript
- React Navigation
- Axios
- React Native Vector Icons

Backend：

- Node.js 22
- Express
- MongoDB Atlas
- Mongoose

Database：

- MongoDB Atlas

---

# Demo

## 主頁面

<img width="409" height="840" alt="image" src="https://github.com/user-attachments/assets/4e05272b-908e-4745-88f8-3896992322c4" />


## 資產頁面

<img width="409" height="840" alt="image" src="https://github.com/user-attachments/assets/206f70cc-a8f7-4ed2-ae7a-94bf1c6202e3" />


## 負債頁面

<img width="409" height="840" alt="image" src="https://github.com/user-attachments/assets/0a0773e5-55c7-409c-bc30-c59e589a9220" />


## 個人頁面

<img width="409" height="840" alt="image" src="https://github.com/user-attachments/assets/23047533-016b-49b4-94aa-27594545a450" />


