// pages/poll-history.jsx (or wherever you render it)
import PollHistory from "./PollHistory";

const samplePolls = [
  {
    question: "Which planet is known as the Red Planet?",
    options: [
      { id: 1, text: "Mars", votes: 15 },
      { id: 2, text: "Venus", votes: 1 },
      { id: 3, text: "Jupiter", votes: 1 },
      { id: 4, text: "Saturn", votes: 3 },
    ],
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: [
      { id: 1, text: "Mars", votes: 15 },
      { id: 2, text: "Venus", votes: 1 },
      { id: 3, text: "Jupiter", votes: 1 },
      { id: 4, text: "Saturn", votes: 3 },
    ],
  },
];

const ViewPollHistory = () => {
  return <PollHistory data={samplePolls} />;
};
export default ViewPollHistory;
