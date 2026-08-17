# SmartReward Frontend - Project Architecture & Tech Stack Documentation

## 📋 Project Overview
**Project Name:** RewardFrontend (SmartReward Rule Engine Frontend)  
**Version:** 1.0.0  
**Type:** Multi-tenant Loyalty & Rewards Infrastructure  
**Description:** A React-based frontend for managing reward rules, wallet operations, and event processing for a smart reward engine system.

---

## 🏗️ Architecture Overview

### High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                    React Frontend (TypeScript)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              UI Components (TSX)                         │   │
│  │  • EventDispatcher, RuleManager, WalletView, etc.      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           △                                       │
│                           │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Context API (State Management)                 │   │
│  │          RewardContext.tsx                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           △                                       │
│                           │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      Business Logic & Rule Engine                       │   │
│  │  • RuleEngine.ts (evaluate rewards)                    │   │
│  │  • SpringBootApiClient (API integration)              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           △                                       │
│                           │ HTTP (REST)                          │
└─────────────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼──────┐      ┌──────▼──────┐
         │ Spring Boot │      │   Kotlin    │
         │  Backend    │      │   Backend   │
         │ (Port 8080) │      │  Services   │
         └─────────────┘      └─────────────┘
```

---

## 🛠️ Technology Stack

### Frontend Framework & Build Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^18.3.1 | Core UI library for building components |
| **TypeScript** | ^5.6.3 | Type-safe JavaScript superset |
| **Vite** | ^5.4.10 | Next-gen frontend build tool (fast bundler & dev server) |
| **@vitejs/plugin-react** | ^4.3.3 | Vite plugin for React with Fast Refresh support |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | ^4.1.11 | Utility-first CSS framework for styling |
| **@tailwindcss/vite** | ^4.1.11 | Vite plugin for Tailwind CSS integration |
| **Lucide React** | ^0.525.0 | Lightweight icon library (SVG icons) |

### Animation & Interactions
| Technology | Version | Purpose |
|------------|---------|---------|
| **Motion** | ^12.0.0 | Modern animation library (React animation framework) |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| **@types/react** | ^18.3.12 | TypeScript type definitions for React |
| **@types/react-dom** | ^18.3.1 | TypeScript type definitions for React DOM |

---

## 📁 Project Structure

```
RewardFrontend/
├── index.html                 # HTML entry point
├── package.json              # Project dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── tsconfig.node.json        # TypeScript config for Vite
├── vite.config.ts            # Vite build configuration
├── .env                       # Environment variables (local)
│
├── src/
│   ├── main.tsx              # React app initialization
│   ├── App.tsx               # Root component with tab routing
│   ├── index.css             # Global styles & Tailwind imports
│   ├── types.ts              # TypeScript interfaces & types
│   │
│   ├── api/
│   │   └── client.ts         # Spring Boot REST API client class
│   │
│   ├── engine/
│   │   └── RuleEngine.ts     # Rule evaluation engine (ported from backend)
│   │
│   ├── context/
│   │   └── RewardContext.tsx # Global state management using Context API
│   │
│   └── components/           # React components
│       ├── Navbar.tsx              # Navigation/tab switcher
│       ├── EventDispatcher.tsx    # Event processing UI
│       ├── RuleManager.tsx        # Reward rule CRUD
│       ├── WalletView.tsx         # Wallet display
│       ├── TransactionLedger.tsx  # Transaction history
│       ├── ApiSandbox.tsx         # API testing interface
│       ├── BusinessUserManager.tsx # Entity management
│       ├── KotlinSourceViewer.tsx  # Kotlin code viewer
│       └── RepoArchitectureGuide.tsx # Documentation viewer
│
├── dist/                     # Build output (generated by Vite)
└── node_modules/             # Dependencies
```

---

## 📝 Core Components & Modules

### 1. **Type Definitions** (`src/types.ts`)
Central TypeScript interfaces for type safety:

```typescript
// Domain Models
- User: User identification with metadata
- Business: Business/merchant information
- RewardRule: Rule configuration for reward calculation
- Wallet: Point balance tracking per user-business pair
- Transaction: Event processing record

// API Models
- EventRequest: Event trigger from user
- WalletResponse: Wallet state response
- EvaluationResult: Rule evaluation outcome

