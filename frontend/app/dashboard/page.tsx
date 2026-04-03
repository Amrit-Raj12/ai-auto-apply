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
  XCircle,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle
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

  // Table Control States
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterScore, setFilterScore] = useState(0);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'none'>('none');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const computedJobs = React.useMemo(() => {
    let result = [...activeJobs];

    if (filterLocation) {
      result = result.filter(j => j.location?.toLowerCase().includes(filterLocation.toLowerCase()));
    }
    if (filterCompany) {
      result = result.filter(j => j.company?.toLowerCase().includes(filterCompany.toLowerCase()));
    }
    if (filterScore > 0) {
      result = result.filter(j => j.match_score >= filterScore);
    }

    if (sortOrder !== 'none') {
      result.sort((a, b) => sortOrder === 'desc' ? b.match_score - a.match_score : a.match_score - b.match_score);
    }

    return result;
  }, [activeJobs, filterLocation, filterCompany, filterScore, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(computedJobs.length / itemsPerPage));
  const paginatedJobs = computedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

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

  // Modal State handling
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8000/jobs/${jobToDelete}`);
      // Optimistic update
      setActiveJobs(prev => prev.filter(j => j.id !== jobToDelete));
      // Re-trigger fetch to sync the actual updated stats length and ensure alignment
      fetchData();
    } catch (e) {
      console.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setJobToDelete(null);
    }
  };

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

        <div className="p-6 pb-2 flex justify-between items-center relative z-10">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Application Pipeline</h3>
          <button className="text-blue-600 dark:text-blue-300 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all border border-white/40 dark:border-white/10 shadow-[0_5px_15px_rgba(30,58,138,0.1)] dark:shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            <span>Refresh</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 mx-6 mt-2 mb-4 bg-white/30 dark:bg-black/20 border border-white/50 dark:border-white/5 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-inner backdrop-blur-md relative z-10">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1 px-4">
            <input
              type="text"
              placeholder="Location..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-white/60 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/50 rounded-xl px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder:text-slate-400 shadow-sm"
            />
            <input
              type="text"
              placeholder="Company..."
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="bg-white/60 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/50 rounded-xl px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder:text-slate-400 shadow-sm"
            />
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/50 rounded-xl px-3 py-1.5 shadow-sm">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap min-w-[90px]">Min Score: {filterScore}%</span>
              <input
                type="range"
                min="0" max="100" step="5"
                value={filterScore}
                onChange={(e) => setFilterScore(parseInt(e.target.value))}
                className="w-20 accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : prev === 'asc' ? 'none' : 'desc')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all text-sm font-medium shadow-sm ${sortOrder !== 'none' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30' : 'bg-white/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-white/60 dark:border-slate-700/50 hover:bg-white hover:border-white dark:hover:bg-slate-800'} cursor-pointer`}
          >
            <span>Sort: Score {sortOrder === 'desc' ? '↓' : sortOrder === 'asc' ? '↑' : '-'}</span>
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px] relative z-10 px-2 pb-2">
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
              ) : paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No results found for these filters.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {paginatedJobs.map((job, i) => (
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
                        <button
                          onClick={() => setJobToDelete(job.id)}
                          className="p-2 text-rose-400 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 bg-red-50/50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all shadow-[0_5px_15px_rgba(225,29,72,0.1)] dark:shadow-none cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200/50 dark:border-white/5 flex justify-between items-center relative z-10 bg-white/20 dark:bg-black/10">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing {computedJobs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, computedJobs.length)} of {computedJobs.length} queries
          </span>
          <div className="flex items-center space-x-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="pl-2 pr-3 py-1.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-white dark:hover:bg-white/10 flex items-center shadow-sm cursor-pointer">
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Prev</span>
            </button>
            <div className="px-4 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white/40 dark:bg-black/20 rounded-lg shadow-inner py-1.5 border border-white/50 dark:border-white/5">
              {currentPage} <span className="text-slate-400 font-normal mx-1">/</span> {totalPages}
            </div>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="pl-3 pr-2 py-1.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-white dark:hover:bg-white/10 flex items-center shadow-sm cursor-pointer">
              <span className="text-sm font-medium">Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Glassmorphic Delete Confirmation Modal */}
      <AnimatePresence>
        {jobToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setJobToDelete(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/60 dark:border-slate-700 p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Target Job Removal</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Are you sure you want to delete this recorded job node? Action cannot be undone.</p>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  disabled={isDeleting}
                  onClick={() => setJobToDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  {isDeleting ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
