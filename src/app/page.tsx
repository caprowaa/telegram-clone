'use client';

import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

// ТВОЙ FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAXOxuXyi1I8-uR1ThadFeYWsrBWiCnov8",
  authDomain: "captowa.firebaseapp.com",
  projectId: "captowa",
  storageBucket: "captowa.firebasestorage.app",
  messagingSenderId: "648202364885",
  appId: "1:648202364885:web:ff65a1cc8b16b54d347f5c",
  databaseURL: "https://captowa-default-rtdb.asia-southeast1.firebasedatabase.app/" 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// КАСТОМНЫЙ ПЛЕЕР
const AudioPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-xl min-w-[240px] border border-black/5">
      <audio ref={audioRef} src={src} onTimeUpdate={() => setProgress((audioRef.current!.currentTime / audioRef.current!.duration) * 100)} onEnded={() => setIsPlaying(false)} />
      <div className="flex items-center gap-3">
        <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center bg-tg-primary text-white rounded-full shadow-md shrink-0 cursor-pointer">{isPlaying ? '⏸' : '▶'}</button>
        <div className="flex-1 flex flex-col gap-1">
          <input type="range" value={progress} onChange={(e) => audioRef.current!.currentTime = (Number(e.target.value) / 100) * audioRef.current!.duration} className="w-full" />
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-black/5 pt-2">
        <span className="text-xs">🔊</span>
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => {setVolume(Number(e.target.value)); audioRef.current!.volume = Number(e.target.value)}} className="flex-1 h-1" />
        <span className="text-[10px] font-bold">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
};

export default function TelegramClone() {
  const [user, setUser] = useState({ name: "User_" + Math.floor(Math.random() * 100) });
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isNightMode, setIsNightMode] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    return onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setMessages(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    document.body.className = isNightMode ? 'dark' : '';
  }, [messages, isNightMode]);

  const handleSend = (type = 'text', fileUrl = '') => {
    if (!inputValue.trim() && !fileUrl) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    push(ref(db, 'messages'), { text: inputValue, sender: user.name, type, fileUrl, time });
    setInputValue('');
    setShowEmoji(false);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    let type = 'file';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('audio/')) type = 'audio';
    handleSend(type, url);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-tg-sidebar text-tg-text">
      <aside className="w-[300px] border-r border-tg-border p-4 flex flex-col gap-4 shadow-xl">
        <div className="font-black flex justify-between items-center text-xl uppercase tracking-tighter">
          Telegram Live
          <button onClick={() => setIsNightMode(!isNightMode)} className="cursor-pointer text-lg">{isNightMode ? '☀️' : '🌙'}</button>
        </div>
        <div className="bg-tg-primary/10 p-3 rounded-2xl border border-tg-primary/20">
          <p className="text-[10px] opacity-50 uppercase font-black mb-1 text-tg-primary">Твой ник:</p>
          <input className="bg-transparent font-black outline-none w-full text-lg" value={user.name} onChange={(e) => setUser({name: e.target.value})} />
        </div>
        <div className="p-4 bg-tg-primary text-white rounded-2xl font-black text-center shadow-lg">🌐 ВЕСЬ МИР ТУТ</div>
      </aside>

      <main className="flex-1 flex flex-col tg-wallpaper relative">
        <header className="h-[56px] bg-tg-sidebar/80 backdrop-blur-md border-b border-tg-border flex items-center px-6 font-black text-lg z-10 transition-colors">LIVE CHAT</header>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`max-w-[80%] p-3 px-5 rounded-2xl shadow-md border border-black/5 ${msg.sender === user.name ? 'self-end bg-bubble-out text-black rounded-br-none' : 'self-start bg-bubble-in text-tg-text rounded-bl-none'}`}>
              <div className="text-[10px] font-black text-tg-primary mb-1 uppercase opacity-60">{msg.sender}</div>
              <div className="flex flex-col gap-2">
                {msg.type === 'image' && <img src={msg.fileUrl} className="rounded-xl max-h-[350px] shadow-sm" />}
                {msg.type === 'audio' && <AudioPlayer src={msg.fileUrl} />}
                {msg.text && <p className="whitespace-pre-wrap leading-tight font-medium">{msg.text}</p>}
              </div>
              <span className="text-[9px] opacity-40 float-right mt-1 font-black">{msg.time}</span>
            </div>
          ))}
        </div>
        <footer className="p-4 flex flex-col items-center gap-2">
          {showEmoji && (
            <div className="bg-tg-sidebar p-3 mb-2 rounded-2xl shadow-2xl flex gap-3 border border-tg-border">
              {['😊', '😂', '🔥', '👍', '❤️', '🤔', '😎'].map(e => <span key={e} onClick={() => setInputValue(v => v + e)} className="text-3xl cursor-pointer hover:scale-125 transition-transform">{e}</span>)}
            </div>
          )}
          <div className="max-w-[750px] w-full flex items-end gap-2">
            <div className="flex-1 flex items-center gap-2 bg-tg-sidebar rounded-3xl p-3 shadow-2xl border border-tg-border relative">
              <button onClick={() => setShowEmoji(!showEmoji)} className="text-2xl opacity-40 hover:opacity-100 transition cursor-pointer">😊</button>
              <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Напиши сообщение..." className="flex-1 outline-none bg-transparent" />
              <input type="file" ref={fileInputRef} className="hidden" onChange={onFile} />
              <button onClick={() => fileInputRef.current?.click()} className="text-2xl opacity-40 hover:opacity-100 transition cursor-pointer">📎</button>
            </div>
            <button onClick={() => handleSend()} className="w-12 h-12 bg-tg-primary text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform font-black">➤</button>
          </div>
        </footer>
      </main>
    </div>
  );
}