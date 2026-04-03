"use client";

import React, { useState } from "react";
import { User, Mail, Briefcase, DollarSign, Calendar, MapPin, Save, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: "Amrit",
    email: "amrit@example.com",
    experience: "4",
    currentCTC: "1200000",
    expectedCTC: "1800000",
    noticePeriod: "30 Days",
    location: "Bangalore",
    resume: "Highly skilled Full Stack Developer with 4 years of experience in React, Next.js, and Node.js. Expertise in building scalable web applications and microservices."
  });

  const handleSave = () => {
    // API call to update profile
    alert("Profile saved successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Professional Profile</h2>
          <p className="text-slate-400 mt-1">Manage your career details for AI matching.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Basic Info */}
        <div className="space-y-6">
          <SectionCard title="Personal Information" icon={User}>
            <div className="space-y-4">
              <Input label="Full Name" value={profile.fullName} icon={User} onChange={(v: string) => setProfile({...profile, fullName: v})} />
              <Input label="Email Address" value={profile.email} icon={Mail} onChange={(v: string) => setProfile({...profile, email: v})} />
              <Input label="Preferred Location" value={profile.location} icon={MapPin} onChange={(v: string) => setProfile({...profile, location: v})} />
            </div>
          </SectionCard>

          <SectionCard title="Career Metrics" icon={Briefcase}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Experience (Years)" value={profile.experience} icon={Briefcase} onChange={(v: string) => setProfile({...profile, experience: v})} />
                <Input label="Notice Period" value={profile.noticePeriod} icon={Calendar} onChange={(v: string) => setProfile({...profile, noticePeriod: v})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Current CTC" value={profile.currentCTC} icon={DollarSign} onChange={(v: string) => setProfile({...profile, currentCTC: v})} />
                <Input label="Expected CTC" value={profile.expectedCTC} icon={DollarSign} onChange={(v: string) => setProfile({...profile, expectedCTC: v})} />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Resume/AI Context */}
        <div className="space-y-6 h-full">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">AI Resume Context</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">Paste your resume text here. Our AI uses this for job matching scores.</p>
            <textarea 
              value={profile.resume}
              onChange={(e) => setProfile({...profile, resume: e.target.value})}
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent transition-all resize-none min-h-[400px]"
              placeholder="Paste your professional summary and skills..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, icon: Icon, onChange }: { label: string, value: string, icon: any, onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600">
          <Icon className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border-transparent" 
        />
      </div>
    </div>
  );
}
