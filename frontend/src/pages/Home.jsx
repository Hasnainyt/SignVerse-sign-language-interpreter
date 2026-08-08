import { Link } from "react-router-dom";

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h2l1.2-1.5h4.6L15.5 5h2A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
      />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v16H7.5A2.5 2.5 0 0 0 5 20.5v-16Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 20.5A2.5 2.5 0 0 1 7.5 18H20"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10h11M11 5l5 5-5 5"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#eff6ff]">

      {/* Hero */}
      <section className="px-6 pb-14 pt-14 md:px-8 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-[900px] text-center">

          {/* Small introduction badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe0f5] bg-white px-4 py-2 text-sm font-medium text-[#2563eb] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
            Indian Sign Language · Accessibility
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold leading-[1.1] tracking-[-0.035em] text-[#172033] sm:text-5xl md:text-6xl">
            Communication should be
            <span className="block text-[#2563eb]">
              accessible to everyone.
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-[680px] text-base leading-7 text-[#64748b] sm:text-lg">
            SignVerse helps bridge communication through Indian Sign Language
            with real-time interpretation and an interactive learning
            experience.
          </p>

          {/* Main actions */}
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              to="/interpreter"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1d4ed8] hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            >
              Open Interpreter
              <ArrowIcon />
            </Link>

            <Link
              to="/learn"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cbdced] bg-white px-6 py-3.5 text-sm font-semibold text-[#1d4ed8] shadow-sm transition-all duration-200 hover:border-[#b8cde6] hover:bg-[#f8fbff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto grid max-w-[980px] gap-5 md:grid-cols-2">

          {/* Interpreter card */}
          <Link
            to="/interpreter"
            className="group rounded-2xl border border-[#d7e5f4] bg-white p-7 shadow-[0_10px_28px_rgba(30,64,175,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[#bfd5ee] hover:shadow-[0_16px_34px_rgba(30,64,175,0.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#2563eb]">
              <CameraIcon />
            </div>

            <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-[#172033]">
              Sign Language Interpreter
            </h2>

            <p className="mt-3 max-w-[440px] text-sm leading-6 text-[#64748b]">
              Use your camera to interpret supported Indian Sign Language
              gestures and turn them into understandable text.
            </p>

            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb]">
              Open interpreter
              <ArrowIcon />
            </span>
          </Link>

          {/* Learning card */}
          <Link
            to="/learn"
            className="group rounded-2xl border border-[#d7e5f4] bg-white p-7 shadow-[0_10px_28px_rgba(30,64,175,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[#bfd5ee] hover:shadow-[0_16px_34px_rgba(30,64,175,0.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#2563eb]">
              <BookIcon />
            </div>

            <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-[#172033]">
              Learn Indian Sign Language
            </h2>

            <p className="mt-3 max-w-[440px] text-sm leading-6 text-[#64748b]">
              Explore signs, practice your knowledge, and build confidence
              through an interactive learning experience.
            </p>

            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb]">
              Explore lessons
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </section>

      {/* Simple information section */}
      <section className="border-t border-[#dbe7f5] bg-white px-6 py-12 md:px-8">
        <div className="mx-auto flex max-w-[980px] flex-col gap-8 md:flex-row md:items-center md:justify-between">

          <div className="max-w-[600px]">
            <p className="text-sm font-semibold text-[#2563eb]">
              Built around accessibility
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#172033]">
              Simple tools for better communication.
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#64748b]">
              SignVerse combines interpretation and learning in one focused
              interface, keeping the experience simple and easy to navigate.
            </p>
          </div>

          <Link
            to="/interpreter"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#cbdced] bg-[#f8fbff] px-5 py-3 text-sm font-semibold text-[#1d4ed8] transition-colors hover:bg-[#eaf2ff]"
          >
            Try SignVerse
          </Link>
        </div>
      </section>
    </div>
  );
}