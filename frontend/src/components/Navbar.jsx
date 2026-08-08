import { NavLink } from "react-router-dom";

const navLinkBase =
  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#dbe7f5] bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-[1180px] items-center justify-between px-6 md:px-8">

        {/* Logo / Brand */}
        <NavLink
          to="/"
          className="group flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#dbe7f5] bg-white shadow-sm">
            <img
              src="/signVerselogo.jpeg"
              alt="SignVerse logo"
              className="h-full w-full object-cover"
            />
          </span>

          <span className="text-xl font-bold tracking-[-0.02em] text-[#172033]">
            SignVerse
          </span>
        </NavLink>

        {/* Navigation */}
        <div className="flex items-center gap-1 rounded-xl border border-[#dbe7f5] bg-[#f8fbff] p-1">
          <NavLink
            to="/interpreter"
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? "bg-[#2563eb] text-white shadow-sm"
                  : "text-[#526174] hover:bg-[#eaf2ff] hover:text-[#1d4ed8]"
              }`
            }
          >
            Interpreter
          </NavLink>

          <NavLink
            to="/learn"
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? "bg-[#2563eb] text-white shadow-sm"
                  : "text-[#526174] hover:bg-[#eaf2ff] hover:text-[#1d4ed8]"
              }`
            }
          >
            Learn
          </NavLink>
        </div>
      </nav>
    </header>
  );
}