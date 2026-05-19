import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/complaints/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching complaints", err);
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const loc = c.location || "";
    return (
      (!filterCategory || c.category === filterCategory) &&
      (!searchLocation ||
        loc.toLowerCase().includes(searchLocation.toLowerCase()))
    );
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-slate-200 rounded-full mb-4"></div>
          <div className="text-slate-400 font-medium">
            Loading your records...
          </div>
        </div>
      </div>
    );

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            My Complaints
          </h1>
          <p className="text-slate-500">
            Track the status of the issues you've reported
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search location..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>

          <select
            className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-5 pr-10 rounded-full text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
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

          <Link
            to="/new-complaint"
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all flex items-center shadow-sm whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Issue
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplaints.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No issues reported
            </h3>
            <p className="text-slate-500 mb-6">
              You haven't reported any complaints in this category or location.
            </p>
            <Link
              to="/new-complaint"
              className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-md"
            >
              Create New Complaint
            </Link>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint._id}
              className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-300 overflow-hidden flex flex-col"
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
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                    {complaint.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                  {complaint.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
                  {complaint.description}
                </p>
                <div className="text-xs text-slate-500 font-medium mb-4">
                  <span className="text-slate-400">Location:</span>{" "}
                  {complaint.location}
                </div>

                {/* AI Insights Section */}
                {complaint.aiAnalysis && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-2xl p-4 border border-indigo-100/30 relative overflow-hidden group/ai transition-all duration-300">
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-200/10 rounded-full blur-2xl group-hover/ai:bg-indigo-300/20 transition-all duration-500"></div>
                      
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                          <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
                          AI Assessment
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
                          <span className="text-slate-400 font-semibold block mb-0.5">Assigned Department:</span>
                          <span className="text-slate-700 font-bold bg-white/80 px-2 py-0.5 rounded border border-indigo-50/50 inline-block">
                            {complaint.aiAnalysis.department}
                          </span>
                        </div>

                        {complaint.aiAnalysis.autoResponse && (
                          <div className="mt-3 bg-white/90 border-l-4 border-indigo-400 p-3 rounded-r-xl shadow-sm">
                            <span className="text-[10px] text-indigo-600 font-bold block mb-1 tracking-wide uppercase">AI Support Message</span>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              {complaint.aiAnalysis.autoResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center mt-auto">
                <div className="flex items-center text-xs text-slate-400 font-medium">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>

                <Link
                  to={`/complaint/${complaint._id}`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-0.5"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
