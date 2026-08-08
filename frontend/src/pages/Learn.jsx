import { useState } from "react";
import { videos } from "../data/videos";
import { quizQuestions } from "../data/quiz";
import { PlayIcon, CloseIcon } from "../components/icons";

// Maps a video's color field to a restrained blue/white-friendly accent
// used behind its thumbnail while the image loads.
const COLOR_MAP = {
  blue: "#2563eb",
  green: "#0f766e",
  red: "#334155",
};

// A single row in the video list: thumbnail + title + "Watch video" link.
// Clicking either the thumbnail or the link opens the modal via onPlay.
function VideoCard({ video, onPlay }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 flex gap-3.5 items-center">
      <button
        onClick={() => onPlay(video)}
        className="w-[92px] h-[64px] rounded-lg flex-shrink-0 relative overflow-hidden group cursor-pointer"
        style={{ backgroundColor: COLOR_MAP[video.color] }}
        aria-label={`Play ${video.topic}`}
      >
        {/* YouTube's public thumbnail endpoint — no API key needed */}
        <img
          src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt=""
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />

        {/* Play icon overlay on top of the thumbnail */}
        <span className="absolute inset-0 flex items-center justify-center text-white bg-black/25">
          <PlayIcon className="w-5 h-5" />
        </span>
      </button>

      <div className="min-w-0">
        <h4 className="text-[14.5px] font-semibold text-[var(--color-text)] mb-0.5">
          {video.topic}
        </h4>

        <p className="text-[12.5px] text-[var(--color-text-secondary)] mb-1.5 leading-snug">
          {video.description}
        </p>

        <button
          onClick={() => onPlay(video)}
          className="text-[12.5px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] cursor-pointer"
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
    <div
      className="fixed inset-0 z-50 bg-[#0f172a]/60 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label={video.topic}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-[var(--shadow-lg)]">
        <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--color-border)]">
          <h4 className="font-semibold text-[15px] text-[var(--color-text)]">
            {video.topic}
          </h4>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            aria-label="Close video"
          >
            <CloseIcon className="w-4 h-4" />
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
  const [answers, setAnswers] = useState(
    Array(quizQuestions.length).fill(null)
  );

  const [submitted, setSubmitted] = useState(false);

  // Records the chosen option for one question
  // (locked once submitted)
  const select = (qIndex, optIndex) => {
    if (submitted) return;

    const next = [...answers];
    next[qIndex] = optIndex;
    setAnswers(next);
  };

  // Counts how many selected answers match the correct answer key
  const score = answers.reduce(
    (total, ans, i) =>
      total + (ans === quizQuestions[i].answer ? 1 : 0),
    0
  );

  const percentage = Math.round(
    (score / quizQuestions.length) * 100
  );

  const allAnswered = answers.every(
    (a) => a !== null
  );

  // Resets the quiz back to its initial state
  const retry = () => {
    setAnswers(
      Array(quizQuestions.length).fill(null)
    );

    setSubmitted(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-6 md:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h3 className="text-[18px] font-semibold text-[var(--color-text)]">
          Basic ISL quiz
        </h3>

        {/* Live progress counter */}
        <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full">
          {answers.filter((a) => a !== null).length} of{" "}
          {quizQuestions.length} answered
        </span>
      </div>

      {/* Results summary, only shown after submitting */}
      {submitted && (
        <div
          className="mb-8 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-xl p-6 text-center"
          role="status"
        >
          <p className="text-3xl font-bold text-[var(--color-text)] mb-1">
            {percentage}%
          </p>

          <p className="text-[14px] text-[var(--color-text-secondary)] mb-4">
            {score} correct ·{" "}
            {quizQuestions.length - score} incorrect
          </p>

          <button
            onClick={retry}
            className="px-6 py-2.5 rounded-lg text-[13.5px] font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer"
          >
            Retry quiz
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {quizQuestions.map((q, qIndex) => (
          <fieldset
            key={qIndex}
            className="border-0 p-0 m-0"
          >
            <legend className="text-[15px] font-semibold text-[var(--color-text)] mb-3">
              {qIndex + 1}. {q.question}
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {q.options.map((opt, optIndex) => {
                const isSelected =
                  answers[qIndex] === optIndex;

                const isCorrect =
                  submitted &&
                  optIndex === q.answer;

                const isWrongSelected =
                  submitted &&
                  isSelected &&
                  optIndex !== q.answer;

                return (
                  <button
                    key={optIndex}
                    onClick={() =>
                      select(qIndex, optIndex)
                    }
                    aria-pressed={isSelected}
                    className={`text-left border rounded-lg px-4 py-3 text-[14px] transition-colors cursor-pointer ${
                      isCorrect
                        ? "border-[var(--color-success)] bg-[var(--color-success-light)] text-[var(--color-success)] font-semibold"
                        : isWrongSelected
                        ? "border-[var(--color-error)] bg-[var(--color-error-light)] text-[var(--color-error)] font-semibold"
                        : isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-text)]"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Submit button hidden after submitting */}
      {!submitted && (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
          className="mt-8 bg-[var(--color-primary)] text-white px-7 py-3 rounded-lg text-[14.5px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer"
        >
          Submit quiz
        </button>
      )}
    </div>
  );
}

export default function Learn() {
  // Tracks which video (if any) the modal should currently show
  const [activeVideo, setActiveVideo] =
    useState(null);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="px-6 md:px-14 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-1">
          Learn sign language
        </h1>

        <p className="text-[var(--color-text-secondary)] text-[14.5px]">
          Explore the ISL alphabet, watch guided lessons,
          and test yourself with a quiz.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 px-6 md:px-14 py-7 items-start">
        {/* Left: static alphabet chart image */}
        <div className="flex-[1.4] min-w-[320px] bg-white rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-6">
          <h3 className="font-semibold text-[16px] text-[var(--color-text)] mb-4">
            ISL alphabet chart
          </h3>

          <img
            src="/isl.jpeg"
            alt="Indian Sign Language fingerspelling alphabet chart"
            className="w-full rounded-xl border border-[var(--color-border)] mb-4"
          />

          <div className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-8 text-center">
            <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
              ISL alphabet chart coming soon —
              Indian Sign Language fingerspelling uses
              both hands, so this needs its own chart
              rather than an ASL one.
            </p>
          </div>
        </div>

        {/* Right: list of video cards */}
        <div className="flex-1 min-w-[300px] flex flex-col gap-3.5">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={setActiveVideo}
            />
          ))}
        </div>
      </div>

      <div className="px-6 md:px-14 pb-16">
        <Quiz />
      </div>

      {/* Modal only renders content when activeVideo is set */}
      <VideoModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
}