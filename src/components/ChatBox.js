import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaReply } from "react-icons/fa"; // Reply icon from react-icons

const ChatBox = () => {
  const messageRefs = useRef([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showReplyBtnIndex, setShowReplyBtnIndex] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [showReplyButton, setShowReplyButton] = useState(false);
  const [replyButtonPosition, setReplyButtonPosition] = useState({
    top: 0,
    left: 0,
  });

  const userId = localStorage.getItem("userId") || null;
  // new
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setShowReplyButton(false);
        return;
      }

      const selected = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Position slightly above the selected text
      const relativeTop = rect.top + window.scrollY - 40;
      const relativeLeft = rect.left + window.scrollX;

      setSelectedText(selected);
      setReplyButtonPosition({ top: relativeTop, left: relativeLeft });
      setShowReplyButton(true);
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection); // mobile support

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, []);

  // end
  useEffect(() => {
    let socket;
    const connectWebSocket = () => {
      socket = new WebSocket(process.env.REACT_APP_API_URL_WS);
      socket.onopen = () => {
        setWs(socket);
      };
      socket.onmessage = (event) => {
        const botResponses = event.data
          .split("\n")
          .filter((response) => response.trim() !== "");
        // ✅ Add this line if you want the reply-to feature
        // const newMessages = botResponses.map((response) => ({
        //   text: response,
        //   sender: "bot",
        //   replyTo: messages[messages.length - 1]?.text || null,
        // }));
        // setMessages((prevMessages) => [...prevMessages, ...newMessages]);
        setMessages((prevMessages) => {
          const lastUserMessageIndex = [...prevMessages]
            .reverse()
            .findIndex((msg) => msg.sender === "user");
          const trueIndex =
            lastUserMessageIndex !== -1
              ? prevMessages.length - 1 - lastUserMessageIndex
              : null;
          const replyTo =
            trueIndex !== null ? prevMessages[trueIndex]?.text : null;

          const newMessages = botResponses.map((response) => ({
            text: response,
            sender: "bot",
            replyTo: replyTo,
            replyToIndex: trueIndex,
          }));

          return [...prevMessages, ...newMessages];
        });
      };
      socket.onclose = (e) => {
        console.log("WebSocket connection closed");
        console.log("Reconnecting in 2s...", e.reason);
        setTimeout(() => {
          console.log("🔁 Reconnecting WebSocket...");
          connectWebSocket();
        }, 2000);
      };
      socket.onerror = (err) => {
        console.error("⚠️ WebSocket error:", err.message);
        socket.close(); // Triggers onclose
      };
    };

    connectWebSocket(); // Initial connection

    return () => {
      console.log("🧹 Cleaning up WebSocket");
      if (socket) socket.close();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleClickOutside = (event) => {
    if (chatBoxRef.current && !chatBoxRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !ws) return;
    const userMessage = { text: input, sender: "user", replyTo };
    const getLastFewMessages = (count = 3) =>
      messages?.slice(-count).map((m) => m.text);

    const messagePayload = JSON.stringify({
      userId,
      text: input,
      context: getLastFewMessages(),
      replyTo: replyTo?.text || null,
    });
    setMessages([...messages, userMessage]);
    ws.send(messagePayload);
    setInput("");
    setReplyTo(null);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
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
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      const userMessage = { text: spokenText, sender: "user", replyTo };
      setMessages((prev) => [...prev, userMessage]);
      ws.send(
        JSON.stringify({
          userId,
          text: spokenText,
          replyTo: replyTo?.text || null,
        })
      );
      setReplyTo(null);
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
                id={`message-${index}`}
                ref={(el) => (messageRefs.current[index] = el)}
                className={`message ${msg.sender}`}
                onClick={() => {
                  if (msg.replyToIndex !== undefined) {
                    const scrollTo = messageRefs.current[msg.replyToIndex];
                    scrollTo?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  marginBottom: replyTo ? "30px" : "10px",
                  position: "relative",
                }}
                onMouseEnter={() =>
                  msg.sender !== "user" && setShowReplyBtnIndex(index)
                }
                onMouseLeave={() => setShowReplyBtnIndex(null)}
              >
                <p
                  style={{
                    display: "inline-block",
                    padding: "10px",
                    borderRadius: "10px",
                    maxWidth: "90%",
                    wordBreak: "break-word",
                    background:
                      msg.sender === "user" ? "rgb(245 250 255)" : "#f1f1f1",
                    color: msg.sender === "user" ? "#fff" : "#000",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {msg.replyTo && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#888",
                        marginBottom: "5px",
                      }}
                    >
                      {msg.replyTo.text?.slice(0, 30)}
                    </div>
                  )}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          style={{ color: "#007bff" }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {props.children}
                        </a>
                      ),
                      li: ({ children }) => (
                        <li style={{ marginBottom: "5px" }}>{children}</li>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </p>

                {showReplyBtnIndex === index && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "0",
                      fontSize: "18px",
                    }}
                    onClick={() => setReplyTo(msg)}
                  >
                    <FaReply />
                  </span>
                )}
              </div>
            ))}
            {showReplyButton && (
              <div
                style={{
                  position: "absolute",
                  top: `${replyButtonPosition.top}px`,
                  left: `${replyButtonPosition.left}px`,
                  background: "#007bff",
                  color: "#fff",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  zIndex: 10000,
                  fontSize: "12px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  opacity: showReplyButton ? 1 : 0,
                  transition:
                    "opacity 0.3s ease-in-out, transform 0.2s ease-in-out",
                  transform: showReplyButton
                    ? "translateY(0)"
                    : "translateY(-5px)",
                }}
                onClick={() => {
                  setReplyTo((prev) => ({
                    text: prev?.text
                      ? `${prev.text}\n---\n${selectedText}`
                      : selectedText,
                  }));
                  setShowReplyButton(false);
                  window.getSelection().removeAllRanges();
                }}
              >
                Reply
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              borderTop: "1px solid #ddd",
              // backgroundColor: "#fff",
              position: "relative",
            }}
          >
            {/* Reply-to section, floating above input bar */}
            {replyTo && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%", // just above the input bar
                  left: 0,
                  right: 0,
                  backgroundColor: "#f1f1f1",
                  padding: "8px 12px",
                  borderTopLeftRadius: "6px",
                  borderTopRightRadius: "6px",
                  borderLeft: "4px solid #007bff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#333",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    maxWidth: "90%",
                  }}
                  title={replyTo.text}
                >
                  <strong style={{ fontSize: "20px" }}>⤷ :</strong>"
                  {replyTo.text}"
                </div>
                <div
                  onClick={() => setReplyTo(null)}
                  style={{
                    marginLeft: "8px",
                    cursor: "pointer",
                    color: "#888",
                  }}
                  title="Cancel reply"
                >
                  ✖
                </div>
              </div>
            )}

            {/* Input section */}
            <div
              style={{ padding: "1px", paddingTop: replyTo ? "10px" : "10px" }}
            >
              {" "}
              {/* Push input down only when replyTo exists */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <textarea
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  onKeyDown={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: "10px 40px 10px 10px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    width: "100%",
                  }}
                />
                <FaMicrophone
                  onClick={handleVoiceInput}
                  style={{
                    position: "absolute",
                    right: "10px",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: isListening ? "#727274" : "#aaa",
                  }}
                  title="Click to speak"
                />
              </div>
              <button
                onClick={handleSend}
                style={{
                  marginTop: "2px",
                  width: "100%",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  padding: "10px",
                  fontSize: "16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
