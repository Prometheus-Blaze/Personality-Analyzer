"use client";

import { useState } from "react";

type AnalysisResult = {
  tone: string;
  traits: string[];
  verdict: string;
};

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyzeText() {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
    } catch {
      setError("The analyzer faltered. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">

      {/* === BACKGROUND === */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-blob blob-purple" />
        <div className="bg-blob blob-blue" />
        <div className="bg-blob blob-emerald" />
        <div className="bg-noise" />
        <div className="bg-vignette" />
      </div>

      {/* === HERO / APP SECTION === */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-3xl space-y-12 text-center">

          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
              Internet Personality Analyzer
            </h1>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Paste something you’ve written.  
              It will be judged with unsettling confidence.
            </p>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-neutral-600 to-transparent" />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl p-6 space-y-4">
            <textarea
              className="w-full h-52 resize-none rounded-xl bg-neutral-950/70 p-4 border border-neutral-800 focus:ring-2 focus:ring-emerald-400/30 outline-none"
              placeholder="Tweets. Bios. Rants. Manifestos."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex justify-end">
              <button
                onClick={analyzeText}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-semibold bg-emerald-400 text-black hover:bg-emerald-300 active:scale-95 transition"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>

          {error && (
            <div className="border border-red-900 bg-red-950/50 p-4 text-red-300 rounded-xl">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl p-8 space-y-6 animate-resultIn text-left">
              <div>
                <p className="text-sm text-neutral-400 uppercase">Tone</p>
                <p className="text-2xl font-semibold">{result.tone}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-400 uppercase">Traits</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.traits.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full bg-neutral-800 text-sm">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-400 uppercase">Verdict</p>
                <p className="mt-2 verdict-glow">{result.verdict}</p>
              </div>
            </div>
          )}

          <div className="pt-10 animate-bounce text-neutral-400 text-sm">
            ↓ Scroll for creator details
          </div>
        </div>
      </section>

      {/* === ABOUT / ADMIN SECTION === */}
      <section className="border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-xl py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-[auto_1fr] gap-10 items-start">

          {/* Indian Flag — KEPT */}
          <img
            src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
            alt="Indian Flag"
            className="w-24 h-auto rounded shadow-lg"
          />

          <div className="space-y-6">
            <h2 className="text-3xl font-semibold">
              <span className="text-white">Made by </span>
              <span className="text-orange-400">Aditya Tomar</span>
            </h2>

            <p className="text-neutral-400 max-w-2xl">
              I'm a Computer Science student building tools you didn't know you needed.
            </p>

            <div className="flex flex-wrap gap-6 text-sky-400 underline">

              <a
                href="https://www.linkedin.com/in/aditya-tomar-2909-spa"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>

              <a
                href="https://www.instagram.com/adi.tya_t0mar?igsh=MXdqdHBhcm5maHpjeA=="
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>

              <span>Email: aditya7tomar.2909@gmail.com</span>
              <span>Phone: +91 77019 53578</span>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes resultIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-resultIn {
          animation: resultIn 0.6s ease-out forwards;
        }
        .verdict-glow {
          text-shadow: 0 0 25px rgba(16,185,129,0.25);
        }
      `}</style>
    </main>
  );
}
