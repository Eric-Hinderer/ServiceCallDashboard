// "use client";
// import { useState } from "react";
// import { generateGeminiSummary, getServiceCalls } from "./action";
// // Import your action directly

// export default function ServiceCallSummary() {
//   const [summary, setSummary] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   async function handleGenerateSummary() {
//     setLoading(true);

//     try {
//       // Fetch all service calls (you'll need to implement this)
//       const serviceCalls = await getServiceCalls();

//       // Directly call the server-side action to generate the summary
//       const generatedSummary = await generateGeminiSummary(serviceCalls);
//       setSummary(generatedSummary);
//     } catch (error) {
//       console.error(error);
//       setSummary("Error generating summary");
//     } finally {
//       setLoading(false);
//     }
//   }

//   const formattedText = summary
//     ? summary
//         .replace(/\*\*(.+?):\*\*/g, '<strong>$1:</strong>') // Bolds section titles
//         .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italicizes any content wrapped in asterisks
//         .replace(/(?:•\s(.+?)\n)+/g, '<ul><li>$1</li></ul>') // Group bullet points inside one <ul>
//         .replace(/\n/g, '<br>') // Handles line breaks
//     : "";

//   return (
//     <div className="service__call_summary pt-20">
//       <h2 className="text-lg font-bold">Service Call Summary</h2>

//       {/* Button to generate the summary */}
//       <button
//         onClick={handleGenerateSummary}
//         className="bg-blue-500 text-white p-2 mt-4 rounded"
//         disabled={loading}
//       >
//         {loading ? "Generating Summary..." : "Generate Summary"}
//       </button>

//       {/* Display the generated summary */}
//       {summary && (
//         <div className="mt-4 text-left">
//           <div dangerouslySetInnerHTML={{ __html: formattedText }} />
//           <p className="text-sm mt-4">✨ Summarized with Gemini</p>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";
import { useState } from "react";
import { generateGeminiSummary, getServiceCalls } from "./action";

export default function ChatWithDatabase() {
  const [messages, setMessages] = useState([
    { role: "model", text: "Hello! How can I help you today?" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="flex flex-col h-screen pt-20">
      <div className="flex-grow overflow-y-auto p-4 bg-gray-100">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-md ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-800"
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
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            className="flex-grow border border-gray-300 rounded-l-lg p-2"
            placeholder="Type a message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
          />
          <button
            onClick={handleUserInput}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg"
            disabled={loading}
          >
            {loading ? "Loading..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
