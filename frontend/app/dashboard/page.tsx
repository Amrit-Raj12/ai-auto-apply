"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  MoreVertical,
  Search,
  AlertCircle,
  XCircle
} from "lucide-react";
import CommandBar from "@/components/CommandBar";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_jobs_found: 0,
    total_applied: 0,
    total_skipped: 0,
    success_rate: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        axios.get("http://localhost:8000/jobs"),
        axios.get("http://localhost:8000/stats")
      ]);
      setActiveJobs(jobsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Set up live polling every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const statCards = [
    { label: "Total Found", value: stats.total_jobs_found, icon: Search, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "AI Matches", value: stats.total_applied + stats.total_skipped, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Applied", value: stats.total_applied, icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Success Rate", value: `${Math.round(stats.success_rate)}%`, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /><span>Applied</span></span>;
      case "skipped":
        return <span className="inline-flex items-center space-x-1.5 bg-slate-500/10 text-slate-400 px-3 py-1 rounded-full text-xs font-semibold border border-slate-500/20"><AlertCircle className="w-3 h-3" /><span>Skipped</span></span>;
      case "failed":
        return <span className="inline-flex items-center space-x-1.5 bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full text-xs font-semibold border border-rose-500/20"><XCircle className="w-3 h-3" /><span>Failed</span></span>;
      default:
        return <span className="inline-flex items-center space-x-1.5 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/20"><Clock className="w-3 h-3" /><span>Searching</span></span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-400 mt-1">Real-time job automation monitoring</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-500 text-sm font-medium uppercase tracking-widest text-[10px]">Live Syncing</span>
        </div>
      </div>

      <CommandBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors group"
            >
              <div className={`p-3 rounded-xl w-fit ${stat.bg} ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Application Pipeline</h3>
          <button className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center space-x-1 transition-colors">
            <span>Refresh</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-sm font-medium uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Job Role</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Match Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-slate-800/20 rounded-lg m-2"></td>
                  </tr>
                ))
              ) : activeJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No activity detected. Try commanding your AI to "Apply to latest React jobs".
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {activeJobs.map((job, i) => (
                    <motion.tr 
                      key={job.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="hover:bg-slate-800/30 transition-colors group border-none"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center">
                          {job.title}
                          <a href={job.url} target="_blank" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="w-4 h-4 text-slate-500" /></a>
                        </div>
                        <div className="text-slate-500 text-xs mt-1 font-mono uppercase">{job.location || "Remote"}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">{job.company}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                           <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${job.match_score}%` }}
                                className={`h-full ${job.match_score > 80 ? 'bg-emerald-500' : job.match_score > 50 ? 'bg-blue-500' : 'bg-slate-600'}`} 
                              />
                           </div>
                           <span className="text-xs font-bold text-slate-300">{job.match_score}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px] mt-1 italic">{job.ai_analysis}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
