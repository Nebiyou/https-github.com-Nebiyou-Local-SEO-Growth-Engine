import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Mail, 
  ShieldCheck, 
  BarChart3, 
  MapPin, 
  Building2, 
  HeartHandshake,
  Loader2,
  ChevronRight,
  Send,
  AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "./lib/utils";
import * as gemini from "./services/gemini";

type Tab = "scout" | "copywriter" | "grant" | "analyst";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("scout");
  const [url, setUrl] = useState("");
  const [auditResult, setAuditResult] = useState("");
  const [outreachEmail, setOutreachEmail] = useState("");
  const [grantAdvice, setGrantAdvice] = useState("");
  const [impactReport, setImpactReport] = useState("");
  const [loading, setLoading] = useState(false);

  const [ctr, setCtr] = useState(4.2);
  const [keywords, setKeywords] = useState("charity near me, donate dc, local help");
  const [metrics, setMetrics] = useState("Clicks: 1200, Conversions: 45, Spend: $8500");

  const handleAudit = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await gemini.runAudit(url);
      setAuditResult(res || "No data returned.");
      setActiveTab("scout");
    } catch (error) {
      console.error(error);
      setAuditResult("Error running audit. Please check your URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOutreach = async () => {
    if (!auditResult) return;
    setLoading(true);
    try {
      const res = await gemini.generateOutreach(auditResult);
      setOutreachEmail(res || "No data returned.");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantCheck = async () => {
    setLoading(true);
    try {
      const res = await gemini.getGrantAdvice(ctr, keywords);
      setGrantAdvice(res || "No data returned.");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await gemini.generateImpactReport(metrics);
      setImpactReport(res || "No data returned.");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <MapPin className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Local SEO Growth Engine</h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">DMV Metro Orchestrator</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> Small Biz</span>
            <span className="flex items-center gap-1"><HeartHandshake className="w-4 h-4" /> Nonprofits</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <nav className="lg:col-span-3 space-y-1">
            <NavButton 
              active={activeTab === "scout"} 
              onClick={() => setActiveTab("scout")}
              icon={<Search className="w-5 h-5" />}
              label="The Scout"
              description="Local SEO Gap Analysis"
            />
            <NavButton 
              active={activeTab === "copywriter"} 
              onClick={() => setActiveTab("copywriter")}
              icon={<Mail className="w-5 h-5" />}
              label="The Copywriter"
              description="Outreach & Found Money"
            />
            <NavButton 
              active={activeTab === "grant"} 
              onClick={() => setActiveTab("grant")}
              icon={<ShieldCheck className="w-5 h-5" />}
              label="The Grant Officer"
              description="Compliance & Protection"
            />
            <NavButton 
              active={activeTab === "analyst"} 
              onClick={() => setActiveTab("analyst")}
              icon={<BarChart3 className="w-5 h-5" />}
              label="The Analyst"
              description="Community Impact Reports"
            />
          </nav>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]"
              >
                {activeTab === "scout" && (
                  <div className="p-6 sm:p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">The Scout: Audit Phase</h2>
                      <p className="text-slate-600">Identify Map Pack presence, NAP inconsistencies, and Google Ad Grant potential.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                      <input 
                        type="url" 
                        placeholder="Enter business or nonprofit URL (e.g., https://example.org)"
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <button 
                        onClick={handleAudit}
                        disabled={loading || !url}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        Run Analysis
                      </button>
                    </div>

                    {auditResult && (
                      <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <ReactMarkdown>{auditResult}</ReactMarkdown>
                      </div>
                    )}

                    {!auditResult && !loading && (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Search className="w-12 h-12 mb-4 opacity-20" />
                        <p>Enter a URL to start the Local SEO Gap Analysis</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "copywriter" && (
                  <div className="p-6 sm:p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">The Copywriter: Outreach Phase</h2>
                      <p className="text-slate-600">Generate "Cold but Helpful" emails using the "Found Money" template.</p>
                    </div>

                    {!auditResult ? (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Audit Required</p>
                          <p className="text-sm">Please run a Scout analysis first to provide context for the outreach email.</p>
                          <button 
                            onClick={() => setActiveTab("scout")}
                            className="mt-2 text-sm font-bold underline underline-offset-4"
                          >
                            Go to The Scout
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <button 
                          onClick={handleGenerateOutreach}
                          disabled={loading}
                          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          Generate Outreach Email
                        </button>

                        {outreachEmail && (
                          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 font-mono text-sm whitespace-pre-wrap">
                            <ReactMarkdown>{outreachEmail}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "grant" && (
                  <div className="p-6 sm:p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">The Grant Officer: Compliance Phase</h2>
                      <p className="text-slate-600">Monitor Google Ad Grant status and protect the $120k/year budget.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Current CTR (%)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={ctr}
                          onChange={(e) => setCtr(parseFloat(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {ctr < 5 && (
                          <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Below 5% threshold!
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Active Keywords</label>
                        <textarea 
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-[46px] resize-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleGrantCheck}
                      disabled={loading}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors mb-8"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                      Check Compliance
                    </button>

                    {grantAdvice && (
                      <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <ReactMarkdown>{grantAdvice}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "analyst" && (
                  <div className="p-6 sm:p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">The Analyst: Reporting Phase</h2>
                      <p className="text-slate-600">Translate technical metrics into "Community Impact" stories.</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <label className="text-sm font-semibold text-slate-700">Monthly Metrics (GA4 / Google Ads)</label>
                      <textarea 
                        value={metrics}
                        onChange={(e) => setMetrics(e.target.value)}
                        placeholder="e.g., Clicks: 1200, Conversions: 45, Spend: $8500"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                      />
                    </div>

                    <button 
                      onClick={handleGenerateReport}
                      disabled={loading}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors mb-8"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                      Generate Impact Report
                    </button>

                    {impactReport && (
                      <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <ReactMarkdown>{impactReport}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">Arlington • Alexandria • DC • Silver Spring</span>
          </div>
          <p className="text-slate-400 text-xs">© 2026 Local SEO Growth Engine. Neighborly SEO for the DMV.</p>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, description }: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string,
  description: string
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group",
        active 
          ? "bg-white shadow-sm border border-slate-200 text-indigo-600" 
          : "hover:bg-slate-100 text-slate-500"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg transition-colors",
        active ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm leading-tight">{label}</p>
        <p className="text-[11px] font-medium opacity-70 leading-tight mt-0.5">{description}</p>
      </div>
      <ChevronRight className={cn(
        "w-4 h-4 transition-transform",
        active ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-40"
      )} />
    </button>
  );
}
