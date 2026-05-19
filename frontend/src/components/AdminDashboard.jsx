import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [analyzing, setAnalyzing] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const triggerAIAnalysis = async (complaint) => {
    const id = complaint._id;
    setAnalyzing((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("token");
      // 1. Trigger the AI analysis using the general /api/ai/analyze route
      const aiRes = await axios.post(
        "http://localhost:5000/api/ai/analyze",
        {
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Save the generated AI insights into the complaint document
      await axios.put(
        `http://localhost:5000/api/complaints/${id}`,
        { aiAnalysis: aiRes.data },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchComplaints();
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setAnalyzing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchComplaints = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/complaints");
      setComplaints(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching complaints", err);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchLocation) {
      fetchComplaints();
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/complaints/search?location=${searchLocation}`,
      );
      setComplaints(res.data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/complaints/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchComplaints();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const loc = c.location || "";
    const matchCategory = !filterCategory || c.category === filterCategory;
    const matchLocation =
      !searchLocation ||
      loc.toLowerCase().includes(searchLocation.toLowerCase());
    return matchCategory && matchLocation;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-indigo-200 rounded-full mb-4"></div>
          <div className="text-slate-400 font-medium">
            Loading admin records...
          </div>
        </div>
      </div>
    );

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center">
            <ShieldCheck className="h-8 w-8 mr-3 text-indigo-600" />
            Admin Command Center
          </h1>
          <p className="text-slate-500">
            Monitor all system complaints and AI automated routing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search location..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition shadow-sm"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </form>

          <select
            className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-5 pr-10 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition shadow-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Electricity">Electricity</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Roads">Roads</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplaints.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No complaints found
            </h3>
            <p className="text-slate-500">The system is currently clear.</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint._id}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-900/10 transition-all duration-300 overflow-hidden flex flex-col relative"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      complaint.status === "Resolved"
                        ? "bg-emerald-50 text-emerald-700"
                        : complaint.status === "In Progress"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {complaint.status}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 block">
                      {complaint.name}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {complaint.email}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                  {complaint.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                  {complaint.description}
                </p>
                <div className="text-xs text-slate-500 font-medium mb-4">
                  <span className="text-slate-400">Location:</span>{" "}
                  {complaint.location} |{" "}
                  <span className="text-slate-400">Cat:</span>{" "}
                  {complaint.category}
                </div>

                {/* AI Analysis Section */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {complaint.aiAnalysis ? (
                    <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/50 rounded-2xl p-4 border border-indigo-100/50 shadow-sm relative overflow-hidden group/ai transition-all duration-300">
                      {/* Subtle background glow */}
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl group-hover/ai:bg-indigo-300/30 transition-all duration-500"></div>
                      
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                          <Sparkles className="h-4 w-4 animate-pulse text-purple-500" />
                          AI Insights
                        </div>
                        
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          complaint.aiAnalysis.priority === "High"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : complaint.aiAnalysis.priority === "Medium"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}>
                          {complaint.aiAnalysis.priority} Priority
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs relative z-10">
                        <div>
                          <span className="text-slate-400 font-semibold block mb-0.5">Suggested Department:</span>
                          <span className="text-slate-700 font-bold bg-white/80 px-2 py-0.5 rounded border border-indigo-50 inline-block">
                            {complaint.aiAnalysis.department}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-semibold block mb-0.5">Summary:</span>
                          <p className="text-slate-600 italic leading-relaxed bg-white/40 p-2 rounded-lg border border-slate-100">
                            "{complaint.aiAnalysis.summary}"
                          </p>
                        </div>

                        {complaint.aiAnalysis.autoResponse && (
                          <div className="mt-3 bg-white/95 border-l-4 border-indigo-500 p-3 rounded-r-xl shadow-sm relative group/response">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] text-indigo-600 font-bold tracking-wide uppercase">Auto-Response Draft</span>
                              <button
                                onClick={() => handleCopy(complaint._id, complaint.aiAnalysis.autoResponse)}
                                className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-slate-100 cursor-pointer"
                                title="Copy Auto-Response"
                              >
                                {copiedId === complaint._id ? (
                                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                    Copied!
                                  </span>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                )}
                              </button>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed select-all">
                              {complaint.aiAnalysis.autoResponse}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Re-analyze button inside the card */}
                      <div className="mt-3 flex justify-end relative z-10">
                        <button
                          onClick={() => triggerAIAnalysis(complaint)}
                          disabled={analyzing[complaint._id]}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {analyzing[complaint._id] ? (
                            <>
                              <div className="h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3" />
                              Re-Analyze
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl transition hover:bg-slate-100/50">
                      <Sparkles className="h-5 w-5 text-slate-300 mb-2 animate-pulse" />
                      <p className="text-[11px] text-slate-400 mb-3 font-medium text-center px-4">
                        No AI insights generated for this complaint yet.
                      </p>
                      <button
                        onClick={() => triggerAIAnalysis(complaint)}
                        disabled={analyzing[complaint._id]}
                        className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-100 hover:shadow-lg disabled:opacity-50 cursor-pointer select-none"
                      >
                        {analyzing[complaint._id] ? (
                          <>
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Analyzing with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
                            AI Analyze
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center text-xs text-slate-400 font-medium">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center space-x-4">
                  <Link
                    to={`/complaint/${complaint._id}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition whitespace-nowrap"
                  >
                    Details &rarr;
                  </Link>

                  <div className="flex space-x-2">
                    {complaint.status !== "Resolved" && (
                      <button
                        onClick={() => updateStatus(complaint._id, "Resolved")}
                        className="text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                    {complaint.status === "Pending" && (
                      <button
                        onClick={() => updateStatus(complaint._id, "In Progress")}
                        className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Process
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
