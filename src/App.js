import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, runTransaction, off } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
// 确保你有这张图片，如果没有请注释掉下面这一行并修改 styles.lobbyOverlay
import LobbyBg from './assets/my-bg.png';

// --- Firebase 配置 ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const myUserId = uuidv4().slice(0, 8);
const generateRoomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- 多语言字典 ---
const TEXT = {
  zh: {
    title: '⚔️ 巨石纹章 ⚔️',
    create: '建立决斗',
    join: '加入决斗',
    roomCode: '房间码',
    waitOpponent: '等待挑战者...',
    inputPlaceholder: '输入对方房间码',
    redSide: '红方',
    blueSide: '蓝方',
    pushing: '推进中!',
    danger: '危险!',
    crushing: '碾压!',
    resist: '顶住!',
    clash: '对决',
    victory: '史诗大捷',
    defeat: '惨遭碾压',
    rematch: '申请重赛',
    waiting: '等待对手...',
    soon: '即将开始...',
    leave: '离开',
    vsMe: '我方',
    vsOpp: '对方',
    producedBy: 'Produced by Kouzen Joe',
    rights: '© 2024 All Rights Reserved'
  },
  en: {
    title: '⚔️ BOULDER CLASH ⚔️',
    create: 'Create Duel',
    join: 'Join Duel',
    roomCode: 'Room Code',
    waitOpponent: 'Waiting for opponent...',
    inputPlaceholder: 'Enter Room Code',
    redSide: 'Red',
    blueSide: 'Blue',
    pushing: 'PUSHING!',
    danger: 'DANGER!',
    crushing: 'CRUSHING!',
    resist: 'RESIST!',
    clash: 'CLASH',
    victory: 'VICTORY',
    defeat: 'DEFEAT',
    rematch: 'Rematch',
    waiting: 'Waiting...',
    soon: 'Starting...',
    leave: 'Leave',
    vsMe: 'Me',
    vsOpp: 'Enemy',
    producedBy: 'Produced by Kouzen Joe',
    rights: '© 2024 All Rights Reserved'
  }
};

// --- 音效合成器 ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const playSound = (type) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  if (type === 'hit') {
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
    gainNode.gain.setValueAtTime(0.8, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now); osc.stop(now + 0.1);
  } else if (type === 'win') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now); 
    osc.frequency.linearRampToValueAtTime(880, now + 0.4);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
    osc.start(now); osc.stop(now + 0.8);
  } else if (type === 'lose') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.6);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
    osc.start(now); osc.stop(now + 0.6);
  }
};

