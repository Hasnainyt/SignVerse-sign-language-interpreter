import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Interpreter from "./pages/Interpreter";
import Learn from "./pages/Learn";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#eff6ff] text-[#172033]">
        {/* Global navigation */}
        <Navbar />

        {/* Main application content */}
        <main className="min-h-[calc(100vh-76px)]">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/interpreter"
              element={<Interpreter />}
            />

            <Route
              path="/learn"
              element={<Learn />}
            />
          </Routes>
        </main>

        {/* Global footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;