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
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time job automation monitoring</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-2 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-600 dark:text-emerald-500 text-sm font-medium uppercase tracking-widest text-[10px]">Live Syncing</span>
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
              className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-3xl border border-white/60 dark:border-white/10 p-6 rounded-[2rem] hover:border-blue-300 dark:hover:border-slate-700 transition-all duration-300 group shadow-[0_20px_60px_rgba(30,58,138,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(30,58,138,0.25)] dark:hover:shadow-[0_30px_70px_rgba(0,0,0,0.9)]"
            >
              {/* Card glowing accents mimicking the reference image */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-gradient-to-tr from-emerald-400/20 to-blue-500/10 rounded-full blur-3xl opacity-50" />
              
              <div className={`p-3 rounded-2xl w-fit ${stat.bg} ${stat.color} mb-4 group-hover:scale-110 transition-transform shadow-[0_5px_15px_rgba(0,0,0,0.05)] relative z-10`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium relative z-10">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1 relative z-10">{stat.value}</h3>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(30,58,138,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative mt-4">
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-50 pointer-events-none" />
        
        <div className="p-6 pb-4 flex justify-between items-center relative z-10">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Application Pipeline</h3>
          <button className="text-blue-600 dark:text-blue-300 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all border border-white/40 dark:border-white/10 shadow-[0_5px_15px_rgba(30,58,138,0.1)] dark:shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            <span>Refresh</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto min-h-[400px] relative z-10 px-2 pb-2">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest px-4">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">Job Role</th>
                <th className="px-6 py-4 font-bold tracking-widest">Company</th>
                <th className="px-6 py-4 font-bold tracking-widest">Match Score</th>
                <th className="px-6 py-4 font-bold tracking-widest">Status</th>
                <th className="px-6 py-4 text-right font-bold tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-slate-100 dark:bg-slate-800/20 rounded-lg m-2"></td>
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
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/60 dark:bg-transparent dark:hover:bg-white/[0.04] hover:shadow-[0_10px_30px_rgba(30,58,138,0.1)] transition-all group shadow-[0_5px_15px_rgba(30,58,138,0.05)] dark:shadow-none"
                    >
                      <td className="px-6 py-5 rounded-l-[1.5rem]">
                        <div className="font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors flex items-center text-sm md:text-base tracking-tight">
                          {job.title}
                          <a href={job.url} target="_blank" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="w-4 h-4 text-slate-500" /></a>
                        </div>
                        <div className="text-slate-500 text-xs mt-1 font-mono uppercase">{job.location || "Remote"}</div>
                      </td>
                      <td className="px-6 py-5 text-slate-600 dark:text-slate-300 font-medium text-sm">{job.company}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                           <div className="w-16 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${job.match_score}%` }}
                                className={`h-full ${job.match_score > 80 ? 'bg-emerald-500' : job.match_score > 50 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-slate-600'}`} 
                              />
                           </div>
                           <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{job.match_score}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px] mt-1 italic">{job.ai_analysis}</p>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-5 text-right rounded-r-2xl">
                        <button className="p-2 text-slate-400 hover:text-slate-800 bg-white/50 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-white rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
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
