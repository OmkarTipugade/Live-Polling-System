import LandingPage from "./components/LandingPage";
import PreQuestion from "./components/PreQuestion";
import StudentPage from "./components/StudentPage";
import TeacherPage from "./components/TeacherPage";
import { Routes, Route } from "react-router-dom";
import ChatBox from "./components/ChatBox";
import TeacherQuePage from "./components/TeacherQuePage";
import StudentQuePage from "./components/StudentQuePage";
import KickOut from "./components/KickOut";
import ViewPollHistory from "./components/ViewPollHistory";
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/PreQuestion" element={<PreQuestion />} />
        <Route path="/tque" element={<TeacherQuePage />} />
        <Route path="/sque" element={<StudentQuePage />} />
        <Route path="/kick-out" element={<KickOut />} />
        <Route path="/poll-hist" element={<ViewPollHistory />} />
      </Routes>
      <ChatBox />
    </>
  );
};

export default App;
