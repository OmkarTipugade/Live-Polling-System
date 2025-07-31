import React, { useState, useEffect } from "react";
import clock from "../assets/clock.png";
import PollOption from "./PollOption";
const StudentQuePage = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [question, setQuestion] = useState({
    qno: 1,
    que: " Which planet is known as the Red Planet?",
    qtime: 30,
  });
  const [timer, setTimer] = useState(question.qtime);
  const [submitted, setSubmitted] = useState(false);

  const [pollData, setPollData] = useState([
    { id: 1, text: "Mars", votes: 12 },
    { id: 2, text: "Venus", votes: 10 },
    { id: 3, text: "Jupiter", votes: 9 },
    { id: 4, text: "Saturn", votes: 20 },
  ]);
  const totalVotes = pollData.reduce((sum, opt) => sum + opt.votes, 0);

  useEffect(() => {
    if (timer > 0 && !submitted) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !submitted) {
      setSubmitted(true);
    }
  }, [timer, submitted]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white relative px-4 py-10 sora">
      <div className="max-w-xl w-full mx-auto pt-14">
        {/* Question Number above the box */}
        <div className="flex justify-start items-center gap-9">
          <div className="text-black font-semibold text-xl mb-5">
            Question {question.qno}
          </div>
          <div className="flex space-x-2 items-center mb-5">
            <img src={clock} className="h-5 w-5" />
            <div className="text-red-500 font-medium">
              {`${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(
                timer % 60
              ).padStart(2, "0")}`}
            </div>
          </div>
        </div>
        {/* Question Box */}
        <div className="border border-[#AF8FF1] rounded-lg overflow-hidden shadow">
          <div className="bg-gradient-to-r from-[#343434] to-[#6E6E6E] px-4 py-3">
            <span className="text-white font-semibold text-sm">
              {question.que}
            </span>
          </div>

          <div className="p-4 mt-4">
            {pollData.map((option) => (
              <div
                key={option.id}
                onClick={() => {
                  if (!submitted) setSelectedOption(option.id);
                }}
                className={`cursor-pointer ${
                  selectedOption === option.id
                    ? "ring ring-[#8F64E1] bg-white"
                    : ""
                } rounded-sm mb-2`}
                style={{ transition: "background 0.2s, box-shadow 0.2s" }}
              >
                {submitted ? (
                  <PollOption
                    option={{ ...option, totalVotes }}
                    showPercentage={true}
                  />
                ) : (
                  <div
                    className={`relative border border-[#F6F6F6] rounded-sm overflow-hidden mb-2${
                      selectedOption === option.id ? "bg-white" : "bg-[#F6F6F6]"
                    }`}
                  >
                    <div className="absolute top-0 left-0 h-full  transition-all duration-300"></div>
                    <div className="relative z-10 flex justify-between items-center px-4 py-2 border border-transparent rounded-md">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full ${
                            selectedOption === option.id
                              ? "bg-[#8F64E1] text-white"
                              : "bg-[#8D8D8D] text-white"
                          } flex items-center justify-center text-sm font-bold`}
                        >
                          {option.id}
                        </div>
                        <p
                          className={`text-sm font-medium ${
                            selectedOption === option.id
                              ? "text-black"
                              : "text-[#2E2E2E]"
                          }`}
                        >
                          {option.text}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ask new question button */}
        <div className="flex justify-end mb-6 mt-8 gap-4">
          {!submitted && (
            <button
              className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white text-sm font-medium px-14 py-3 rounded-full shadow"
              onClick={handleSubmit}
              disabled={submitted}
            >
              Submit
            </button>
          )}
        </div>
        {(submitted || question.qtime === 0) && (
          <div className="flex justify-center items-center mt-8">
            <span className="text-black text-lg font-medium text-center">
              Wait for the teacher to ask a new question...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuePage;
