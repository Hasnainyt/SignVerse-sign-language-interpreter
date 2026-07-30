import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="text-center px-6 pt-16 pb-6">
        <span className="inline-block bg-[#E3F2E4] text-[#2c7a34] text-sm font-bold px-4 py-1.5 rounded-full mb-6">
          Friendly, accessible ISL translation
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#111111]">
          SignVerse
        </h1>
        <p className="text-lg md:text-xl font-semibold text-[#333] mb-3">
          Bridging communication through sign language.
        </p>
        <p className="max-w-xl mx-auto text-[#666] text-[15px] leading-relaxed">
          Translate Indian Sign Language into text in real time using AI
          while learning ISL through interactive educational resources.
        </p>
      </section>

      <section className="flex flex-wrap justify-center gap-6 px-6 pt-10 pb-20">
        <Link
          to="/interpreter"
          className="w-full sm:w-[340px] bg-white rounded-[28px] border border-[#f0eee8] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8 text-left hover:-translate-y-1 transition-transform"
        >
          <div className="w-[60px] h-[60px] rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-2xl mb-5">
            📷
          </div>
          <h3 className="text-xl font-bold mb-2 text-[#111111]">Open camera</h3>
          <p className="text-[14.5px] text-[#666] leading-relaxed mb-6">
            Launch the real-time interpreter and watch your signs become
            words on screen.
          </p>
          <span className="inline-block px-6 py-3 rounded-full text-sm font-bold text-white bg-[#1E88E5]">
            Open camera
          </span>
        </Link>

        <Link
          to="/learn"
          className="w-full sm:w-[340px] bg-white rounded-[28px] border border-[#f0eee8] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8 text-left hover:-translate-y-1 transition-transform"
        >
          <div className="w-[60px] h-[60px] rounded-full bg-[#E53935] text-white flex items-center justify-center text-2xl mb-5">
            🎓
          </div>
          <h3 className="text-xl font-bold mb-2 text-[#111111]">
            Learn sign language
          </h3>
          <p className="text-[14.5px] text-[#666] leading-relaxed mb-6">
            Explore ISL resources, videos, and a friendly quiz to test your
            progress.
          </p>
          <span className="inline-block px-6 py-3 rounded-full text-sm font-bold text-white bg-[#E53935]">
            Start learning
          </span>
        </Link>
      </section>
    </div>
  );
}
