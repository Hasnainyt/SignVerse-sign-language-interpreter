export default function Footer() {
  return (
    <footer className="border-t border-[#f0eee8] mt-10">
      <div className="px-6 md:px-14 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#777]">
        <div>
          <p className="font-bold text-[#111111] text-base mb-1">SignVerse</p>
          <p>Breaking communication barriers.</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#111111]">GitHub</a>
          <a href="#" className="hover:text-[#111111]">Contact</a>
          <a href="#" className="hover:text-[#111111]">Privacy policy</a>
        </div>
        <p>Copyright © 2026 SignVerse</p>
      </div>
    </footer>
  );
}
