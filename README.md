# 🏥 Bridging Medical Deserts

An AI-powered healthcare infrastructure analytics platform designed for NGO planners and policymakers to identify regional healthcare gaps, detect anomalies, and optimize resource allocation.

## 🎯 Project Vision

This platform unlocks medical knowledge trapped in unstructured documents to match patients with care globally, helping close healthcare access gaps and potentially extending quality care to billions currently underserved.

## ✨ Key Features

### 📊 Dashboard Overview
- Real-time healthcare infrastructure statistics
- System alerts for medical deserts and suspicious claims
- Regional coverage analysis with coverage scores
- AI-powered healthcare assistant with natural language queries

### 🗺️ Interactive Map
- Leaflet-based geographic visualization of healthcare facilities
- Status-coded markers (Operational, Limited, Suspicious, Incomplete)
- Facility name labels with toggle visibility
- Region filtering via URL parameters
- Medical desert zone indicators

### 🔍 Smart Search
- 59 specialized VF Agent queries across 11 categories
- MoSCoW-prioritized query library (Geospatial, Anomaly, Workforce, etc.)
- Interactive facility citations with [FAC-xxx] tags
- Cold spot detection linking to filtered map views

### 📈 Analytics
- Recharts-based statistical visualizations
- Regional distribution analysis
- Equipment and specialty gap identification

### 🧠 AI Intelligence Features
- **Anomaly Detection**: Identifies equipment mismatches (e.g., surgical claims without proper equipment)
- **Geospatial Analysis**: Haversine distance calculations for healthcare cold spots
- **Transparency Citations**: Row-level citations with slide-out facility detail panels
- **Multi-Agent Architecture**: Supervisor Agent, Genie Chat (text-to-SQL), and Medical Reasoning Agent

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Maps | Leaflet, react-leaflet v4.2.1 |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL, Edge Functions) |
| AI | Lovable AI (Gemini, GPT models) |

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/      # StatCard, AlertsList, RegionOverview
│   ├── facilities/     # FacilitiesList, FacilityDetail
│   ├── map/            # HealthcareMap with Leaflet
│   ├── search/         # SearchPanel with VF Agent queries
│   ├── analytics/      # AnalyticsCharts
│   └── ui/             # shadcn/ui components
├── hooks/
│   ├── useFacilities.ts    # Facility data & statistics
│   └── useSearch.ts        # Search functionality
├── lib/
│   ├── anomalyDetection.ts # Equipment mismatch detection
│   ├── geospatialUtils.ts  # Distance calculations
│   └── vfAgentQuestions.ts # 59-question query framework
├── pages/
│   ├── Dashboard.tsx       # Main dashboard
│   ├── MapPage.tsx         # Interactive map
│   ├── SearchPage.tsx      # AI search interface
│   ├── AnalyticsPage.tsx   # Visual analytics
│   └── FacilitiesPage.tsx  # Facility browser
└── types/
    └── healthcare.ts       # TypeScript interfaces

supabase/
└── functions/
    ├── healthcare-chat/    # AI chat endpoint
    ├── healthcare-voice/   # Voice response endpoint
    └── upload-dataset/     # Data ingestion
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (install via [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

The project uses Lovable Cloud (Supabase) with auto-configured environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## 📊 Database Schema

### `healthcare_facilities`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Facility name |
| region | TEXT | Geographic region |
| specialties | TEXT | Medical specialties |
| procedures | TEXT | Available procedures |
| equipment | TEXT | Medical equipment |
| capability | TEXT | Facility capabilities |
| phone | TEXT | Contact phone |
| website | TEXT | Website URL |
| source_url | TEXT | Data source reference |

## 🔐 Security

- Row-Level Security (RLS) enabled on all tables
- Public read access for facility data
- Secure edge functions with proper authorization

## 🎨 Design Philosophy

- **Clean & Minimalist**: Medical-themed, professional interface
- **Mobile-First**: Responsive design optimized for field workers
- **Demo-Friendly**: Intuitive for non-technical NGO planners
- **Accessibility**: High contrast, clear typography

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🤝 Contributing

This project is built with [Lovable](https://lovable.dev). Changes made via Lovable are automatically committed.

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with ❤️ for bridging healthcare gaps worldwide**
