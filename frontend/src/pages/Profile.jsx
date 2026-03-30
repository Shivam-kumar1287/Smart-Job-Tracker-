import { useState, useEffect } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", location: "", bio: "", skills: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data);
      setFormData({
        name: res.data.name || "", email: res.data.email || "",
        phone: res.data.phone || "", location: res.data.location || "",
        bio: res.data.bio || "", skills: res.data.skills || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/profile", formData);
      setUser({ ...user, ...formData });
      setEditing(false);
    } catch (error) {
      alert("Error updating profile");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium flex items-center gap-2 rounded-xl shadow-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - ID Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 z-0"></div>
              
              <div className="relative z-10">
                <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center p-1 shadow-lg">
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                     <span className="text-4xl font-black bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
                       {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                     </span>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name || "User"}</h2>
                <div className="flex justify-center mb-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${user.role === "hr" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400" : "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400"}`}>
                    {user.role || "USER"}
                  </span>
                </div>
                
                <div className="space-y-3 mt-6 text-left">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {user.email || "No email"}
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {user.phone}
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {user.location}
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm pt-4 border-t border-gray-100 dark:border-gray-800">
                      Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
               <button onClick={() => navigate("/jobs")} className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300 font-semibold rounded-xl transition-colors">Browse Jobs</button>
               {user.role === "user" && <button onClick={() => navigate("/user-dashboard")} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-colors">My Dashboard</button>}
               {user.role === "hr" && <button onClick={() => navigate("/hr-dashboard")} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-colors">HR Dashboard</button>}
            </div>
          </div>

          {/* Right Column - Details/Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 animate-fadeInUp">
              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Edit Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input type="email" value={formData.email} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 rounded-xl cursor-not-allowed" disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                      <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Professional Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none" placeholder="Tell us about your experience..." />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Skills</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g., Python, React, Machine Learning" />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">Save Profile</button>
                    <button type="button" onClick={() => setEditing(false)} className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl transition-colors">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About</h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        {user.bio || <span className="text-gray-400 italic">No bio added yet. Click 'Edit Profile' to introduce yourself.</span>}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2.5 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 min-h-[100px]">
                       {user.skills ? user.skills.split(',').map((skill, index) => (
                         <span key={index} className="px-4 py-2 bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl text-sm font-bold shadow-sm">
                           {skill.trim()}
                         </span>
                       )) : (
                         <span className="text-gray-400 italic flex items-center h-full">No skills listed.</span>
                       )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
