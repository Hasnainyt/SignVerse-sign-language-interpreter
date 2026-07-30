import { useState } from "react";
import { videos } from "../data/videos";
import { quizQuestions } from "../data/quiz";

// Maps a video's `color` field to its actual hex value for the thumbnail background
const COLOR_MAP = {
  blue: "#1E88E5",
  green: "#43A047",
  red: "#E53935",
};

// A single row in the video list: thumbnail + title + "Watch video" link.
// Clicking either the thumbnail or the link opens the modal via onPlay.
function VideoCard({ video, onPlay }) {
  return (
    <div className="bg-white rounded-[20px] border border-[#f0eee8] shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-4 flex gap-3.5 items-center">
      <button
        onClick={() => onPlay(video)}
        className="w-[92px] h-[64px] rounded-[12px] flex-shrink-0 relative overflow-hidden group"
        style={{ backgroundColor: COLOR_MAP[video.color] }}
        aria-label={`Play ${video.topic}`}
      >
        {/* YouTube's public thumbnail endpoint — no API key needed */}
        <img
          src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.topic}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
        />
        {/* Play icon overlay on top of the thumbnail */}
        <span className="absolute inset-0 flex items-center justify-center text-white text-lg bg-black/20">
          ▶
        </span>
      </button>
      <div className="min-w-0">
        <h4 className="text-[14.5px] font-bold text-[#111111] mb-0.5">
          {video.topic}
        </h4>
        <p className="text-[12.5px] text-[#888] mb-1.5 leading-snug">
          {video.description}
        </p>
        <button
          onClick={() => onPlay(video)}
          className="text-[12.5px] font-bold text-[#111111]"
        >
          Watch video →
        </button>
      </div>
    </div>
  );
}

// Full-screen overlay that embeds the YouTube player for whichever video
// is currently "active". Renders nothing if no video is selected.
function VideoModal({ video, onClose }) {
  if (!video) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="bg-white rounded-[24px] w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#f0eee8]">
          <h4 className="font-bold text-[15px] text-[#111111]">{video.topic}</h4>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5f3ee] text-[#555] font-bold"
            aria-label="Close video"
          >
            ✕
          </button>
        </div>
        {/* Embedded YouTube player, autoplays once the modal opens */}
        <div className="aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.topic}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

// Self-contained quiz: tracks the user's selected answer per question,
// scores it on submit, and lets them retry.
function Quiz() {
  const [answers, setAnswers] = useState(Array(quizQuestions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  // Records the chosen option for one question (locked once submitted)
  const select = (qIndex, optIndex) => {
    if (submitted) return;
    const next = [...answers];
    next[qIndex] = optIndex;
    setAnswers(next);
  };

  // Counts how many selected answers match the correct answer key
  const score = answers.reduce(
    (total, ans, i) => total + (ans === quizQuestions[i].answer ? 1 : 0),
    0
  );
  const percentage = Math.round((score / quizQuestions.length) * 100);
  const allAnswered = answers.every((a) => a !== null);

  // Resets the quiz back to its initial state
  const retry = () => {
    setAnswers(Array(quizQuestions.length).fill(null));
    setSubmitted(false);
  };

  return (
    <div className="bg-white rounded-[28px] border border-[#f0eee8] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[19px] font-bold text-[#111111]">Basic ISL quiz</h3>
        {/* Live progress counter, e.g. "3 of 5 answered" */}
        <span className="bg-[#E3F2E4] text-[#2c7a34] text-[12.5px] font-bold px-3.5 py-1.5 rounded-full">
          {answers.filter((a) => a !== null).length} of {quizQuestions.length} answered
        </span>
      </div>

      {/* Results summary, only shown after submitting */}
      {submitted && (
        <div className="mb-8 bg-[#fbf9f5] border border-[#f0eee8] rounded-[20px] p-6 text-center">
          <p className="text-3xl font-bold text-[#111111] mb-1">{percentage}%</p>
          <p className="text-[14px] text-[#666] mb-4">
            {score} correct · {quizQuestions.length - score} incorrect
          </p>
          <button
            onClick={retry}
            className="px-6 py-2.5 rounded-full text-[13.5px] font-bold text-white bg-[#E53935]"
          >
            Retry quiz
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {quizQuestions.map((q, qIndex) => (
          <div key={qIndex}>
            <p className="text-[15px] font-semibold text-[#111111] mb-3">
              {qIndex + 1}. {q.question}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {q.options.map((opt, optIndex) => {
                const isSelected = answers[qIndex] === optIndex;
                // These two only apply once submitted, to color-code right/wrong
                const isCorrect = submitted && optIndex === q.answer;
                const isWrongSelected =
                  submitted && isSelected && optIndex !== q.answer;
                return (
                  <button
                    key={optIndex}
                    onClick={() => select(qIndex, optIndex)}
                    className={`text-left border-[1.5px] rounded-[12px] px-4 py-3 text-[14px] transition-colors ${
                      isCorrect
                        ? "border-[#43A047] bg-[#f2f8ef] text-[#2c7a34] font-bold"
                        : isWrongSelected
                        ? "border-[#E53935] bg-[#fdecea] text-[#c62828] font-bold"
                        : isSelected
                        ? "border-[#1E88E5] bg-[#eaf3fc] text-[#111111]"
                        : "border-[#f0eee8] text-[#444]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit button hidden after submitting; disabled until every question has an answer */}
      {!submitted && (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
          className="mt-8 bg-[#E53935] text-white border-none px-8 py-3.5 rounded-full text-[14.5px] font-bold disabled:opacity-40"
        >
          Submit quiz
        </button>
      )}
    </div>
  );
}

export default function Learn() {
  // Tracks which video (if any) the modal should currently show
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <div>
      <div className="px-6 md:px-14 pt-2">
        <h1 className="text-3xl font-bold text-[#111111] mb-1">
          Learn sign language
        </h1>
        <p className="text-[#777] text-[14.5px]">
          Explore the ISL alphabet, watch guided lessons, and test yourself
          with a quiz.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 px-6 md:px-14 py-7 items-start">
        {/* Left: static alphabet chart image, served from /public so this
            just needs "chart.webp" placed there directly */}
        <div className="flex-[1.4] min-w-[340px] bg-white rounded-[28px] border border-[#f0eee8] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-7">
          <h3 className="font-bold text-[17px] text-[#111111] mb-4">
            ISL alphabet chart
          </h3>
          <img src="/isl.jpeg" alt="isl chart" />
          <div className="w-full rounded-[20px] border border-[#f0eee8] bg-[#fbf9f5] p-10 text-center">
            <p className="text-[14px] text-[#999] leading-relaxed">
              ISL alphabet chart coming soon — Indian Sign Language
              fingerspelling uses both hands, so this needs its own chart
              rather than an ASL one.
            </p>
          </div>
        </div>

        {/* Right: list of video cards, one per lesson topic */}
        <div className="flex-1 min-w-[320px] flex flex-col gap-3.5">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={setActiveVideo} />
          ))}
        </div>
      </div>

      <div className="px-6 md:px-14 pb-16">
        <Quiz />
      </div>

      {/* Modal only renders content when activeVideo is set */}
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}