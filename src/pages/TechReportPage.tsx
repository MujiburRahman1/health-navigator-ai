import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TechReportPage = () => {
  const navigate = useNavigate();

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print-hidden header */}
      <div className="print:hidden bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-primary-foreground hover:bg-primary/80">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleDownloadPDF} className="bg-white text-primary hover:bg-gray-100">
          <FileDown className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* PDF Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none">
        {/* Title Page */}
        <div className="text-center mb-12 print:mb-8 print:pt-16">
          <h1 className="text-4xl font-bold text-primary mb-4">🏥 Bridging Medical Deserts</h1>
          <h2 className="text-2xl text-muted-foreground mb-6">Technical Architecture Report</h2>
          <p className="text-lg text-muted-foreground">AI-Powered Healthcare Infrastructure Analytics Platform</p>
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Databricks Hackathon 2025</p>
            <p>Virtue Foundation Ghana Dataset</p>
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="mb-6 print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl text-primary">1. Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Bridging Medical Deserts is an AI-powered healthcare intelligence platform designed to identify 
              regional healthcare gaps, detect anomalous facility claims, and optimize resource allocation 
              for NGO planners and policymakers working in underserved regions.
            </p>
            <p>
              The platform leverages a multi-agent AI architecture to unlock medical knowledge trapped in 
              unstructured documents, with the ambitious goal of reducing the time patients receive 
              lifesaving treatment by 100x.
            </p>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="mb-6 print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl text-primary">2. Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Layer</th>
                    <th className="text-left p-2 font-semibold">Technology</th>
                    <th className="text-left p-2 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Frontend Framework</td>
                    <td className="p-2">React 18, TypeScript, Vite</td>
                    <td className="p-2">Type-safe, high-performance UI</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Styling</td>
                    <td className="p-2">Tailwind CSS, shadcn/ui, Radix UI</td>
                    <td className="p-2">Accessible, responsive design system</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Data Visualization</td>
                    <td className="p-2">Recharts</td>
                    <td className="p-2">Statistical charts and analytics</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Mapping</td>
                    <td className="p-2">Leaflet, react-leaflet v4.2.1</td>
                    <td className="p-2">Interactive geographic visualization</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Backend</td>
                    <td className="p-2">Supabase (PostgreSQL)</td>
                    <td className="p-2">Database with Row-Level Security</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Serverless Functions</td>
                    <td className="p-2">Supabase Edge Functions (Deno)</td>
                    <td className="p-2">AI chat, voice, data ingestion</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">AI Models</td>
                    <td className="p-2">Gemini, GPT via Lovable AI Gateway</td>
                    <td className="p-2">Natural language processing</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">State Management</td>
                    <td className="p-2">TanStack React Query</td>
                    <td className="p-2">Server state & caching</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Validation</td>
                    <td className="p-2">Zod, React Hook Form</td>
                    <td className="p-2">Schema validation & forms</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Icons</td>
                    <td className="p-2">Lucide React</td>
                    <td className="p-2">Consistent iconography</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Overview */}
        <Card className="mb-6 print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl text-primary">3. System Architecture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">3.1 Frontend Architecture</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Single Page Application (SPA) with React Router for navigation</li>
                <li>Component-based architecture with reusable UI primitives</li>
                <li>Custom hooks for data fetching (useFacilities, useSearch)</li>
                <li>Responsive design optimized for mobile field workers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3.2 Backend Architecture</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>PostgreSQL database with healthcare_facilities table</li>
                <li>Row-Level Security (RLS) for data protection</li>
                <li>Edge Functions for serverless AI processing</li>
                <li>RESTful API via Supabase auto-generated endpoints</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3.3 Multi-Agent AI Architecture</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Supervisor Agent:</strong> Intent routing and query classification</li>
                <li><strong>Genie Chat:</strong> Text-to-SQL conversion for database queries</li>
                <li><strong>Medical Reasoning Agent:</strong> Clinical context and expert analysis</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* AI Intelligence Features */}
        <Card className="mb-6 print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl text-primary">4. AI Intelligence Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">4.1 Anomaly Detection</h4>
              <p className="mb-2">Equipment-specialty mismatch detection using SPECIALTY_EQUIPMENT_MAP:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cardiac surgery claims verified against cath lab, bypass machine, ICU</li>
                <li>Dialysis facilities checked for dialysis/hemodialysis equipment</li>
                <li>Emergency departments validated for defibrillator, ventilator, trauma equipment</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4.2 Geospatial Analysis</h4>
              <p className="mb-2">Haversine distance calculations for healthcare cold spot identification:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = sin(dLat/2)² + cos(lat1) * cos(lat2) * sin(dLng/2)²;
  return R * 2 * atan2(√a, √(1-a));
}`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4.3 VF Agent Query Framework</h4>
              <p>59 specialized queries across 11 MoSCoW-prioritized categories:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Geospatial Analysis (cold spots, coverage gaps)</li>
                <li>Anomaly Detection (equipment mismatches, suspicious claims)</li>
                <li>Workforce Distribution (practitioner locations)</li>
                <li>Service Classification (permanent vs itinerant)</li>
                <li>Resource Distribution (equipment gaps, training needs)</li>
                <li>NGO Analysis (organizational coverage)</li>
                <li>Benchmarking (WHO guideline comparisons)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Database Schema */}
        <Card className="mb-6 print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl text-primary">5. Database Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold mb-2 text-sm">healthcare_facilities Table</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Column</th>
                    <th className="text-left p-2 font-semibold">Type</th>
                    <th className="text-left p-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2">id</td><td className="p-2">UUID</td><td className="p-2">Primary key</td></tr>
                  <tr className="border-b"><td className="p-2">name</td><td className="p-2">TEXT</td><td className="p-2">Facility name</td></tr>
                  <tr className="border-b"><td className="p-2">region</td><td className="p-2">TEXT</td><td className="p-2">Geographic region</td></tr>
                  <tr className="border-b"><td className="p-2">specialties</td><td className="p-2">TEXT</td><td className="p-2">Medical specialties offered</td></tr>
                  <tr className="border-b"><td className="p-2">procedures</td><td className="p-2">TEXT</td><td className="p-2">Available procedures</td></tr>
                  <tr className="border-b"><td className="p-2">equipment</td><td className="p-2">TEXT</td><td className="p-2">Medical equipment</td></tr>
                  <tr className="border-b"><td className="p-2">capability</td><td className="p-2">TEXT</td><td className="p-2">Facility capabilities</td></tr>
                  <tr className="border-b"><td className="p-2">phone</td><td className="p-2">TEXT</td><td className="p-2">Contact phone</td></tr>
                  <tr className="border-b"><td className="p-2">website</td><td className="p-2">TEXT</td><td className="p-2">Website URL</td></tr>
                  <tr className="border-b"><td className="p-2">source_url</td><td className="p-2">TEXT</td><td className="p-2">Data source reference</td></tr>
                  <tr><td className="p-2">created_at, updated_at</td><td className="p-2">TIMESTAMP</td><td className="p-2">Audit timestamps</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-6 print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl text-primary">6. Security Implementation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Row-Level Security (RLS):</strong> Enabled on all tables for data protection</li>
              <li><strong>Public Read Access:</strong> Facility data accessible for transparency</li>
              <li><strong>Edge Function Authorization:</strong> Secure API endpoints with proper headers</li>
              <li><strong>Environment Variables:</strong> API keys stored securely, never in code</li>
              <li><strong>CORS Configuration:</strong> Controlled cross-origin access</li>
            </ul>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="mb-6 print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl text-primary">7. Key Platform Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">📊 Dashboard</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-xs">
                  <li>Real-time healthcare statistics</li>
                  <li>System alerts for medical deserts</li>
                  <li>Regional coverage analysis</li>
                  <li>AI-powered natural language assistant</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🗺️ Interactive Map</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-xs">
                  <li>Leaflet-based geographic visualization</li>
                  <li>Status-coded markers (Operational, Limited, Suspicious)</li>
                  <li>Region filtering via URL parameters</li>
                  <li>Medical desert zone indicators</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔍 Smart Search</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-xs">
                  <li>59 specialized VF Agent queries</li>
                  <li>Interactive facility citations [FAC-xxx]</li>
                  <li>Cold spot detection with map linking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📈 Analytics</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-xs">
                  <li>Recharts-based visualizations</li>
                  <li>Regional distribution analysis</li>
                  <li>Equipment and specialty gap identification</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transparency Citations */}
        <Card className="mb-6 print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl text-primary">8. Transparency & Citations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              All AI responses include interactive row-level citations using [FAC-xxx] tags. 
              Clicking a citation opens a detailed slide-out panel (Radix UI Sheet) displaying:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Full facility metadata (name, region, capabilities)</li>
              <li>Specialties, procedures, and equipment lists</li>
              <li>Contact details (phone, website)</li>
              <li>Source URL for data verification</li>
            </ul>
            <p className="mt-2">
              This ensures all claims are verifiable against raw data, building trust with NGO planners.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12 print:mt-8 print:pb-8">
          <p className="font-semibold">Built with ❤️ for bridging healthcare gaps worldwide</p>
          <p className="mt-2">Databricks Hackathon 2025 | Virtue Foundation Ghana Dataset</p>
          <p className="mt-1">© 2025 Bridging Medical Deserts</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-gray-300 { border-color: #d1d5db !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:pt-16 { padding-top: 4rem !important; }
          .print\\:mb-8 { margin-bottom: 2rem !important; }
          .print\\:mt-8 { margin-top: 2rem !important; }
          .print\\:pb-8 { padding-bottom: 2rem !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
};

export default TechReportPage;
