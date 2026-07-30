import { NavLink } from "react-router-dom";

const linkBase =
  "px-4 py-2 rounded-full text-sm font-semibold border transition-colors";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-14 py-6">
      <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-[#111111]">
        <span className="w-8 h-8 rounded-[10px] bg-[#43A047] text-white flex items-center justify-center text-sm">
          <img src="/signVerselogo.jpeg" alt="img" />
        </span>
        SignVerse
      </NavLink>
      <div className="flex items-center gap-2">
        <NavLink
          to="/interpreter"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? "bg-[#1E88E5] text-white border-[#1E88E5]"
                : "bg-white text-[#333] border-[#eeeeee] hover:border-[#1E88E5]"
            }`
          }
        >
          Interpreter
        </NavLink>
        <NavLink
          to="/learn"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? "bg-[#E53935] text-white border-[#E53935]"
                : "bg-white text-[#333] border-[#eeeeee] hover:border-[#E53935]"
            }`
          }
        >
          Learn
        </NavLink>
      </div>
    </nav>
  );
}
