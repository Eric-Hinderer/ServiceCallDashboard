"use client";
import { useState, useEffect, useRef } from "react";
import { generateGeminiSummary, getServiceCalls } from "./action";

export default function ChatWithDatabase() {
  const [messages, setMessages] = useState([
    { role: "model", text: "Hello! How can I help you today?" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  

  const chatContainerRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUserInput = async () => {
    if (!userInput.trim()) return;

    const userMessage = { role: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    setLoading(true);

    try {
      const serviceCalls = await getServiceCalls();
      const response = await generateGeminiSummary(serviceCalls, userInput);

      const modelMessage = { role: "model", text: response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Something went wrong, please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 bg-white shadow-inner"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-4 rounded-3xl shadow-md max-w-md ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                {msg.role === "user" ? (
                  msg.text
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-4 bg-gray-200 text-gray-900 rounded-3xl shadow-md max-w-md">
                <div className="animate-pulse">Typing...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 shadow-lg">
        <div className="flex">
          <input
            type="text"
            className="flex-grow border border-gray-300 rounded-l-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
          />
          <button
            onClick={handleUserInput}
            className="bg-blue-500 text-white px-6 py-3 rounded-r-full ml-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
