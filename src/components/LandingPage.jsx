import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BadgeStar from "./BadgeStar";

const LandingPage = () => {
  const [selectedRole, setSelectedRole] = useState("student");
  const navigate = useNavigate();

  const roleOptions = [
    {
      id: "student",
      title: "I'm a Student",
      description:
        "Participate in live polls, answer questions in real-time, and track your responses instantly.",
    },
    {
      id: "teacher",
      title: "I'm a Teacher",
      description:
        "Create engaging polls, receive student responses live, and visualize results instantly.",
    },
  ];

  return (
    <main className="bg-white flex flex-col items-center justify-center min-h-screen px-4 relative">
      <div className="absolute top-6 sm:top-10">
        <BadgeStar />
      </div>

      <div className="mt-[100px] text-center max-w-2xl space-y-3 px-2">
        <h1 className="text-2xl sm:text-4xl font-normal text-black sora">
          Welcome to the{" "}
          <span className="font-semibold">Live Polling System</span>
        </h1>
        <p className="text-[#666] text-base sm:text-lg font-normal sora">
          Please select the role that best describes you to begin using the live
          polling system
        </p>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-6 mt-10 justify-center items-center w-full px-2">
        {roleOptions.map((role) => (
          <div
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`w-full sm:w-[350px] h-auto sm:h-[143px] rounded-xl cursor-pointer transition-all p-5 border ${
              selectedRole === role.id
                ? "border-2 border-[#7565D9]"
                : "border border-[#F2F2F2]"
            }`}
          >
            <h2 className="text-lg sm:text-[23px] font-semibold text-black mb-2 sora">
              {role.title}
            </h2>
            <p className="text-[#454545] text-sm sm:text-base font-normal sora">
              {role.description}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          localStorage.setItem("role", selectedRole);
          navigate(`/${selectedRole}`);
        }}
        className="mt-10 sm:mt-14 w-full max-w-[234px] h-[52px] sm:h-[58px] rounded-full bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-base sm:text-lg font-semibold text-white hover:opacity-90 transition sora"
      >
        Continue
      </button>
    </main>
  );
};

export default LandingPage;
