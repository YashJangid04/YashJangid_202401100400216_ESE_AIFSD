import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  MapPin,
  Tag,
  User,
  Mail,
  Copy,
  Check
} from "lucide-react";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.role === "admin";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      const res = await axios.get("https://yashjangid-202401100400216-ese.onrender.com/api/complaints");
      // Find the specific complaint from the list
      const current = res.data.find((c) => c._id === id);
      if (!current) {
        setError("Complaint not found in records.");
      } else {
        setComplaint(current);
        setStatus(current.status);
      }
    } catch (err) {
      setError("Failed to fetch complaint details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await axios.put(
        `https://yashjangid-202401100400216-ese.onrender.com/api/complaints/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaint(res.data);
      alert("Complaint status updated successfully!");
    } catch (err) {
      alert("Failed to update complaint status.");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete this complaint? This action is permanent.")) {
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`https://yashjangid-202401100400216-ese.onrender.com/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Complaint removed successfully.");
      navigate(isAdmin ? "/admin" : "/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete the complaint.");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const resAI = await axios.post(
        "https://yashjangid-202401100400216-ese.onrender.com/api/ai/analyze",
        {
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const resSave = await axios.put(
        `https://yashjangid-202401100400216-ese.onrender.com/api/complaints/${id}`,
        { aiAnalysis: resAI.data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaint(resSave.data);
    } catch (err) {
      alert("AI Analysis failed. Fallback keywords will trigger if OpenRouter key is unset.");
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-indigo-600 rounded-full mb-4 animate-bounce"></div>
          <div className="text-slate-400 font-medium">Retrieving full records...</div>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Record Error</h2>
        <p className="text-slate-500 mb-8">{error || "Complaint could not be found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-950 font-semibold text-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Delete complaint trigger (Authorized User or Admin) */}
        {(isAdmin || currentUser.email === complaint.email) && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 text-rose-600 hover:text-rose-800 font-bold text-xs bg-rose-50 border border-rose-100 hover:bg-rose-100/70 py-2 px-4 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {deleting ? (
              <>
                <div className="h-3 w-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete Complaint
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Complaint Details & Status Updates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Complaint Details Panel */}
          <div className="bg-white border border-slate-100 shadow-sm shadow-slate-100/50 rounded-3xl p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  complaint.status === "Resolved"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : complaint.status === "In Progress"
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {complaint.status}
              </span>
              
              <div className="flex items-center text-xs text-slate-400 font-medium">
                <Clock className="h-4 w-4 mr-1.5" />
                Submitted on {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
              {complaint.title}
            </h1>

            <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 py-1.5 px-3.5 rounded-xl">
                <Tag className="h-4 w-4 text-slate-400" />
                Category: <span className="text-slate-950 font-bold">{complaint.category}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 py-1.5 px-3.5 rounded-xl">
                <MapPin className="h-4 w-4 text-slate-400" />
                Location: <span className="text-slate-950 font-bold">{complaint.location}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Complaint Description
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                {complaint.description}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">REGISTERED USER</span>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">{complaint.name}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">EMAIL ADDRESS</span>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href={`mailto:${complaint.email}`} className="text-sm font-medium text-indigo-600 hover:underline">{complaint.email}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Complaint Status Update Page Module (Admins only) */}
          {isAdmin && (
            <div className="bg-white border border-slate-100 shadow-sm shadow-slate-100/50 rounded-3xl p-8">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="bg-indigo-50 p-2 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-none">Status Update Panel</h2>
                  <p className="text-xs text-slate-400 mt-1">Select and commit new progress status for this case.</p>
                </div>
              </div>

              <form onSubmit={handleStatusUpdate} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Select New Status
                  </label>
                  <select
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold appearance-none"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="In Progress">In Progress / Investigation</option>
                    <option value="Resolved">Resolved & Closed</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="bg-slate-900 text-white font-bold text-sm px-6 py-4 rounded-xl hover:bg-slate-800 transition-all shadow-md w-full sm:w-auto cursor-pointer disabled:opacity-50 select-none"
                >
                  {updating ? "Committing..." : "Update Status"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: AI Analysis Result Display Module */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-slate-850 shadow-xl shadow-slate-950/20 rounded-3xl p-6 text-white relative overflow-hidden group/ai">
            {/* Dynamic visual aura */}
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover/ai:bg-purple-500/35 transition-all duration-700"></div>
            <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover/ai:bg-indigo-500/25 transition-all duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                  <h2 className="text-md font-bold uppercase tracking-widest text-indigo-200">AI Assessment</h2>
                </div>
                {complaint.aiAnalysis && (
                  <button
                    onClick={handleAIAnalysis}
                    disabled={analyzing}
                    className="text-[11px] font-bold text-indigo-300 hover:text-indigo-100 bg-white/5 border border-white/10 py-1.5 px-3.5 rounded-xl transition hover:bg-white/10 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <div className="h-3 w-3 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Re-analyze
                      </>
                    )}
                  </button>
                )}
              </div>

              {complaint.aiAnalysis ? (
                <div className="space-y-6">
                  {/* Urgent Alert Banner */}
                  <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-xs text-indigo-300 font-bold">Priority Urgency</span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        complaint.aiAnalysis.priority === "High"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : complaint.aiAnalysis.priority === "Medium"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {complaint.aiAnalysis.priority} Priority
                    </span>
                  </div>

                  {/* Responsible Department */}
                  <div>
                    <span className="text-xs text-indigo-300 font-bold block mb-2">Responsible Department</span>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-2.5">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                      <span className="text-sm font-extrabold text-white">
                        {complaint.aiAnalysis.department}
                      </span>
                    </div>
                  </div>

                  {/* Auto-generated response message */}
                  {complaint.aiAnalysis.autoResponse && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-indigo-300 font-bold">Auto-Response Message</span>
                        <button
                          onClick={() => handleCopyText(complaint.aiAnalysis.autoResponse)}
                          className="text-indigo-400 hover:text-indigo-200 transition p-1 hover:bg-white/5 rounded cursor-pointer"
                          title="Copy Draft Response"
                        >
                          {copied ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check className="h-3 w-3" />
                              Copied!
                            </span>
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="bg-indigo-900/30 border-l-4 border-indigo-500 p-4 rounded-r-2xl shadow-inner relative">
                        <MessageSquare className="absolute right-4 bottom-4 h-12 w-12 text-white/5 pointer-events-none" />
                        <p className="text-slate-300 text-xs leading-relaxed italic">
                          "{complaint.aiAnalysis.autoResponse}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Automated Summary */}
                  {complaint.aiAnalysis.summary && (
                    <div>
                      <span className="text-xs text-indigo-300 font-bold block mb-2">AI Summary</span>
                      <p className="text-slate-300 text-xs leading-relaxed bg-white/5 border border-white/5 p-4 rounded-2xl">
                        {complaint.aiAnalysis.summary}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 px-4">
                  <Sparkles className="h-10 w-10 text-indigo-400 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-sm font-bold text-white mb-2">No AI Assessment</h3>
                  <p className="text-slate-400 text-xs mb-6 max-w-xs mx-auto">
                    Generate instant priority rating, department routing suggestion, and automatic responder.
                  </p>
                  <button
                    onClick={handleAIAnalysis}
                    disabled={analyzing}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-750 text-white font-bold text-xs py-3 px-6 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none"
                  >
                    {analyzing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating Insights...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-indigo-200" />
                        Run AI Analysis
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
