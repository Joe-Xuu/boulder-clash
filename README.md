⚔️ Boulder Clash
A Real-Time Multiplayer Tug-of-War Game for Mobile Web.

🔴 Live Demo (Replace with your actual Vercel link)

📖 About The Project
Boulder Clash is a 1v1 online tapping game designed primarily for mobile browsers. Two players compete by tapping their screens as fast as possible to push a giant boulder toward their opponent.

Built with React and Firebase Realtime Database, it features a unique "Low Poly" medieval aesthetic, pseudo-3D CSS environments, and instant synchronization—no app download required.

✨ Key Features
Real-Time Multiplayer: Instant state synchronization using Firebase.

Room System: Easy matchmaking via 6-digit room codes.

Mobile Optimized:

Solves the "300ms delay" & ghost clicks using Pointer Events.

Full-screen immersive experience using 100dvh (Dynamic Viewport Height).

Immersive Visuals:

CSS-based Pseudo-3D environment (Infinite scrolling dirt road).

Particle explosions and screen shake effects on every tap.

Daytime skybox with sun and moving clouds.

Audio Synthesis: Built-in sound effects using the Web Audio API (no external assets needed).

Internationalization (i18n): One-click toggle between English and Chinese.

Rematch System: Synchronized "Play Again" functionality.

🛠 Tech Stack
Frontend: React.js

Backend / Database: Firebase Realtime Database

Animation: Framer Motion & CSS3 Animations

Styling: CSS Modules / Inline Styles

Deployment: Vercel

🚀 Getting Started
Follow these steps to set up the project locally.

Prerequisites
Node.js (v14 or higher)

npm or yarn

Installation
Clone the repository

Bash

git clone https://github.com/your-username/boulder-clash.git
cd boulder-clash
Install dependencies

Bash

npm install
Configure Firebase

Go to the Firebase Console.

Create a new project.

Enable Realtime Database (start in Test Mode).

Go to Project Settings -> General -> Your apps -> Web app.

Copy your configuration keys.

Set up Environment Variables Create a .env file in the root directory and add your Firebase keys:

代码段

REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
Run the local server

Bash

npm start
Open http://localhost:3000 to view it in the browser.

🎮 How to Play
Host: Click "Create Duel" (or "建立决斗") to generate a Room Code.

Guest: Enter the Room Code on another device and click "Join Duel".

Battle:

Tap the screen as fast as you can!

Push the boulder to the opponent's side (0%) to win.

If the boulder reaches your side (100%), you lose.

Rematch: Both players must click "Rematch" to start a new round instantly.

📦 Deployment
This project is optimized for deployment on Vercel.

Push your code to GitHub.

Import the repository on Vercel.

Crucial: Add the Environment Variables (from your .env file) in the Vercel project settings.

Deploy!

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

👤 Author
Kouzen Jo

Role: Developer & Designer

📄 License
Distributed under the MIT License. See LICENSE for more information.

© 2025 Kouzen Jo. All Rights Reserved.