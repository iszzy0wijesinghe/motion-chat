import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function ChatPage() {
  const [username, setUsername] = useState("");
  const [isSet, setIsSet] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("send_message", {
        user: username,
        text: message,
        time: new Date().toLocaleTimeString(),
      });
      setMessage("");
    }
  };



  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      {!isSet ? (
        <form onSubmit={(e) => { e.preventDefault(); setIsSet(true); }}>
          <h2>Enter your name</h2>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit">Join Chat</button>
        </form>
      ) : (
        <>
          <h2>Hi {username} 👋</h2>
          <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px" }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "10px" }}
            />
            <button type="submit">Send</button>
          </form>
          <ul style={{ marginTop: "20px", paddingLeft: 0 }}>
            {chat.map((msg, idx) => (
              <li key={idx} style={{ listStyle: "none", margin: "8px 0" }}>
                <strong>{msg.user}</strong> [{msg.time}]: {msg.text}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
