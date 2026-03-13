'use client';

import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function TelegramClone() {
  const [user, setUser] = useState({ name: "User_" + Math.floor(Math.random() * 100) });
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isNightMode, setIsNightMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    return onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    document.body.className = isNightMode ? 'dark' : '';
  }, [messages, isNightMode]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    push(ref(db, 'messages'), { text: inputValue, sender: user.name, time });
    setInputValue('');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-tg-sidebar text-tg-text font-sans">
      <aside className="w-[300px] border-r border-tg-border p-4 flex flex-col gap-4">
        <div className="font-bold flex justify-between items-center text-xl">
          Telegram Live
          <button onClick={() => setIsNightMode(!isNightMode)} className="cursor-pointer">{isNightMode ? '☀️' : '🌙'}</button>
        </div>
        <div className="bg-tg-primary/10 p-3 rounded-xl border border-tg-primary/20">
          <p className="text-[10px] opacity-50 uppercase font-bold mb-1 text-tg-primary">Твой ник:</p>
          <input className="bg-transparent font-bold outline-none w-full" value={user.name} onChange={(e) => setUser({name: e.target.value})} />
        </div>
        <div className="p-3 bg-tg-primary text-white rounded-xl font-bold text-center">🌐 Весь мир тут</div>
      </aside>

      <main className="flex-1 flex flex-col tg-wallpaper">
        <header className="h-[56px] bg-tg-sidebar border-b border-tg-border flex items-center px-6 font-bold shadow-sm transition-colors">Общий чат</header>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`max-w-[75%] p-2 px-4 rounded-2xl shadow-sm border border-black/5 ${msg.sender === user.name ? 'self-end bg-bubble-out text-black rounded-br-none' : 'self-start bg-bubble-in text-tg-text rounded-bl-none'}`}>
              <div className="text-[10px] font-bold text-tg-primary mb-1 uppercase">{msg.sender}</div>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <span className="text-[9px] opacity-40 float-right mt-1 font-bold">{msg.time}</span>
            </div>
          ))}
        </div>
        <footer className="p-4 flex gap-2 max-w-[800px] w-full mx-auto">
          <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Напиши сообщение..." className="flex-1 bg-tg-sidebar rounded-2xl p-3 shadow-lg outline-none border border-tg-border" />
          <button onClick={handleSend} className="w-12 h-12 bg-tg-primary text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-90 transition-transform font-bold">➤</button>
        </footer>
      </main>
    </div>
  );
}