// Enums
- RewardType: 'FLAT' | 'PERCENTAGE'
- TransactionStatus: 'PENDING' | 'CONFIRMED' | 'REDEEMED' | 'EXPIRED'
```

### 2. **State Management** (`src/context/RewardContext.tsx`)
Global state using React Context API:
- User & business selection
- Rules, wallets, and transactions
- Core business operations (processEvent, confirmPoints, redeemPoints)
- CRUD operations for rules
- Local storage persistence (v1 schema)

**Key Features:**
- Ported from Spring Boot backend logic
- In-memory state with localStorage sync
- Multi-tenant support (business & user selection)
- Seed data included for demo

### 3. **Rule Engine** (`src/engine/RuleEngine.ts`)
Pure rule evaluation logic:
```typescript
RuleEngine.evaluate(event, allRules): EvaluationResult
```
**Functionality:**
- Filters rules by eventType, businessId, and active status
- Evaluates transaction amount against minAmount threshold
- Calculates points: FLAT or PERCENTAGE-based
- Returns matched rules with explanations

### 4. **API Client** (`src/api/client.ts`)
Spring Boot backend integration:
- Base URL: `http://localhost:8080` (or `VITE_API_BASE_URL`)
- Handles REST requests to backend services
- Interfaces for:
  - Event processing
  - Wallet operations (fetch, redeem, confirm)
  - Rule management
  - Transaction history

### 5. **UI Components** (`src/components/`)

| Component | Purpose |
|-----------|---------|
| **Navbar** | Tab-based navigation between features |
| **EventDispatcher** | Process events and award points |
| **RuleManager** | Create, update, delete reward rules |
| **WalletView** | Display user wallet balances |
| **TransactionLedger** | View transaction history |
| **ApiSandbox** | Test backend API endpoints |
| **BusinessUserManager** | Manage businesses and users |
| **KotlinSourceViewer** | View Kotlin backend code |
| **RepoArchitectureGuide** | Display repository documentation |

### 6. **Root Component** (`src/App.tsx`)
- Wraps app with RewardProvider (Context)
- Tab-based routing between components
- Uses Motion for page transitions with AnimatePresence
- Dark theme (Tailwind slate-950)
- Responsive grid layout

---

## 🎨 Design System & Styling

