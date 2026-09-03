import SimulatorNav from "@/components/simulator-nav"

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-background text-white flex flex-col">
            <SimulatorNav />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="prose prose-invert max-w-none prose-emerald">
                  <h1>MP8085 Simulator - Web Architecture & Dynamics Report</h1>
                  <p>This report outlines the architecture, backend dynamics, and technical decisions powering the MP8085 Simulator web application.</p>
                  
                  <h2>1. System Overview</h2>
                  <p>The application is a full-stack, modern web platform designed to simulate an Intel 8085 microprocessor within the browser while providing cloud-synced features like user profiles, code sharing (Gallery), live collaboration (Classroom), and automated grading (Challenges).</p>
                  <ul>
                    <li><strong>Frontend:</strong> Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui.</li>
                    <li><strong>Backend:</strong> Next.js Serverless API Routes, Node.js.</li>
                    <li><strong>Database:</strong> SQLite managed via Prisma ORM.</li>
                    <li><strong>Services:</strong> NextAuth (Authentication), Upstash Redis (Rate Limiting), Gemini/Pollinations (AI Tutor).</li>
                  </ul>

                  <h2>2. Web Dynamics & State Management</h2>
                  <h3>2.1 The Simulation Engine</h3>
                  <p>The core of the dynamic behavior happens on the client side without relying on the backend for heavy lifting:</p>
                  <ul>
                    <li><strong>Web Workers:</strong> The simulator (<code>emulator-worker.ts</code>) and assembler run in background threads. This ensures that infinite loops (a common issue in assembly programming) do not freeze the React UI thread.</li>
                    <li><strong>State Flow:</strong> The React UI dispatches code to the assembler. The assembled bytecode is passed to the emulator. The emulator yields state snapshots (Registers, Flags, Memory) back to React via <code>postMessage</code>. React efficiently re-renders the UI (LED bars, 7-segment displays, register tables).</li>
                  </ul>

                  <h3>2.2 Split-Pane UI & Real-time Feedback</h3>
                  <p>The UI is highly dynamic, relying on flexbox and responsive states to create an IDE-like experience. It provides instant feedback via compilation error highlighting and step-by-step tracing.</p>

                  <h2>3. Backend Usage & APIs</h2>
                  <p>The backend handles persistence, AI integration, and security.</p>
                  <h3>3.1 Rate Limiting (Distributed vs. In-Memory)</h3>
                  <p>To prevent abuse of endpoints (especially the AI generation), the app implements an <code>ApiRateLimiter</code>.</p>
                  <ul>
                    <li><strong>Production:</strong> Uses Upstash Redis for distributed rate limiting across serverless instances.</li>
                    <li><strong>Development/Fallback:</strong> Falls back gracefully to an in-memory token bucket if Redis is unavailable, ensuring the application does not crash.</li>
                  </ul>

                  <h3>3.2 AI Tutor Service</h3>
                  <p>This service powers the conversational assistant.</p>
                  <ul>
                    <li><strong>Primary:</strong> Gemini 1.5 Pro API.</li>
                    <li><strong>Ultimate Fallback:</strong> If all external services fail, a deterministic fallback message is returned containing standard debugging tips, guaranteeing a 200 OK response rather than a 500 Server Error.</li>
                  </ul>

                  <h2>4. Conclusion</h2>
                  <p>By separating the heavy computational load (emulation) into Web Workers, and utilizing Next.js serverless functions for lightweight persistence and API integrations, the MP8085 Simulator achieves a highly responsive, scalable, and dynamic architecture suitable for educational environments.</p>
                </div>
            </main>
        </div>
    )
}
