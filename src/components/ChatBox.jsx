import React, { useState } from "react";
import { BsChatDots } from "react-icons/bs";
import msg from "../assets/msg.png";
const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello, how can I help?",
      sender: "user1",
    },
    {
      id: 2,
      text: "Hello, how can I help?",
      sender: "user2",
    },
  ]);
  const [participants, setParticipants] = useState([
    {
      id: 1,
      name: "user1",
    },
    {
      id: 2,
      name: "user2",
    },
    {
      id: 3,
      name: "raj",
    },
    {
      id: 4,
      name: "mengo",
    },
    {
      id: "5",
      name: "kero",
    },
  ]);
  const [teacherMessage, setTeacherMessage] = useState([
    {
      id: 1,
      text: "Hello, how can I help?",
      sender: "teacher name",
    },
  ]);

  const handleChatIconClick = () => {
    setIsOpen(!isOpen);
  };

  const handleKickOut = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const role = localStorage.getItem("role");
  return (
    <>
      {/* Floating Icon Button */}

      <button
        onClick={handleChatIconClick}
        className="fixed bottom-4 right-4 z-45 bg-[#5A66D1] p-4 rounded-full shadow-lg text-white cursor-pointer"
        title="Click to open, double-click to close"
      >
        <img src={msg} className="w-5 h-5" />
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="fixed bottom-20 sora text-sm right-4 w-[429px] h-[477px] rounded-sm shadow-lg border border-gray-300 bg-white z-50 overflow-hidden">
          {/* Tabs Header */}
          <div className="flex border-b border-gray-300 justify-start gap-x-4 pl-4">
            <button
              onClick={() => setActiveTab("chat")}
              className={`relative px-4 py-2 font-semibold transition-all duration-200 ${
                activeTab === "chat"
                  ? "text-black border-b-2 border-[#8F64E1]"
                  : "text-gray-500 border-b-2 border-transparent"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`relative px-4 py-2 font-semibold transition-all duration-200 ${
                activeTab === "participants"
                  ? "text-black border-b-2 border-[#8F64E1]"
                  : "text-gray-500 border-b-2 border-transparent"
              }`}
            >
              Participants
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 space-y-4 bg-white max-h-96 overflow-y-auto">
            {activeTab === "chat" && (
              <>
                {activeTab === "chat" && (
                  <>
                    {/* Student Messages */}
                    {messages.map((message) => (
                      <div key={message.id} className="text-left">
                        <p className="text-sm text-purple-800 font-semibold">
                          {message.sender}
                        </p>
                        <div className="bg-black text-white px-3 py-2 mt-1 rounded-lg w-fit max-w-[70%] mr-auto">
                          {message.text}
                        </div>
                      </div>
                    ))}

                    {/* Teacher Messages */}
                    {teacherMessage.map((message) => (
                      <div key={message.id} className="text-right">
                        <p className="text-sm text-black font-semibold">
                          {message.sender}
                        </p>
                        <div className="bg-[#8F64E1] text-white px-3 py-2 mt-1 rounded-lg w-fit max-w-[70%] ml-auto">
                          {message.text}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {activeTab === "participants" && (
              <>
                <div className="flex justify-between text-[#726F6F] px-3">
                  <span>Name</span>
                  <span>Action</span>
                </div>
                <div className="text-gray-600">
                  <ul className="list-disc pl-5">
                    {participants.map((p) => {
                      return (
                        <div key={p.id} className="flex justify-between">
                          <span className="text-black">{p.name}</span>
                          {role === "student" && (
                            <button
                              onClick={() => handleKickOut(p.id)}
                              className=" text-[#1D68BD] px-3 py-2 mt-1 underline cursor-pointer rounded-lg w-fit max-w-[70%]"
                            >
                              kick out
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