### Color Scheme (Dark Theme)
- **Background:** `slate-950` (#0b0f19)
- **Text:** `slate-100` (#f1f5f9)
- **Accent:** `emerald-500` (green status indicators)
- **Borders:** `slate-900`

### UI Framework
- **Tailwind CSS:** Utility-first CSS with responsive design
- **Icons:** Lucide React (`Sparkles`, `Layers`, `ShieldCheck`, etc.)
- **Animations:** Motion/Framer Motion for smooth transitions
- **Layout:** Responsive grid (mobile-first approach)

### Global Styles (`src/index.css`)
- Custom scrollbar styling
- System font stack
- Tailwind base layer configuration

---

## 🚀 Build & Development Setup

### Package Scripts
```bash
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Production build to dist/
npm run preview    # Preview production build on http://localhost:4173
```

### Development Server Configuration
- Host: `0.0.0.0` (accessible from network)
- Port: `3000`
- Fast Refresh enabled for React
- Hot Module Replacement (HMR) for instant updates

### Production Build
- Vite bundling with tree-shaking
- TypeScript compilation (no emitting, just type-checking)
- CSS minification and Tailwind purging
- Output to `dist/` folder

---

## 🔧 TypeScript Configuration

### Compiler Options (`tsconfig.json`)
```typescript
- Target: ES2020 (modern JavaScript)
- Module: ESNext with bundler resolution
- JSX: react-jsx (new transform)
- Strict Mode: true
  - noUnusedLocals: true
  - noUnusedParameters: true
  - noFallthroughCasesInSwitch: true
- Library: ES2020 + DOM APIs
- Isolation: moduleDetection = "force"
```

---

## 🔌 Environment Configuration

### Environment Variables
- **VITE_API_BASE_URL:** Backend API URL (default: `http://localhost:8080`)
  - Set in `.env` file
  - Override via `SpringBootApiClient.setBaseUrl()`

### Build-Time Variables
- Vite exposes env vars via `import.meta.env`

---

## 📦 Key Dependencies Analysis

### Production Dependencies (3 packages)
1. **react & react-dom:** UI rendering
2. **lucide-react:** Icon system
3. **motion:** Animation framework

### Development Dependencies (7 packages)
1. **Vite & plugins:** Build tooling
2. **TypeScript:** Type checking
3. **Tailwind & plugin:** Styling
4. **@types packages:** Type definitions

**Total Bundle Size Impact:** Minimal (optimized for performance)

---

## 🔄 Data Flow

### Event Processing Flow
```
User Input (EventDispatcher)
    ↓
EventRequest object
    ↓
RewardContext.processEvent()
    ↓
RuleEngine.evaluate()
    ↓
Filter & match rules
    ↓
Calculate points (FLAT/PERCENTAGE)
    ↓
Update Wallet state
    ↓
Create Transaction record
    ↓
Display results in UI (AnimatePresence)
```

### State Persistence Flow
```
RewardContext state
    ↓
localStorage (STORAGE_KEY: 'smart_reward_engine_state_v1')
    ↓
Auto-restore on app reload
```

### Backend Communication Flow
```
API Operation (RuleManager, WalletView, etc.)
    ↓
SpringBootApiClient.request<T>()
    ↓
HTTP request to http://localhost:8080/...
    ↓
Parse JSON response
    ↓
Update local state
    ↓
Re-render components (React reactivity)
```

---

## 🎯 Key Features

### ✅ Multi-Tenant Architecture
- Separate data for multiple businesses
- Business/User selection in navbar
- Context-based isolation

### ✅ Flexible Reward Rules
- FLAT points (fixed amount)
- PERCENTAGE points (calculated from transaction amount)
- Minimum amount thresholds
- Active/Inactive status
- Event type filtering (PURCHASE, SIGNUP, REFERRAL, etc.)

### ✅ Wallet Management
- Available points tracking
- Pending points tracking
- Point confirmation workflow
- Point redemption
- Transaction history

### ✅ Event Processing
- Real-time rule evaluation
- Multi-rule matching per event
- Detailed evaluation explanations
- Transaction persistence

### ✅ Developer Experience
- TypeScript strict mode
- Hot module replacement during development
- Component animations with Motion
- Responsive dark UI
- Tailwind utility classes

---

## 🔐 Architecture Patterns Used

### Design Patterns
1. **Context Pattern:** Global state without prop drilling
2. **Provider Pattern:** RewardProvider wrapping app
3. **Component Composition:** Small, focused components
4. **Singleton:** Single RuleEngine class
5. **Factory:** API client for REST operations
6. **Observer:** React state subscriptions

### Best Practices
- TypeScript strict mode
- Functional components with hooks
- Separation of concerns (logic, UI, state)
- Reusable component composition
- Environment-based configuration
- Type-safe data models

---

## 📊 Performance Characteristics

### Bundle Size Optimization
- Vite tree-shaking removes unused code
- Tailwind purging removes unused CSS
- Lucide React uses SVG (lightweight)
- Motion library is optimized for bundle

### Runtime Performance
- React.StrictMode for detecting issues
- Memoization opportunities with useMemo/useCallback
- AnimatePresence batches animations
- localStorage for persistence (no network latency)

---

## 🧪 Testing Considerations

### Testable Layers
1. **RuleEngine:** Pure function (easy to unit test)
2. **Components:** React Testing Library compatible
3. **Context:** Can be mocked for isolated tests
4. **API Client:** Can stub for integration tests

### Current Test Setup
- **Note:** No testing framework currently configured
- Recommendations: Jest + React Testing Library

---

## 🚀 Deployment

### Build Process
```bash
npm run build
```
Creates optimized production bundle in `dist/` folder

### Deployment Targets
- Static hosting (Vercel, Netlify, etc.)
- CDN-enabled
- Requires backend API at configured VITE_API_BASE_URL

### Environment Setup for Production
```bash
VITE_API_BASE_URL=https://api.production.com npm run build
```

---

## 📚 Dependencies Versions Summary

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.525.0",
    "motion": "^12.0.0"
  },
  "devDependencies": {
    "vite": "^5.4.10",
    "@vitejs/plugin-react": "^4.3.3",
    "tailwindcss": "^4.1.11",
    "@tailwindcss/vite": "^4.1.11",
    "typescript": "^5.6.3",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1"
  }
}
```

---

## 🔗 Backend Integration

### Expected Backend API
- **Framework:** Spring Boot with Kotlin
- **Base URL:** http://localhost:8080
- **Communication:** REST JSON over HTTP
- **Endpoints Expected:**
  - POST `/events/process`
  - GET `/wallets/{userId}/{businessId}`
  - POST `/wallets/redeem`
  - GET `/rules` / POST `/rules` / PUT `/rules/{id}` / DELETE `/rules/{id}`

---

## 📝 Notes for Developers

1. **Local Storage Persistence:** State is automatically persisted to localStorage under key `smart_reward_engine_state_v1`
2. **Backend Connection:** Ensure Spring Boot backend is running on port 8080 for API calls
3. **Type Safety:** Leverage TypeScript strict mode for compile-time error detection
4. **Component Reusability:** Use composition over inheritance
5. **Environment Variables:** Use `.env` file for API base URL configuration

---

## 🎓 Learning Resources

- React 18: https://react.dev
- Vite: https://vitejs.dev
- TypeScript: https://www.typescriptlang.org
- Tailwind CSS: https://tailwindcss.com
- Motion: https://motion.dev
- Lucide Icons: https://lucide.dev

---

**Last Updated:** 2026-08-17  
**Documentation Version:** 1.0
