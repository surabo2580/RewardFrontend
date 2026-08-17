import React, { useState } from 'react';
import { 
  GitBranch, 
  Layers, 
  Server, 
  Layout, 
  Terminal, 
  Check, 
  Copy, 
  ExternalLink, 
  ArrowRight,
  FolderGit2,
  Cpu,
  Globe,
  Database
} from 'lucide-react';

export const RepoArchitectureGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const backendRepoStructure = `# REPOSITORY 1: RewardBackend (Spring Boot & Kotlin)
RewardBackend/
├── .gitignore
├── build.gradle.kts          # Kotlin DSL dependencies & Spring Boot 3.3 plugins
├── settings.gradle.kts       # rootProject.name = "backend"
├── Dockerfile                # Multi-stage JDK 17 Docker build
├── README.md
└── src/
    ├── main/
    │   ├── kotlin/com/smartReward/backend/
    │   │   ├── BackendApplication.kt      # Spring Boot main entry
    │   │   ├── api/
    │   │   │   ├── EventController.kt     # POST /events
    │   │   │   ├── WalletController.kt    # GET /wallet/{bId}/{uId}, /redeem, /confirm
    │   │   │   ├── RewardRuleController.kt# GET/POST/PATCH/DELETE /rules
    │   │   │   └── BusinessController.kt  # /businesses, /users, /transactions
    │   │   ├── model/                     # JPA Entities (Business, Wallet, Rule, User, Transaction)
    │   │   ├── repository/                # Spring Data JPA interfaces
    │   │   ├── ruleengine/                # Pure RuleEngine.kt evaluation logic
    │   │   ├── service/                   # EventService, WalletService, etc.
    │   │   ├── dto/                       # Request/Response data classes
    │   │   └── exception/                 # GlobalExceptionHandler.kt
    │   └── resources/
    │       └── application.yml            # JPA, H2 console, and logging config
    └── test/kotlin/com/smartReward/backend/
        ├── BackendApplicationTests.kt
        └── RuleEngineTest.kt`;

  const frontendRepoStructure = `# REPOSITORY 2: RewardFrontend (React & TypeScript)
RewardFrontend/
├── .env.example              # VITE_API_BASE_URL=http://localhost:8080
├── package.json              # React 18, Vite, Tailwind, Lucide
├── vite.config.ts
├── tailwind.config.js
├── index.html
├── src/
│   ├── api/
│   │   └── client.ts         # SpringBootApiClient (typed fetch client)
│   ├── components/           # Dashboard, RuleManager, WalletView, etc.
│   ├── context/              # State & Live API synchronizer
│   ├── types.ts              # TypeScript models matching Kotlin entities
│   ├── App.tsx
│   └── main.tsx
└── README.md`;

  const backendCommands = `# 1. Clone your backend repo
git clone https://github.com/your-username/RewardBackend.git
cd RewardBackend

# 2. Run the Spring Boot application (port 8080)
./gradlew bootRun

# 3. (Optional) Run tests
./gradlew test`;

  const frontendCommands = `# 1. Clone your frontend repo
git clone https://github.com/your-username/RewardFrontend.git
cd RewardFrontend

# 2. Install dependencies
npm install

# 3. Create .env pointing to your Spring Boot server
echo "VITE_API_BASE_URL=http://localhost:8080" > .env

# 4. Start the Vite development dashboard (port 3000)
npm run dev`;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <GitBranch className="w-3.5 h-3.5" />
            2-Repository Clean Architecture Guide
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Separating Backend (Spring Boot) & Frontend (React)
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Having two independent Git repositories keeps your project modular, makes CI/CD effortless, and allows the Kotlin backend to serve both this web dashboard and any future Android/iOS mobile clients cleanly.
          </p>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Repo 1: RewardBackend</h3>
                  <p className="text-xs text-slate-400">Spring Boot 3.3 & Kotlin 1.9 / 2.0</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Port 8080
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Pure JVM microservice handling multi-tenant reward rules, wallet ledger, event ingestion, and JPA persistence.
            </p>

            <div className="space-y-2 text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-500 font-semibold mb-1">Key Endpoints:</div>
              <div><span className="text-emerald-400">POST</span> /events</div>
              <div><span className="text-sky-400">GET</span>  /wallet/{'{businessId}'}/{'{userId}'}</div>
              <div><span className="text-emerald-400">POST</span> /wallet/redeem</div>
              <div><span className="text-sky-400">GET</span>  /rules?businessId=taj</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Export folder: <code className="text-indigo-300 font-mono bg-indigo-950/60 px-1 py-0.5 rounded">/backend</code></span>
            <button
              onClick={() => copyToClipboard(backendCommands, 'backend-cmds')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {copiedSection === 'backend-cmds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Setup Commands</span>
            </button>
          </div>
        </div>

        {/* Frontend Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Repo 2: RewardFrontend</h3>
                  <p className="text-xs text-slate-400">React 18, Vite & Tailwind CSS</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Port 3000
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Web admin dashboard, event simulator, and rule visualizer configured with a typed HTTP client calling your Spring Boot API.
            </p>

            <div className="space-y-2 text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-500 font-semibold mb-1">Configured Client:</div>
              <div><span className="text-indigo-400">src/api/client.ts</span> (Typed API Client)</div>
              <div><span className="text-amber-400">.env</span> (VITE_API_BASE_URL=http://localhost:8080)</div>
              <div><span className="text-purple-400">src/components/*</span> (Interactive views)</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Deployable to: <strong className="text-slate-200">Vercel / Netlify / Cloud Run</strong></span>
            <button
              onClick={() => copyToClipboard(frontendCommands, 'frontend-cmds')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {copiedSection === 'frontend-cmds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Setup Commands</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step by Step Setup Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          Step-by-Step Repository Separation Guide
        </h3>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">Create the Spring Boot Repository (`RewardBackend`)</h4>
              <p className="text-xs text-slate-400 mt-1">
                Create a new repository on GitHub named <code className="text-indigo-300 font-mono">RewardBackend</code>. Copy everything inside the <code className="text-indigo-300 font-mono">/backend</code> folder to the root of your new repo.
              </p>
              <div className="mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>cd backend && ./gradlew bootRun</span>
                <button
                  onClick={() => copyToClipboard('cd backend && ./gradlew bootRun', 'step1')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedSection === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">Create the Frontend Repository (`RewardFrontend`)</h4>
              <p className="text-xs text-slate-400 mt-1">
                Create a second GitHub repo named <code className="text-emerald-300 font-mono">RewardFrontend</code> with the root frontend files (<code className="font-mono">package.json</code>, <code className="font-mono">src/</code>, <code className="font-mono">vite.config.ts</code>).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">Connect the Frontend to your Backend via Environment Variable</h4>
              <p className="text-xs text-slate-400 mt-1">
                In your frontend repository, set <code className="text-amber-300 font-mono">.env</code>:
              </p>
              <div className="mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                <span className="text-slate-500"># Local development</span>
                <div>VITE_API_BASE_URL=http://localhost:8080</div>
                <span className="text-slate-500 mt-2 block"># Or production deployment</span>
                <div>VITE_API_BASE_URL=https://api.yourdomain.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Trees Collapsible/Inspectable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Tree */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-indigo-300 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4" />
              RewardBackend Directory Tree
            </span>
            <button
              onClick={() => copyToClipboard(backendRepoStructure, 'tree-be')}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              {copiedSection === 'tree-be' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-80 bg-slate-950">
            <code>{backendRepoStructure}</code>
          </pre>
        </div>

        {/* Frontend Tree */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-emerald-300 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4" />
              RewardFrontend Directory Tree
            </span>
            <button
              onClick={() => copyToClipboard(frontendRepoStructure, 'tree-fe')}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              {copiedSection === 'tree-fe' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-80 bg-slate-950">
            <code>{frontendRepoStructure}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
