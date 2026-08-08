export default function Footer() {
  return (
    <footer className="border-t border-[#dbe7f5] bg-white">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center justify-between gap-3 px-6 py-6 text-center sm:flex-row sm:text-left md:px-8">

        {/* Brand */}
        <div>
          <p className="text-sm font-semibold text-[#172033]">
            SignVerse
          </p>

          <p className="mt-1 text-xs text-[#64748b]">
            Bridging communication through Indian Sign Language.
          </p>
        </div>

        {/* Copyright */}
        <p className="text-xs text-[#94a3b8]">
          © {new Date().getFullYear()} SignVerse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}