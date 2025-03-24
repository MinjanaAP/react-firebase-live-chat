import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const ChatPage = () => {
const { user, login, logout } = useAuth();
const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);

useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
    setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
}, []);

const sendMessage = async () => {
    if (!message.trim()) return;
    await addDoc(collection(db, "messages"), {
    text: message,
    senderId: user.uid,
    senderName: user.displayName,
    timestamp: serverTimestamp(),
    });
    setMessage("");
};

return (
    <div>
    {user ? (
        <>
        <div>
            {messages.map((msg) => (
            <p key={msg.id}><strong>{msg.senderName}:</strong> {msg.text}</p>
            ))}
        </div>
        <input value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
        <button onClick={logout}>Logout</button>
        </>
    ) : (
        <button onClick={login}>Login with Google</button>
    )}
    </div>
);
};

export default ChatPage;
