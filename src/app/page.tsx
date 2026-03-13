'use client';

import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAXOxuXyi1I8-uR1ThadFeYWsrBWiCnov8",
  authDomain: "captowa.firebaseapp.com",
  projectId: "captowa",
  storageBucket: "captowa.firebasestorage.app",
  messagingSenderId: "648202364885",
  appId: "1:648202364885:web:ff65a1cc8b16b54d347f5c",
  databaseURL: "https://captowa-default-rtdb.asia-southeast1.firebasedatabase.app/" 
};

// Инициализируем Firebase только один раз
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export default function TelegramClone() {
  const [user, setUser] = useState({ name: "User" });
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isNightMode, setIsNightMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // Флаг готовности
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. ЗАГРУЗКА ДАННЫХ ПРИ СТАРТЕ
  useEffect(() => {
    // Достаем ник и тему из памяти
    const savedName = localStorage.getItem('tg_user_name');
    const savedTheme = localStorage.getItem('tg_night_mode');
    
    if (savedName) setUser({ name: savedName });
    if (savedTheme === 'true') setIsNightMode(true);
    
    setIsLoaded(true); // Готово к работе

    // Подключаемся к базе
    const messagesRef = ref(db, 'messages');
    return onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }
    });
  }, []);

  // 2. СОХРАНЕНИЕ НИКА
  const changeName = (newName: string) => {
    setUser({ name: newName });
    localStorage.setItem('tg_user_name', newName);
  };

  // 3. СОХРАНЕНИЕ ТЕМЫ
  useEffect(() => {
    if (!isLoaded) return;
    document.body.className = isNightMode ? 'dark' : '';
    localStorage.setItem('tg_night_mode', isNightMode.toString());
  }, [isNightMode, isLoaded]);

  // СКРОЛЛ
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    push(ref(db, 'messages'), { 
      text: inputValue, 
      sender: user.name, 
      time 
    }).catch(err => console.error("Ошибка отправки:", err));
    setInputValue('');
  };

  if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center bg-white text-black">Загрузка чата...</div>;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-tg-sidebar text-tg-text font-sans transition-colors duration-300">
      
      {/* ЛЕВАЯ ПАНЕЛЬ */}
      <aside className="w-[320px] border-r border-tg-border p-5 flex flex-col gap-6 bg-tg-sidebar shadow-2xl z-20">
        <div className="flex justify-between items-center">
          <h1 className="font-black text-2xl tracking-tighter text-tg-primary">TELEGRAM LIVE</h1>
          <button 
            onClick={() => setIsNightMode(!isNightMode)} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition cursor-pointer text-xl"
          >
            {isNightMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-tg-primary/5 p-4 rounded-2xl border border-tg-primary/10">
            <label className="text-[10px] font-black uppercase opacity-40 mb-2 block tracking-widest text-tg-primary">Твой профиль</label>
            <input 
              className="bg-transparent font-black outline-none w-full text-lg" 
              value={user.name} 
              onChange={(e) => changeName(e.target.value)} 
              placeholder="Введите имя..."
            />
          </div>
          <div className="p-4 bg-tg-primary text-white rounded-2xl font-black text-center shadow-lg transform active:scale-95 transition cursor-default">
            🌐 GLOBAL CHAT
          </div>
        </div>

        <div className="mt-auto text-[10px] opacity-30 text-center font-bold">
          CONNECTED TO FIREBASE SIN
        </div>
      </aside>

      {/* ОКНО ЧАТА */}
      <main className="flex-1 flex flex-col tg-wallpaper relative">
        <header className="h-[64px] bg-tg-sidebar/80 backdrop-blur-lg border-b border-tg-border flex items-center px-8 font-black text-xl z-10">
          #general
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.length > 0 ? messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`max-w-[85%] p-3 px-5 rounded-3xl shadow-md border border-black/5 transition-all ${
                msg.sender === user.name 
                ? 'self-end bg-bubble-out text-black rounded-br-none' 
                : 'self-start bg-bubble-in text-tg-text rounded-bl-none'
              }`}
            >
              <div className="text-[10px] font-black text-tg-primary mb-1 uppercase tracking-tight">
                {msg.sender === user.name ? 'Вы' : msg.sender}
              </div>
              <p className="whitespace-pre-wrap leading-tight font-medium text-[15px]">{msg.text}</p>
              <div className="flex items-center justify-end gap-1 mt-1 opacity-40">
                <span className="text-[9px] font-black">{msg.time}</span>
                {msg.sender === user.name && <span className="text-[10px]">✓✓</span>}
              </div>
            </div>
          )) : (
            <div className="m-auto bg-black/20 text-white px-6 py-2 rounded-full backdrop-blur-md font-bold">
              Сообщений пока нет. Начни первым!
            </div>
          )}
        </div>

        <footer className="p-6 flex justify-center w-full z-10">
          <div className="max-w-[800px] w-full flex items-end gap-3 px-2">
            <div className="flex-1 flex items-center gap-3 bg-tg-sidebar rounded-[24px] p-3 shadow-2xl border border-tg-border relative transition-all focus-within:ring-2 focus-within:ring-tg-primary/30">
              <button className="text-2xl opacity-30 hover:opacity-100 transition cursor-pointer">📎</button>
              <input 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="Напиши сообщение..." 
                className="flex-1 outline-none bg-transparent py-1 text-[16px]" 
              />
            </div>
            <button 
              onClick={handleSend} 
              className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                inputValue.trim() ? 'bg-tg-primary text-white' : 'bg-tg-sidebar text-tg-primary opacity-50'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2 .01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </div>
        </footer>
      </m in> 
    </div>
  );
}