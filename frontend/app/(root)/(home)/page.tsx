'use client';
import { darkModeState } from '@/recoil/blackandwhite';
import { Bot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRecoilState } from "recoil";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useRecoilState(darkModeState);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className={`min-h-screen ${darkMode ? "bg-gradient-to-br from-slate-900 via-gray-900 to-gray-950 text-white" : "bg-slate-100 text-black"}`}>
      <section className=" pt-10 mx-auto">
        <div className=" overflow-hidden whitespace-nowrap py-3">
          <div className="animate-marquee ">
            <div className="flex gap-10 mr-10">
              {[1,2,3,4,5,6].map((i) => (
                <div
                  key={i}
                  className={`transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] ${
                    darkMode ? "bg-gray-800" : "bg-gray-50"
                  } p-6 rounded-2xl shadow-lg max-w-md`}
                >
                  <p className="text-2xl font-semibold">₹1,30,535.80</p>
                  <p className="text-green-500">(+0.2%)</p>

                  <div className="mt-6">
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Prices
                    </p>
                    <div className="mt-2">
                      <div
                        className={`flex justify-between py-2 ${
                          darkMode ? "border-b border-gray-600" : "border-b border-gray-200"
                        }`}
                      >
                        <span>Bitcoin (BTC)</span>
                        <span className="text-green-500">▲10.46%</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Ethereum (ETH)</span>
                        <span className="text-green-500">▲5.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-10">
              {[7,8,9,10,11,12].map((i) => (
                <div
                  key={i}
                  className={`transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] ${
                    darkMode ? "bg-gray-800" : "bg-gray-50"
                  } p-6 rounded-2xl shadow-lg max-w-md`}
                >
                  <p className="text-2xl font-semibold">₹1,30,535.80</p>
                  <p className="text-green-500">(+0.2%)</p>

                  <div className="mt-6">
                    <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Prices
                    </p>
                    <div className="mt-2">
                      <div
                        className={`flex justify-between py-2 ${
                          darkMode ? "border-b border-gray-600" : "border-b border-gray-200"
                        }`}
                      >
                        <span>Bitcoin (BTC)</span>
                        <span className="text-green-500"> ▲10.46%</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Ethereum (ETH)</span>
                        <span className="text-green-500"> ▲5.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* some dashboard design welcome sugars*/}
        <div className="mx-10 text-center mb-10 mt-10">
          <h1 className="text-4xl font-bold mb-4 animate-pulse bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Welcome to Your Crypto Dashboard
          </h1>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} text-lg`}>
            Track your portfolio, get insights, and trade securely.
          </p>
        </div>

        {/* Chatbot Promo */}
        <div className='w-full flex justify-center '>
          <div
            className={`max-w-7xl w-full  mx-10 ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            } p-8 mt-10 rounded-2xl shadow-lg flex flex-col items-center text-center mb-12 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]`}
          >
            <div className='flex'>
              <h3 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent animate-text-glow">
                Try Our Smart Chatbot 
              </h3>
              <Bot className="w-8 h-8 ml-2 text-blue-500 animate-pulse" />
            </div>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} mb-4`}>
              Ask questions. Get instant insights. Experience the power of AI for crypto.
            </p>
            <button
              onClick={() => (window.location.href = "/chatbot")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:scale-110 transform transition duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.7)]"
            >
              Start Chatting
            </button>
          </div>
        </div>
        {/* Fancy Footer */}
        <footer
          className={` mt-28 border-t ${
            darkMode
              ? "border-gray-700 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
              : "border-gray-300 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"
          } py-16 px-8`}
        >
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center md:text-left">

            {/* Project Overview */}
            <div className="transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] rounded-xl p-6">
              <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                🚀 DeFi AI Assistant
              </h4>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} text-base leading-relaxed`}>
                Enterprise-ready AI assistant for <span className="font-semibold text-purple-400">DeFi</span>.  
                Powered by <span className="font-semibold">FastAPI, LangChain, Coinbase CDP AgentKit</span>,  
                and advanced AI models like <span className="font-semibold">GPT-5 & Mistral-7B</span>.
              </p>
            </div>

            {/* Team Section */}
            <div className="transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] rounded-xl p-6">
              <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                👨‍💻 Our Core Team
              </h4>
              <ul className="space-y-3">
                {[
                  { name: "Aayush Kumar", role: "Backend AI System", color: "from-purple-400 to-pink-500" },
                  { name: "Adesh Dutta ", role: "Frontend & UI & Database System", color: "from-blue-400 to-indigo-500" },
                  { name: "Shubham Priyadarsi", role: "Blockchain Integration", color: "from-green-400 to-emerald-500" }
                ].map((member, idx) => (
                  <li
                    key={idx}
                    className={`p-3 rounded-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.7)]`}
                  >
                    <span
                      className={`font-semibold text-lg bg-gradient-to-r ${member.color} bg-clip-text text-transparent`}
                    >
                      {member.name}
                    </span>
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>
                      {member.role}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technology Highlights */}
            <div className="transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] rounded-xl p-6">
              <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                ⚡ Tech Stack
              </h4>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} text-base leading-relaxed`}>
                <span className="font-medium">AI:</span> GPT-5, Mistral-7B, LangChain  
                <br />
                <span className="font-medium">DeFi:</span> Coinbase CDP AgentKit, x402 Payments  
                <br />
                <span className="font-medium">Infra:</span> FastAPI, Redis, Pinecone, Docker  
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className={`mt-14 text-center text-sm tracking-wide ${
              darkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            © {new Date().getFullYear()} <span className="font-semibold text-purple-400">DeFi Agent Team</span> — Built with ❤️ for Decentralized Finance
          </div>
        </footer>

      </section>
    </main>
  );
}
