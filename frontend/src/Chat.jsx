import React, { useEffect, useRef, useState } from 'react';

const getRoomFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || '';
};

const WS_URL = room => `ws://${window.location.host}/room?room=${room}`;

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [room, setRoom] = useState(getRoomFromURL());
  const ws = useRef(null);

  useEffect(() => {
    if (!room) return;
    ws.current = new window.WebSocket(WS_URL(room));
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(msgs => [...msgs, data]);
      } catch (err) {
        // fallback for non-JSON messages
        setMessages(msgs => [...msgs, { name: 'system', message: event.data }]);
      }
    };
    return () => ws.current && ws.current.close();
  }, [room]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input && ws.current && ws.current.readyState === 1) {
      ws.current.send(input);
      setInput('');
    }
  };

  if (!room) {
    return (
      <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
        <h2>No room specified</h2>
        <form onSubmit={e => { e.preventDefault(); if (input) { setRoom(input); setInput(''); } }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter room name..." />
          <button type="submit">Join Room</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Room: {room}</h2>
      <div style={{ border: '1px solid #ccc', minHeight: 200, padding: 10, marginBottom: 10, background: '#fafafa', height: 300, overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: 'bold', color: '#333' }}>{msg.name}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, marginRight: 8 }}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
