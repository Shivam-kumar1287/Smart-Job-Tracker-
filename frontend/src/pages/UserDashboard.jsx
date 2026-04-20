import { useState, useEffect } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "", email: "", phone: "", location: "", bio: "", skills: "",
    social_links: []
  });
  const [stats, setStats] = useState({
    totalApplications: 0, pendingApplications: 0, 
    acceptedApplications: 0, rejectedApplications: 0, savedJobs: 0
  });

  useEffect(() => {
    fetchUserProfile();
    fetchApplications();
    loadSavedJobs();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data);
      setProfileForm({
        name: res.data.name || "", email: res.data.email || "",
        phone: res.data.phone || "", location: res.data.location || "",
        bio: res.data.bio || "", skills: res.data.skills || "",
        social_links: res.data.social_links || []
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/");
      }
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications/my");
      setApplications(res.data);
      
      const st = {
        totalApplications: res.data.length,
        pendingApplications: res.data.filter(a => a.status === 'pending').length,
        acceptedApplications: res.data.filter(a => a.status === 'accepted').length,
        rejectedApplications: res.data.filter(a => a.status === 'rejected').length,
        savedJobs: JSON.parse(localStorage.getItem('savedJobs') || '[]').length
      };
      setStats(st);
    } catch (err) { }
  };

  const loadSavedJobs = async () => {
    const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setStats(prev => ({...prev, savedJobs: savedJobIds.length}));
    
    if (savedJobIds.length === 0) {
      setSavedJobs([]);
      return;
    }

    const jobPromises = savedJobIds.map(async (jobId) => {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        return { ...res.data, saved: true };
      } catch (error) {
        return null;
      }
    });

    const jobs = await Promise.all(jobPromises);
    setSavedJobs(jobs.filter(job => job !== null));
  };

  const unsaveJob = (jobId) => {
    const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const updatedIds = savedJobIds.filter(id => id !== jobId);
    localStorage.setItem('savedJobs', JSON.stringify(updatedIds));
    
    setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    setStats(prev => ({...prev, savedJobs: updatedIds.length}));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/profile", profileForm);
      setEditingProfile(false);
      fetchUserProfile();
    } catch (err) {
      alert("Error updating profile");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "accepted": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "rejected": return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 animate-fadeIn">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.name || 'User'}</span>!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Here's what's happening with your job search today.</p>
          </div>
          
          <button
            onClick={() => navigate("/jobs")}
            className="group relative z-10 inline-flex items-center justify-center px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:shadow-lg transition-all active:scale-95"
          >
            Explore Jobs
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 p-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 max-w-fit">
          {["overview", "applications", "profile", "saved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap active:scale-95 ${
                activeTab === tab 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20" 
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="animate-fadeInUp">
          
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Applications", val: stats.totalApplications, icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", borderColor: "border-blue-200 dark:border-blue-800" },
                  { label: "Pending Review", val: stats.pendingApplications, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", borderColor: "border-amber-200 dark:border-amber-800" },
                  { label: "Accepted", val: stats.acceptedApplications, icon: "M9 12l2 2 4-6m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", borderColor: "border-emerald-200 dark:border-emerald-800" },
                  { label: "Saved Roles", val: stats.savedJobs, icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", borderColor: "border-purple-200 dark:border-purple-800" }
                ].map((stat, i) => (
                  <div key={i} className={`bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border ${stat.borderColor} transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}>
                    <div className="flex items-center justify-between z-10 relative">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                        <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Application History
              </h2>
              
              {applications.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Your application history is empty.</p>
                  <button onClick={() => navigate("/jobs")} className="px-6 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 font-medium rounded-xl transition-all active:scale-95 shadow-sm hover:shadow-md">Find a Job</button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {applications.map((app) => (
                    <div key={app.id} className="relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{app.job_role}</h3>
                          <p className="text-gray-600 dark:text-gray-400 font-medium mb-3">{app.company_name}</p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Applied on {new Date(app.created_at).toLocaleDateString()}
                          </div>

                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Placement Progress</span>
                              <div className="flex items-center gap-2 mt-1.5">
                                {[...Array(parseInt(app.rounds || 1))].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all shadow-sm ${
                                      (app.current_round || 0) > i 
                                        ? "bg-emerald-500 text-white" 
                                        : (app.current_round || 0) === i 
                                          ? "bg-amber-400 text-white ring-2 ring-amber-400/30 animate-pulse" 
                                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                                    }`}
                                  >
                                    {i + 1}
                                  </div>
                                ))}
                                <p className="text-[11px] font-bold ml-2 text-gray-500 dark:text-gray-400">
                                  {(app.current_round || 0) >= app.rounds ? "Final Stage" : `Round ${app.current_round || 0} of ${app.rounds || 1}`}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {app.ats_score && (
                            <div className="mt-4 max-w-sm">
                              <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Resume Match Score</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">{app.ats_score}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden border border-gray-300 dark:border-gray-600">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${app.ats_score}%` }} />
                              </div>
                              
                              {app.ats_explanation && (
                                <div className="mt-4 p-3.5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl relative overflow-hidden group">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Match Analysis
                                  </p>
                                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">"{app.ats_explanation}"</p>
                                </div>
                              )}

                              {app.ats_suggestions && (
                                <div className="mt-3 p-3.5 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-950 rounded-xl relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Improvement Path
                                  </p>
                                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-medium">
                                    {app.ats_suggestions}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex md:flex-col items-center justify-between border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                           <span className={`px-4 py-1.5 border rounded-full text-sm font-bold uppercase tracking-wide ${getStatusColor(app.status)}`}>
                             {app.status}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profile Information
                </h2>
                {!editingProfile && (
                  <button onClick={() => setEditingProfile(true)} className="px-5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white font-medium flex items-center gap-2 rounded-xl transition-all active:scale-95 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Edit Profile
                  </button>
                )}
              </div>

              {editingProfile ? (
                 <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                      <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input type="email" value={profileForm.email} disabled className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 rounded-xl cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                      <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                      <input type="text" value={profileForm.location} onChange={(e) => setProfileForm({...profileForm, location: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                    <textarea value={profileForm.bio} onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all outline-none h-32 resize-none" placeholder="Tell companies about yourself..." />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Social Media & Portfolio Links</label>
                      <button 
                        type="button" 
                        onClick={() => setProfileForm({...profileForm, social_links: [...(profileForm.social_links || []), { platform: "", url: "" }]})}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        Add New Link
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(profileForm.social_links || []).map((link, index) => (
                        <div key={index} className="flex gap-2 items-center animate-fadeIn">
                          <input 
                            placeholder="Platform" 
                            value={link.platform} 
                            onChange={(e) => {
                              const newLinks = [...profileForm.social_links];
                              newLinks[index].platform = e.target.value;
                              setProfileForm({...profileForm, social_links: newLinks});
                            }}
                            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none" 
                          />
                          <input 
                            placeholder="URL" 
                            value={link.url} 
                            onChange={(e) => {
                              const newLinks = [...profileForm.social_links];
                              newLinks[index].url = e.target.value;
                              setProfileForm({...profileForm, social_links: newLinks});
                            }}
                            className="flex-[2] px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none" 
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              const newLinks = profileForm.social_links.filter((_, i) => i !== index);
                              setProfileForm({...profileForm, social_links: newLinks});
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transition-all active:scale-95 hover:shadow-blue-500/25">Save Changes</button>
                    <button type="button" onClick={() => setEditingProfile(false)} className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium rounded-xl transition-all active:scale-95">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Location</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.location || "—"}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="col-span-1 md:col-span-2">
                       <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Professional Bio</p>
                       <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">{user?.bio || "No bio added yet."}</p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Top Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {user?.skills ? user.skills.split(',').map((s, i) => (
                           <span key={i} className="px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold border border-purple-200 dark:border-purple-800/50">{s.trim()}</span>
                        )) : <p className="text-gray-500 italic">No skills listed</p>}
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Social Links</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(user?.social_links || []).length > 0 ? user.social_links.map((link, i) => (
                          <a 
                            key={i} 
                            href={link.url.startsWith('http') ? link.url : `https://${link.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-md transition-all group"
                          >
                            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-black text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {link.platform?.charAt(0)}
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{link.platform}</p>
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{link.url.replace(/^https?:\/\//i, '')}</p>
                            </div>
                          </a>
                        )) : <p className="text-gray-400 italic text-sm">No links added.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  Saved Jobs
                </h2>
                <button onClick={() => navigate("/jobs")} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-medium rounded-xl shadow-sm transition-colors text-sm">
                  Browse More Jobs
                </button>
              </div>

              {savedJobs.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Saved Jobs Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">Keep track of interesting roles by saving them while you browse.</p>
                  <button onClick={() => navigate("/jobs")} className="px-6 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 font-medium rounded-xl transition-all active:scale-95 shadow-sm hover:shadow-md">
                    Discover Opportunities
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {savedJobs.map((job) => (
                    <div key={job.id} className="relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{job.job_role}</h3>
                            {job.status === 'closed' && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800">Closed</span>
                            )}
                          </div>
                          <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">{job.company_name}</p>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 text-sm">{job.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                             <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
                               <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                               {job.required_skills}
                             </span>
                             <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium">
                               <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                               {job.rounds} Rounds
                             </span>
                          </div>
                        </div>
                        
                        <div className="flex md:flex-col justify-center gap-3 md:min-w-[140px] border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                          {job.status === 'open' ? (
                            <button onClick={() => navigate(`/apply/${job.id}`)} className="flex-1 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-center text-sm shadow-sm hover:shadow-md">
                              Apply Now
                            </button>
                          ) : (
                             <button disabled className="flex-1 w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-500 font-medium rounded-xl text-center text-sm cursor-not-allowed">
                               Closed
                             </button>
                          )}
                          <button onClick={() => unsaveJob(job.id)} className="flex-1 w-full px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-medium rounded-xl transition-colors text-center text-sm border border-transparent hover:border-rose-200 dark:hover:border-rose-800">
                            Unsave Job
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
