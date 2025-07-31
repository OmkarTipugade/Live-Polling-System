import BadgeStar from "./BadgeStar";
import spinner from "../assets/spinner.png";
const PreQuestion = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white space-y-5">
      <BadgeStar />
      <img src={spinner} className="animate-spin h-10 w-10" />
      <p className="text-black font-semibold text-[33px] text-center">
        Wait for the teacher to ask questions...
      </p>
    </div>
  );
};

export default PreQuestion;