// --- 粒子效果 ---
const createExplosion = (x, y) => {
  const particleCount = 8;
  const colors = ['#5d4037', '#8d6e63', '#d7ccc8', '#3e2723']; 
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    const size = Math.random() * 10 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.transform = `rotate(${Math.random() * 360}deg)`; 
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    document.body.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 80 + 40;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    particle.animate([
      { transform: `translate(0, 0) rotate(0deg) scale(1)`, opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random()*360}deg) scale(0)`, opacity: 0 }
    ], { duration: 600, easing: 'ease-out' }).onfinish = () => particle.remove();
  }
};

function App() {
  const [lang, setLang] = useState('zh'); 
  const [gameState, setGameState] = useState('lobby'); 
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [score, setScore] = useState(50); 
  const [resultText, setResultText] = useState('');
  const [rematchStatus, setRematchStatus] = useState({ me: false, opponent: false });
  const [isShaking, setIsShaking] = useState(false);

  const myRoleRef = useRef(null); 
  const roomRef = useRef(null);
  const gameOverRef = useRef(false);
  const soundPlayedRef = useRef(false);

  const t = TEXT[lang]; 

  // --- 房间管理 ---
  const createRoom = async () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const code = generateRoomCode();
    setRoomCode(code);
    myRoleRef.current = 'host';
    roomRef.current = ref(db, `rooms/${code}`);
    await set(roomRef.current, {
      status: 'waiting', score: 50, host: myUserId, guest: '',
      hostRematch: false, guestRematch: false
    });
    listenToRoom(code);
  };

  const joinRoom = async () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const code = joinCodeInput;
    if (!code) return;
    roomRef.current = ref(db, `rooms/${code}`);
    await update(roomRef.current, {
      guest: myUserId, status: 'playing',
      hostRematch: false, guestRematch: false
    });
    setRoomCode(code);
    myRoleRef.current = 'guest';
    listenToRoom(code);
  };

  const listenToRoom = (code) => {
    off(ref(db, `rooms/${code}`));
    gameOverRef.current = false;
    soundPlayedRef.current = false;
    setRematchStatus({ me: false, opponent: false });

    onValue(ref(db, `rooms/${code}`), async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setScore(data.score);

      if (data.status === 'playing' && gameState !== 'playing') {
        setGameState('playing');
        gameOverRef.current = false; 
        soundPlayedRef.current = false;
        setRematchStatus({ me: false, opponent: false });
      }

      if ((data.score >= 100 || data.score <= 0)) {
        if (!gameOverRef.current) {
          gameOverRef.current = true;
          setGameState('finished');
          const isHostWin = data.score >= 100;
          const amIHost = myRoleRef.current === 'host';
          const iWon = (isHostWin && amIHost) || (!isHostWin && !amIHost);
          setResultText(iWon ? t.victory : t.defeat);
          
          if (!soundPlayedRef.current) {
            playSound(iWon ? 'win' : 'lose');
            soundPlayedRef.current = true;
          }
        }

        const amIHost = myRoleRef.current === 'host';
        const myStatus = amIHost ? data.hostRematch : data.guestRematch;
        const oppStatus = amIHost ? data.guestRematch : data.hostRematch;
        setRematchStatus({ me: myStatus, opponent: oppStatus });

        if (data.hostRematch && data.guestRematch && amIHost) {
           setTimeout(async () => {
              await update(ref(db, `rooms/${code}`), {
                status: 'playing',
                score: 50, 
                hostRematch: false, 
                guestRematch: false
              });
           }, 500);
         }
      }
    });
  };

  const handlePush = (e) => {
    if (gameState !== 'playing' || !roomRef.current) return;
    if (e.cancelable) e.preventDefault();

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 200);

    playSound('hit');
    if (navigator.vibrate) navigator.vibrate(10, 30, 10); 
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    createExplosion(clientX, clientY);

    runTransaction(ref(db, `rooms/${roomCode}/score`), (currentScore) => {
      if (currentScore === null || currentScore >= 100 || currentScore <= 0) return currentScore;
      const change = myRoleRef.current === 'host' ? 1.0 : -1.0; 
      return currentScore + change;
    });
  };

  const handleRematchClick = async () => {
    if (navigator.vibrate) navigator.vibrate(20);
    const fieldToUpdate = myRoleRef.current === 'host' ? 'hostRematch' : 'guestRematch';
    await update(ref(db, `rooms/${roomCode}`), { [fieldToUpdate]: true });
  };

  const handleBackToLobby = () => {
    if (roomCode) off(ref(db, `rooms/${roomCode}`));
    setGameState('lobby'); setRoomCode(''); setJoinCodeInput(''); setScore(50);
    myRoleRef.current = null; roomRef.current = null; 
    gameOverRef.current = false; soundPlayedRef.current = false;
    setRematchStatus({ me: false, opponent: false });
  };

  const toggleLang = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  // --- 视觉计算 ---
  const myProgress = myRoleRef.current === 'host' ? score : (100 - score);
  const stoneZ = (50 - myProgress) * 10; 

  let centerText = t.clash;
  let dangerLevel = 0; 
  if (myProgress > 60) { centerText = t.pushing; dangerLevel = 1; }
  if (myProgress > 80) { centerText = t.crushing; dangerLevel = 2; }
  if (myProgress < 40) { centerText = t.resist; dangerLevel = 1; }
  if (myProgress < 20) { centerText = t.danger; dangerLevel = 2; }

  return (
    <div className={isShaking ? 'shaking' : ''} style={styles.container}>
      {gameState !== 'lobby' && (
        <div style={styles.scene3D}>
          {/* 太阳 */}
          <div style={styles.sun}></div>
          {/* 云朵 */}
          <div className="cloud-slow" style={{...styles.cloud, top: '15%', left: '10%'}}></div>
          <div className="cloud-medium" style={{...styles.cloud, top: '25%', left: '60%', transform: 'scale(0.8)', opacity: 0.8}}></div>
          
          {/* 地面图层 */}
          <div style={styles.fullScreenRoad}></div>
        </div>
      )}

      {/* --- 大厅 --- */}
      {gameState === 'lobby' && (
        <div style={styles.lobbyOverlay}>
          <button style={styles.langBtn} onClick={toggleLang}>
            {lang === 'zh' ? '🇺🇸 EN' : '🇨🇳 中文'}
          </button>

          <div style={styles.lobbyInner}>
            <h1 style={styles.medievalTitle}>{t.title}</h1>
            
            <div style={styles.woodCard}>
              <button style={styles.btnWoodPrimary} onClick={createRoom}>{t.create}</button>
              {roomCode && (
                <div style={{marginTop:'15px'}}>
                  <p style={{color:'#5c4033'}}>{t.roomCode}: <strong>{roomCode}</strong></p>
                  <p style={{fontSize:'0.8rem'}}>{t.waitOpponent}</p>
                </div>
              )}
            </div>
            
            <div style={styles.woodCard}>
              <input 
                style={styles.parchmentInput} 
                placeholder={t.inputPlaceholder}
                value={joinCodeInput} 
                onChange={e => setJoinCodeInput(e.target.value)} 
                type="tel" 
              />
              <button style={styles.btnWoodSecondary} onClick={joinRoom}>{t.join}</button>
            </div>
          </div>
          
          <div style={styles.footer}>
            <p style={{margin: 0}}>{t.producedBy}</p>
            <p style={{margin: '5px 0 0', fontSize: '0.7rem', opacity: 0.7}}>{t.rights}</p>
          </div>
        </div>
      )}

      {/* --- 游戏层 --- */}
      {(gameState === 'playing' || gameState === 'finished') && (
        <div style={styles.gameLayer} onPointerDown={handlePush}>
          
          <div style={styles.centerHud}>
             <motion.div 
                key={centerText}
                animate={{ 
                  scale: dangerLevel === 2 ? [1, 1.5, 1] : [1, 1.2, 1],
                  opacity: dangerLevel === 0 ? 0.5 : 1,
                  color: dangerLevel === 2 ? '#FF5722' : (dangerLevel === 1 ? '#FFC107' : '#fff')
                }}
                transition={{ repeat: Infinity, duration: dangerLevel === 2 ? 0.3 : 0.8 }}
                style={styles.bigStatusText}
             >
               {centerText}
             </motion.div>
          </div>

          <div style={styles.progressBarWrapper}>
             <div style={styles.progressBarTrack}>
               <div style={{
                 position: 'absolute', bottom: 0, left: 0, right: 0,
                 height: `${Math.max(0, Math.min(100, myProgress))}%`,
                 backgroundColor: myProgress>60?'#66bb6a':myProgress<40?'#ef5350':'#ffa726',
                 transition: 'height 0.1s linear'
               }}></div>
             </div>
          </div>

          <div style={styles.stoneStage}>
            <motion.div 
              style={styles.stoneWrapper}
              animate={{ translateZ: stoneZ }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
               <div style={styles.stone}>🪨</div>
            </motion.div>
          </div>

          <AnimatePresence>
            {gameState === 'finished' && (
              <motion.div 
                style={styles.resultOverlay}
                initial={{opacity:0}} animate={{opacity:1}}
              >
                <div style={styles.parchmentScroll}>
                  <h1 style={{...styles.medievalTitle, fontSize:'3rem', marginBottom:'20px'}}>
                    {resultText}
                  </h1>
                  
                  <div style={styles.rematchStatusArea}>
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'5px'}}>
                       <div style={{...styles.statusDot, background: rematchStatus.me ? '#4CAF50' : '#9e9e9e', boxShadow: rematchStatus.me ? '0 0 10px #4CAF50' : 'none'}}></div>
                       <span style={{fontSize:'12px', color:'#3e2723'}}>{t.vsMe}</span>
                    </div>
                    <span style={{margin:'0 15px', color: '#3e2723', fontWeight:'bold', fontSize:'20px'}}>VS</span>
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'5px'}}>
                       <div style={{...styles.statusDot, background: rematchStatus.opponent ? '#4CAF50' : '#9e9e9e', boxShadow: rematchStatus.opponent ? '0 0 10px #4CAF50' : 'none'}}></div>
                       <span style={{fontSize:'12px', color:'#3e2723'}}>{t.vsOpp}</span>
                    </div>
                  </div>
                  
                  <div style={styles.buttonGroup}>
                    {!rematchStatus.me ? (
                       <button style={styles.btnWoodPrimary} onClick={handleRematchClick}>{t.rematch}</button>
                    ) : (
                       <button style={{...styles.btnWoodPrimary, background:'#a1887f', cursor:'default'}} disabled>
                         {rematchStatus.opponent ? t.soon : t.waiting}
                       </button>
                    )}
                    <button style={styles.btnWoodSecondary} onClick={handleBackToLobby}>{t.leave}</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// --- CSS ---
const styles = {
  // 修复2：使用 100dvh 解决手机端底部漏光问题
  container: { 
    height: '100dvh', // Dynamic Viewport Height
    width: '100vw', 
    overflow: 'hidden', 
    touchAction: 'none', 
    userSelect: 'none', 
    fontFamily: '"Palatino Linotype", "Book Antiqua", serif', 
    backgroundColor: '#87CEEB' 
  },

  langBtn: {
    position: 'absolute', top: '20px', right: '20px',
    background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff',
    padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', zIndex: 60,
    fontWeight: 'bold', fontSize: '14px'
  },

  scene3D: {
    position: 'absolute', width: '100%', height: '100%',
    perspective: '800px', perspectiveOrigin: '50% 50%',
    overflow: 'hidden', zIndex: 0,
  },
  
  // 修复1：制造一条硬地平线，防止天空颜色透出
  fullScreenRoad: {
    position: 'absolute', 
    width: '300vw', height: '300vh', 
    left: '-100vw', top: '-100vh', 
    // 前20%完全透明(留给天空)，在20%处突然变为结实的泥土色
    backgroundImage: `linear-gradient(to bottom, #3e2723 50%, #1a120b 100%)`,
    transform: 'rotateX(40deg) translateZ(-500px)',
    boxShadow: 'inset 0 0 200px rgba(0,0,0,0.5)', 
  },

  sun: {
    position: 'absolute', top: '10%', right: '15%',
    width: '80px', height: '80px',
    backgroundColor: '#FFD700', borderRadius: '50%',
    boxShadow: '0 0 40px #FFD700, 0 0 80px #FFA500'
  },

  cloud: {
    position: 'absolute', width: '120px', height: '40px',
    backgroundColor: '#fff', borderRadius: '50px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    opacity: 0.9,
  },

  lobbyOverlay: {
    position: 'absolute', inset: 0, zIndex: 50,
    backgroundImage: `
      linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
      url(${LobbyBg})
    `,
    backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    animation: 'fadeIn 1s ease-out' 
  },
  lobbyInner: { width: '320px', textAlign: 'center' },
  
  footer: {
    position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center',
    color: '#aaa', fontSize: '0.8rem', letterSpacing: '1px', textShadow: '1px 1px 2px #000'
  },

  gameLayer: { position: 'absolute', inset: 0, zIndex: 10 },
  
  centerHud: {
    position: 'absolute', top: '20%', left: 0, right: 0, 
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 15,
    pointerEvents: 'none'
  },
  bigStatusText: {
    fontSize: '3rem', fontWeight: '900', letterSpacing: '5px',
    textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
    fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif'
  },

  stoneStage: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    perspective: '800px', perspectiveOrigin: '50% 50%',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
  stoneWrapper: {
    position: 'absolute', 
    bottom: '20%', 
    transformStyle: 'preserve-3d'
  },
  stone: { fontSize: '140px', filter: 'drop-shadow(0 40px 20px rgba(0,0,0,0.6))' },

  medievalTitle: { color: '#f8c300', textShadow: '3px 3px 0 #3e2723', fontSize: '2.5rem', marginBottom: '20px', fontWeight: '900' },
  woodCard: {
    background: 'linear-gradient(to right, #8d6e63, #a1887f, #8d6e63)',
    padding: '20px', borderRadius: '10px', border: '4px solid #3e2723',
    marginBottom: '15px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
  },
  btnWoodPrimary: {
    width: '100%', padding: '15px', fontSize: '18px', fontWeight: 'bold',
    background: 'linear-gradient(#d7ccc8, #a1887f)', border: '2px solid #3e2723',
    borderRadius: '8px', cursor: 'pointer', color: '#3e2723', transition: 'all 0.2s'
  },
  btnWoodSecondary: {
    width: '100%', padding: '12px', marginTop: '10px', fontWeight: 'bold',
    background: '#5d4037', border: '2px solid #3e2723', borderRadius: '8px', color: '#d7ccc8'
  },
  parchmentInput: {
    boxSizing: 'border-box', 
    width: '100%', 
    padding: '12px', 
    marginBottom: '10px', 
    borderRadius: '5px', 
    border: '2px solid #3e2723',
    backgroundColor: '#efebe9', 
    color: '#3e2723', 
    textAlign: 'center', 
    fontSize: '18px', 
    fontWeight: 'bold',
    display: 'block', 
    margin: '0 auto 10px auto' 
  },

  progressBarWrapper: {
    position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
    height: '200px', width: '20px', background: '#3e2723', padding: '3px', borderRadius: '10px', zIndex: 20
  },
  progressBarTrack: { width: '100%', height: '100%', position: 'relative', background: '#1a1a1a', borderRadius: '6px', overflow: 'hidden' },

  resultOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
  },
  parchmentScroll: {
    width: '320px', padding: '30px', background: '#efebe9',
    borderTop: '10px solid #3e2723', borderBottom: '10px solid #3e2723',
    display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  rematchStatusArea: { display: 'flex', alignItems: 'center', marginBottom: '20px' },
  statusDot: { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #3e2723', transition: 'background 0.3s' },
  buttonGroup: { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }
};

export default App;