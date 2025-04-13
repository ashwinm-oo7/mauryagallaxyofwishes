import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // State to toggle chat box visibility
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(process.env.REACT_APP_API_URL_WS);
    console.log(socket);
    socket.onopen = () => {
      console.log(
        "WebSocket connection established",
        process.env.REACT_APP_API_URL_WS
      );
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const botResponses = event.data
        .split("\n")
        .filter((response) => response.trim() !== "");
      const newMessages = botResponses.map((response) => ({
        text: response,
        sender: "bot",
      }));

      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, []);
  const linkify = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #007bff;">${url}</a>`;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !ws) return;

    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);
    ws.send(input);
    setInput("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      console.log("Voice Input:", spokenText);
      setInput(spokenText); // optional: display in input
      const userMessage = { text: spokenText, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      if (ws) ws.send(spokenText);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      console.error("Speech recognition error:", event.error);
    };
  };

  return (
    <div>
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            width: "50px",
            height: "50px",
            background: "#007bff",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
          }}
        >
          <span style={{ color: "#fff", fontSize: "24px" }}>💬</span>
        </div>
      )}
      {isOpen && (
        <div
          ref={chatBoxRef}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            width: "300px",
            height: "500px",
            position: "fixed",
            bottom: "10px",
            right: "10px",
            background: "rgb(231 224 224 / 96%)",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            zIndex: 9999,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Chat with us!</h3>
            <span
              onClick={() => setIsOpen(false)}
              style={{ cursor: "pointer" }}
            >
              ✖
            </span>
          </div>
          <div style={{ height: "300px", overflowY: "auto", padding: "5px" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  marginBottom: "10px",
                }}
              >
                <p
                  style={{
                    display: "inline-block",
                    padding: "10px",
                    borderRadius: "10px",
                    maxWidth: "90%",
                    wordBreak: "break-word",
                    background: msg.sender === "user" ? "#007bff" : "#f1f1f1",
                    color: msg.sender === "user" ? "#fff" : "#000",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong>{" "} */}
                  {/* {msg.text} */}
                  <span
                    dangerouslySetInnerHTML={{ __html: linkify(msg.text) }}
                  />
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: "", gap: "" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              onKeyDown={handleKeyPress}
              style={{ width: "100%", padding: "5px", paddingRight: "30px" }}
            />
            <FaMicrophone
              onClick={handleVoiceInput}
              style={{
                position: "absolute",
                right: "15px",
                top: "77%",
                transform: "translateY(-50%)",
                border: "none",
                backgroundColor: "transparent",
                color: isListening ? "#727274" : "rgb(155 155 155)",
                cursor: "pointer",
                fontSize: "17px",
              }}
              title="Click to Speak"
            />
            <button
              onClick={handleSend}
              style={{ width: "100%", padding: "5px" }}
            >
              Send
            </button>
          </div>{" "}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
