import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Interpreter from "./pages/Interpreter";
import Learn from "./pages/Learn";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fbf8f3] text-[#111111]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interpreter" element={<Interpreter />} />
          <Route path="/learn" element={<Learn />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
