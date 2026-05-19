import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Water Supply",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
        name: user.name,
        email: user.email,
      };

      await axios.post("http://localhost:5000/api/complaints", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      console.error("Submit failed", err);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-fade-in">
        <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Issue Reported
        </h2>
        <p className="text-slate-500 mb-8">
          We've received your report. It will appear on your dashboard shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Report an Issue
        </h1>
        <p className="text-slate-500">
          Provide details below to submit a complaint.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100/50"
      >
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Issue Title
          </label>
          <input
            type="text"
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all font-medium"
            placeholder="e.g., Broken pipe on Main St."
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Category
            </label>
            <select
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all font-medium appearance-none"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Roads">Roads</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Location
            </label>
            <input
              type="text"
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all font-medium"
              placeholder="City, Area"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Detailed Description
          </label>
          <textarea
            rows="5"
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all font-medium resize-none"
            placeholder="Describe the issue in detail..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          ></textarea>
        </div>

        <div className="pt-4 mt-6 border-t border-slate-100">
          <button
            type="submit"
            className="w-full bg-slate-900 text-white p-4 rounded-xl hover:bg-slate-800 transition shadow-md shadow-slate-900/10 font-bold flex justify-center items-center group"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Analyzing & Submitting...
              </span>
            ) : (
              <>
                Submit Report
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
