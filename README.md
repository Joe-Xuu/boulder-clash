## ⚔️ Boulder Clash
## A Real-Time Multiplayer Tug-of-War Game for Mobile Web.


## 📖 About The Project
Boulder Clash is a 1v1 online tapping game designed primarily for mobile browsers. Two players compete by tapping their screens as fast as possible to push a giant boulder toward their opponent.

Built with React and Firebase Realtime Database, it features a unique "Low Poly" medieval aesthetic, pseudo-3D CSS environments, and instant synchronization—no app download required.

## ✨ Key Features
* Real-Time Multiplayer: Instant state synchronization using Firebase.

* Room System: Easy matchmaking via 6-digit room codes.

* Mobile Optimized:

Solves the "300ms delay" & ghost clicks using Pointer Events.

Full-screen immersive experience using 100dvh (Dynamic Viewport Height).

* Immersive Visuals:

CSS-based Pseudo-3D environment (Infinite scrolling dirt road).

Particle explosions and screen shake effects on every tap.

Daytime skybox with sun and moving clouds.

* Audio Synthesis: Built-in sound effects using the Web Audio API (no external assets needed).

* Internationalization (i18n): One-click toggle between English and Chinese.

* Rematch System: Synchronized "Play Again" functionality.

## 🛠 Tech Stack
* Frontend: React.js

* Backend / Database: Firebase Realtime Database

* Animation: Framer Motion & CSS3 Animations

* Styling: CSS Modules / Inline Styles

* Deployment: Vercel

## 🚀 Getting Started
Follow these steps to set up the project locally.

* Prerequisites
Node.js (v14 or higher)

npm or yarn

* Installation
1. Clone the repository

`git clone https://github.com/your-username/boulder-clash.git`
`cd boulder-clash`

2. Install dependencies

`npm install`

3. Configure Firebase

* Go to the Firebase Console.

* Create a new project.

* Enable Realtime Database (start in Test Mode).

* Go to Project Settings -> General -> Your apps -> Web app.

* Copy your configuration keys.

4. Set up Environment Variables Create a .env file in the root directory and add your Firebase keys:

`REACT_APP_FIREBASE_API_KEY=your_api_key`
`REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com`
`REACT_APP_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com`
`REACT_APP_FIREBASE_PROJECT_ID=your_project_id`
`REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com`
`REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id`
`REACT_APP_FIREBASE_APP_ID=your_app_id`

5. Run the local server

`npm start`

Open http://localhost:3000 to view it in the browser.

## 🎮 How to Play
1. Host: Click "Create Duel" (or "建立决斗") to generate a Room Code.

2. Guest: Enter the Room Code on another device and click "Join Duel".

3. Battle:

Tap the screen as fast as you can!

Push the boulder to the opponent's side (0%) to win.

If the boulder reaches your side (100%), you lose.

4. Rematch: Both players must click "Rematch" to start a new round instantly.

## 📦 Deployment
This project is optimized for deployment on Vercel.

Push your code to GitHub.

Import the repository on Vercel.

Crucial: Add the Environment Variables (from your .env file) in the Vercel project settings.

Deploy!

## 👤 Author
**Kouzen Jo**

Role: Developer & Designer

## 📄 License
Distributed under the MIT License. See LICENSE for more information.

© 2025 Kouzen Jo. All Rights Reserved.