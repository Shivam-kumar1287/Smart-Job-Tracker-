import { useState, useEffect } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

export default function HRDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalJobs: 0, totalApplications: 0, 
    pendingApplications: 0, acceptedApplications: 0, 
    rejectedApplications: 0, activeJobs: 0
  });

  const [jobForm, setJobForm] = useState({
    company_name: "", job_role: "", description: "", required_skills: "", rounds: ""
  });
  const [jobSearch, setJobSearch] = useState("");
  const [appSearch, setAppSearch] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs/my");
      setJobs(res.data);
      calculateStats(res.data, applications);
    } catch (err) {}
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications/pending");
      setApplications(res.data);
      calculateStats(jobs, res.data);
    } catch (err) {}
  };

  const calculateStats = (jobsData, applicationsData) => {
    const s = {
      totalJobs: jobsData.length,
      totalApplications: applicationsData.length,
      pendingApplications: applicationsData.filter(app => app.status === 'pending').length,
      acceptedApplications: applicationsData.filter(app => app.status === 'accepted').length,
      rejectedApplications: applicationsData.filter(app => app.status === 'rejected').length,
      activeJobs: jobsData.length
    };
    setStats(s);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, jobForm);
      } else {
        await api.post("/jobs", jobForm);
      }
      setShowJobForm(false);
      setEditingJob(null);
      setJobForm({ company_name: "", job_role: "", description: "", required_skills: "", rounds: "" });
      fetchJobs();
    } catch (err) {
      alert("Error saving job");
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setJobForm(job);
    setShowJobForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (err) { }
    }
  };

  const handleApplicationAction = async (appId, action) => {
    try {
      await api.put(`/applications/${appId}/${action}`);
      fetchApplications();
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 animate-fadeIn">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">
              HR Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Manage your job postings and applicants efficiently.</p>
          </div>
          
          <div className="relative z-10 flex space-x-3">
            <button onClick={() => navigate("/profile")} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium rounded-xl transition-all">Profile</button>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/"); }} className="px-6 py-2.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 font-medium rounded-xl transition-all">Logout</button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 p-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 max-w-fit">
          {["overview", "jobs", "applications", "members"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20" 
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {tab === "jobs" ? `Manage Jobs (${jobs.length})` : tab === "applications" ? `Applicants (${applications.length})` : tab === "members" ? `Members (${applications.length})` : tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="animate-fadeInUp">
          
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: "Active Jobs Postings", val: stats.totalJobs, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", borderColor: "border-purple-200 dark:border-purple-800" },
                { label: "Total Applications", val: stats.totalApplications, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", borderColor: "border-emerald-200 dark:border-emerald-800" },
                { label: "Pending Reviews", val: stats.pendingApplications, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", borderColor: "border-amber-200 dark:border-amber-800" },
              ].map((stat, i) => (
                <div key={i} className={`bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border ${stat.borderColor} transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className={`text-5xl font-black ${stat.color}`}>{stat.val}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Job Listings</h2>
                <div className="flex w-full md:w-auto gap-3">
                  <div className="relative flex-1 md:w-64">
                    <input 
                      type="text" 
                      placeholder="Search jobs..." 
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  {!showJobForm && (
                    <button onClick={() => setShowJobForm(true)} className="px-5 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 font-bold rounded-xl transition-colors whitespace-nowrap">
                      + Create
                    </button>
                  )}
                </div>
              </div>

              {showJobForm && (
                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 animate-slideInUp">
                  <h3 className="text-xl font-bold mb-4">{editingJob ? "Edit Job Posting" : "Create New Job Posting"}</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Company Name" value={jobForm.company_name} onChange={(e) => setJobForm({...jobForm, company_name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                      <input type="text" placeholder="Job Title" value={jobForm.job_role} onChange={(e) => setJobForm({...jobForm, job_role: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                    </div>
                    <textarea placeholder="Job Description" value={jobForm.description} onChange={(e) => setJobForm({...jobForm, description: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Required Skills (comma separated)" value={jobForm.required_skills} onChange={(e) => setJobForm({...jobForm, required_skills: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                      <input type="text" placeholder="Interview Rounds (e.g., 3)" value={jobForm.rounds} onChange={(e) => setJobForm({...jobForm, rounds: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                    </div>
                    <div className="flex space-x-3 pt-2">
                       <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-transform active:scale-95">{editingJob ? "Update Job" : "Publish Job"}</button>
                       <button type="button" onClick={() => { setShowJobForm(false); setEditingJob(null); setJobForm({company_name: "", job_role: "", description: "", required_skills: "", rounds: ""}); }} className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {jobs.length === 0 && !showJobForm ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">No jobs posted yet. Create your first job posting!</div>
              ) : (
                <div className="grid gap-4">
                  {jobs.filter(j => 
                    j.job_role.toLowerCase().includes(jobSearch.toLowerCase()) || 
                    j.company_name.toLowerCase().includes(jobSearch.toLowerCase()) ||
                    j.required_skills.toLowerCase().includes(jobSearch.toLowerCase())
                  ).map((job) => (
                    <div key={job.id} className="p-5 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{job.job_role}</h3>
                          <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">{job.company_name}</p>
                          <div className="flex gap-2 text-sm text-gray-500">
                            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-700 dark:text-gray-300">Skills: {job.required_skills}</span>
                            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-700 dark:text-gray-300">{job.rounds} Rounds</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleEdit(job)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(job.id)} className="px-4 py-2 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "applications" && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Applicant Pipeline</h2>
                 <div className="relative w-full md:w-64">
                    <input 
                      type="text" 
                      placeholder="Search applicants..." 
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
               </div>
               
               {applications.length === 0 ? (
                 <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed rounded-xl border-gray-200 dark:border-gray-700">No applicants pending review at the moment.</div>
               ) : (
                 <div className="grid gap-6">
                   {applications.filter(a => 
                     a.user_name?.toLowerCase().includes(appSearch.toLowerCase()) || 
                     a.job_role?.toLowerCase().includes(appSearch.toLowerCase()) ||
                     a.user_email?.toLowerCase().includes(appSearch.toLowerCase())
                   ).map((app) => (
                     <div key={app.id} className="relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                       <div className="flex flex-col md:flex-row justify-between gap-6">
                         <div className="flex-1">
                           <div className="flex justify-between items-start">
                             <div>
                               <h3 className="text-xl font-bold text-gray-900 dark:text-white">{app.job_role}</h3>
                               <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">Applicant: {app.user_name} ({app.user_email})</p>
                             </div>
                             <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase rounded-full">Pending</span>
                           </div>
                           
                           <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mt-2">
                             <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cover Letter</p>
                             <p className="text-gray-700 dark:text-gray-300 italic">"{app.cover_letter}"</p>
                           </div>
                           
                           <div className={`mt-4 max-w-sm flex items-center justify-between px-4 py-2 rounded-lg border flex-1 ${
                                app.ats_score >= 75 ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" :
                                app.ats_score >= 50 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" :
                                "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800"
                           }`}>
                              <div className="flex flex-col">
                                <span className={`font-semibold text-sm ${
                                  app.ats_score >= 75 ? "text-emerald-800 dark:text-emerald-300" : 
                                  app.ats_score >= 50 ? "text-amber-800 dark:text-amber-300" : 
                                  "text-rose-800 dark:text-rose-300"
                                }`}>Resume CRI Score (Groq AI)</span>
                                <span className="text-xs text-gray-500">Criteria Match Evaluation</span>
                              </div>
                              <span className={`text-2xl font-black ${
                                app.ats_score >= 75 ? "text-emerald-600 dark:text-emerald-400" : 
                                app.ats_score >= 50 ? "text-amber-600 dark:text-amber-400" : 
                                "text-rose-600 dark:text-rose-400"
                              }`}>{app.ats_score || "0"}%</span>
                           </div>
                           
                           {app.resume_path && (
                             <div className="mt-3">
                               <a href={`http://localhost:5000/${app.resume_path.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                 <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                 View Applicant Resume
                               </a>
                             </div>
                           )}
                         </div>
                         <div className="flex md:flex-col justify-center gap-3 md:min-w-[140px] border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                           <button onClick={() => handleApplicationAction(app.id, "accept")} className="flex-1 w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors text-center">Approve</button>
                           <button onClick={() => handleApplicationAction(app.id, "reject")} className="flex-1 w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors text-center">Reject</button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === "members" && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">All Members</h2>
              
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Members Found</h3>
                  <p className="text-gray-500 dark:text-gray-500">No members have applied for jobs yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.filter(a => 
                    a.user_name?.toLowerCase().includes(appSearch.toLowerCase()) || 
                    a.job_role?.toLowerCase().includes(appSearch.toLowerCase()) ||
                    a.user_email?.toLowerCase().includes(appSearch.toLowerCase())
                  ).map((app) => (
                    <div key={app.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {app.name ? app.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{app.name || 'Unknown User'}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{app.email || 'No email'}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                Applied for: {app.job_role || 'Unknown Job'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                app.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                app.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              }`}>
                                Status: {app.status || 'pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ATS Score</p>
                            <span className={`text-2xl font-bold ${
                              app.ats_score >= 75 ? "text-emerald-600 dark:text-emerald-400" : 
                              app.ats_score >= 50 ? "text-amber-600 dark:text-amber-400" : 
                              "text-rose-600 dark:text-rose-400"
                            }`}>{app.ats_score || "0"}%</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApplicationAction(app.id, "accept")} 
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors text-sm"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleApplicationAction(app.id, "reject")} 
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors text-sm"
                            >
                              Reject
                            </button>
                          </div>
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
