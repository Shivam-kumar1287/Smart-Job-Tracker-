import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Logo from "../components/Logo";

export default function Features() {
  const navigate = useNavigate();

  const featureGroups = [
    {
      title: "🏢 HR (Employer) Features",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      color: "from-purple-500 to-pink-500",
      features: [
        { name: "Job Management Dashboard", desc: "Create, edit, and delete job openings with detailed descriptions and interview rounds." },
        { name: "Applicant Tracking Pipeline", desc: "Manage candidates, search by name/role, and perform one-click Approve/Reject actions." },
        { name: "AI Resume Evaluation", desc: "Review AI-generated ATS (CRI) Match Scores for instant candidate-job fit analysis." },
        { name: "Automatic Notifications", desc: "Candidates receive automated email updates when application status changes." },
        { name: "Performance Analytics", desc: "Track total applications, active postings, and recruitment acceptance rates." }
      ]
    },
    {
      title: "👤 Job Seeker Features",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      color: "from-blue-500 to-indigo-500",
      features: [
        { name: "Centralized Job Portal", desc: "Explore opportunities across companies with advanced filters for title, company, or skills." },
        { name: "Guided Application Process", desc: "Easy resume upload (PDF/DOCX) with personalized cover letters for every role." },
        { name: "Status Tracking Dashboard", desc: "Real-time visibility into Pending, Accepted, or Rejected application statuses." },
        { name: "ATS Pre-Check", desc: "Self-evaluate alignment with job requirements through AI-powered CRI Match Scores." },
        { name: "Smart Job Saving", desc: "Bookmark and organize potential jobs for future review and application." }
      ]
    },
    {
      title: "🛠️ Technical Core",
      icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
      color: "from-emerald-500 to-teal-500",
      features: [
        { name: "Groq AI Integration", desc: "State-of-the-art resume parsing and criteria-matching engine." },
        { name: "Role-Based Security", desc: "JWT-protected routes ensuring privacy and clear role separation." },
        { name: "Glassmorphism UI", desc: "Premium, semi-transparent modern aesthetic with smooth micro-animations." },
        { name: "Responsive Design", desc: "Optimized experience across all screen sizes from mobile to desktop." },
        { name: "Real-time Connectivity", desc: "Asynchronous updates and immediate feedback on all user actions." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-purple-500/30">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative pt-20 pb-12 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600 rounded-full blur-[160px] animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[160px] animate-pulse-slow object-delay"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-sm font-semibold mb-6 animate-fadeIn">
            <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-3 animate-ping"></span>
            Application Overview
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 animate-slideInUp">
            Smart Job Tracker <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Complete Feature Overview
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fadeIn delay-200">
            A comprehensive list of features available in the platform, including our recently 
            implemented Role-Based Access Control (RBAC) and AI-driven ATS functionality.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureGroups.map((group, groupIdx) => (
            <div 
              key={groupIdx} 
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 animate-fadeInUp"
              style={{ animationDelay: `${groupIdx * 150}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${group.color} flex items-center justify-center mb-8 shadow-lg shadow-purple-500/10 group-hover:scale-110 transition-transform`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={group.icon} />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold mb-6 text-white">{group.title}</h2>
              
              <div className="space-y-6">
                {group.features.map((feature, i) => (
                  <div key={i} className="relative pl-6">
                    <div className={`absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${group.color}`}></div>
                    <h4 className="font-bold text-gray-200 mb-1">{feature.name}</h4>
                    <p className="text-sm text-gray-500 line-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-[40px] p-12 border border-white/5 backdrop-blur-md animate-fadeIn">
          <h2 className="text-3xl font-bold mb-4">Ready to optimize your hiring?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join the Smart Job Tracker community today and experience the future of AI-driven recruitment.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button onClick={() => navigate("/register")} className="px-10 py-4 bg-white text-gray-950 font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-white/10">Get Started Free</button>
             <button onClick={() => navigate("/jobs")} className="px-10 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">Explore Jobs</button>
          </div>
        </div>
      </div>

    </div>
  );
}
