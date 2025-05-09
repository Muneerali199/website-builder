import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { Home as HomeIcon, File, Settings, LayoutDashboard, Zap, Plus, History, DollarSign, User } from 'lucide-react';

type UserMetadata = {
  tier: 'free' | 'pro' | 'enterprise';
  remainingTokens: number;
};

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [usage, setUsage] = useState<UserMetadata>({ 
    tier: 'free', 
    remainingTokens: 3 
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    const loadUsage = async () => {
      if (isSignedIn && user) {
        const metadata = user.unsafeMetadata as UserMetadata;
        setUsage({
          tier: metadata.tier || 'free',
          remainingTokens: metadata.remainingTokens || 3
        });
      } else {
        const localUsage = localStorage.getItem('usage');
        if (localUsage) setUsage(JSON.parse(localUsage));
      }
    };
    
    loadUsage();
  }, [isSignedIn, user]);

  const recommendations = [
    'Design a futuristic portfolio for my digital art',
    'Create an online store for sustainable fashion',
    'Build a tech blog with interactive demos',
    'Make a vibrant landing page for my app'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      alert('Please sign in to submit prompts');
      return;
    }

    if (usage.remainingTokens <= 0 && usage.tier === 'free') {
      alert('You\'ve reached your free limit. Please upgrade to continue.');
      navigate('/pricing');
      return;
    }

    if (prompt.trim()) {
      const newUsage = {
        ...usage,
        remainingTokens: usage.remainingTokens - 1
      };

      setUsage(newUsage);
      
      if (user) {
        await user.update({ unsafeMetadata: newUsage });
      } else {
        localStorage.setItem('usage', JSON.stringify(newUsage));
      }

      navigate('/builder', { state: { prompt } });
      setPrompt('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log('Uploaded file:', file);
  };

  return (
    <div className={`min-h-screen bg-black flex flex-col items-center justify-start p-10 relative overflow-hidden font-sans transition-all duration-300 ${
      isSignedIn ? 'ml-16' : ''
    }`}>
      {/* Sidebar */}
      <SignedIn>
        <motion.div
          className={`fixed left-0 top-0 h-screen bg-gray-900/50 backdrop-blur-lg border-r border-gray-700/30 z-50 ${
            isSidebarExpanded ? 'w-64' : 'w-16'
          } transition-all duration-300`}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
          <div className="flex flex-col p-4 space-y-2 h-full">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6 p-2">
              <Zap className="text-cyan-400 h-6 w-6" />
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-2">
              <motion.button 
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 text-gray-300 hover:text-cyan-400 w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <HomeIcon className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Home</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 text-gray-300 hover:text-cyan-400 w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Dashboard</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/projects')}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 text-gray-300 hover:text-cyan-400 w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <File className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Projects</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/history')}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 text-gray-300 hover:text-cyan-400 w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <History className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">History</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/pricing')}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 text-gray-300 hover:text-cyan-400 w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <DollarSign className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Pricing</span>}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full mt-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 p-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                {isSidebarExpanded && <span className="text-sm">New Project</span>}
              </motion.button>
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 text-gray-300 hover:text-cyan-400 w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-5 h-5",
                      userButtonPopoverCard: "bg-gray-900 border border-gray-700/30 backdrop-blur-lg",
                      userPreviewMainIdentifier: "text-cyan-400",
                      userButtonPopoverActionButtonText: "text-gray-100 hover:text-cyan-400"
                    }
                  }}
                />
                {isSidebarExpanded && <span className="text-sm">Profile</span>}
              </motion.div>

              <motion.button
                onClick={() => navigate('/settings')}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 text-gray-300 hover:text-cyan-400 w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Settings</span>}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </SignedIn>

      {/* Usage Indicator */}
      <SignedIn>
        <div className="absolute top-4 right-4 z-50">
          <motion.div 
            className="bg-gray-900/50 backdrop-blur-lg px-4 py-2 rounded-full text-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {usage.tier === 'free' ? (
              <span className="text-cyan-400">
                Free Tokens: {usage.remainingTokens}/3
              </span>
            ) : (
              <span className="text-purple-400">
                ⚡ Premium Access (Unlimited)
              </span>
            )}
          </motion.div>
        </div>
      </SignedIn>

      {/* Navbar (Only for signed-out users) */}
      <SignedOut>
        <nav className="w-full max-w-4xl mb-10 relative z-20">
          <div className="flex justify-between items-center">
            <motion.button 
              onClick={() => navigate('/pricing')}
              className="text-gray-300 hover:text-cyan-400 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Pricing
            </motion.button>
            
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="text-gray-300 hover:text-cyan-400 font-medium px-4 py-2 transition-colors duration-200"
                >
                  Sign In
                </motion.button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-full transition-all duration-200 shadow-lg shadow-cyan-500/30 hover:shadow-purple-500/40"
                >
                  Sign Up
                </motion.button>
              </SignUpButton>
            </div>
          </div>
        </nav>
      </SignedOut>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20 animate-aurora-bg opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-700/10 via-purple-700/10 to-pink-700/10 animate-aurora-bg-delayed opacity-50" />
      </div>

      {/* Content Section */}
      <div className="max-w-4xl w-full space-y-14 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center space-y-7"
        >
          <motion.h1
            className="text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tighter"
            animate={{ backgroundPosition: '200%' }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            style={{ backgroundSize: '200%' }}
          >
            Arcane Construct
          </motion.h1>
          <motion.p
            className="text-gray-100 text-xl font-light max-w-xl mx-auto tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Ignite your vision and craft stunning websites with a spark of brilliance.
          </motion.p>
        </motion.div>

        {/* Input Section */}
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <div className="relative">
              <div className="bg-gray-900/15 backdrop-blur-2xl border border-gray-700/30 rounded-3xl p-4 shadow-2xl shadow-cyan-500/15">
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.2, rotate: 15, boxShadow: '0 0 25px rgba(34, 211, 238, 0.7)' }}
                  whileTap={{ scale: 0.85 }}
                  className="absolute bottom-5 left-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-full p-4 shadow-lg shadow-cyan-500/60 hover:shadow-cyan-500/80 transition-all duration-500"
                >
                  <Plus className="h-6 w-6" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".jpg,.png,.pdf,.doc,.md"
                  />
                </motion.button>

                <motion.textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A modern SaaS website with animations and 3D assets"
                  rows={6}
                  className="w-full p-6 px-16 bg-transparent text-white rounded-xl border-none placeholder-gray-200/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/70 transition-all duration-500 text-lg resize-none"
                  whileFocus={{ scale: 1.03, boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
                />

                {prompt.trim() && (
                  <motion.button
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(34, 211, 238, 0.7)' }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-8 right-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg px-8 py-3 text-sm font-semibold shadow-lg shadow-purple-500/60 hover:shadow-purple-500/80 transition-all duration-500 animate-pulse-glow"
                  >
                    Generate →
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </SignedIn>

        <SignedOut>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="bg-gray-900/20 backdrop-blur-lg border border-cyan-500/30 rounded-3xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Join to Unleash Creativity
            </h2>
            <p className="text-gray-300 mb-6">Sign up to start generating amazing website designs</p>
            <div className="flex justify-center gap-4">
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-cyan-500/30 hover:shadow-purple-500/40 transition-all"
                >
                  Get Started Free
                </motion.button>
              </SignUpButton>
            </div>
          </motion.div>
        </SignedOut>

        {/* Recommendations Section */}
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="flex flex-wrap gap-5 justify-center"
          >
            {recommendations.map((rec, index) => (
              <motion.button
                key={index}
                onClick={() => setPrompt(rec)}
                whileHover={{ scale: 1.15, y: -5, boxShadow: '0 0 20px rgba(192, 38, 211, 0.5)' }}
                whileTap={{ scale: 0.9 }}
                className="bg-gray-900/20 backdrop-blur-lg hover:bg-gray-800/40 border border-gray-600/30 text-gray-50 hover:text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-purple-500/40"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * index + 0.7, duration: 0.6 }}
              >
                {rec}
              </motion.button>
            ))}
          </motion.div>
        </SignedIn>

        {/* Upgrade Banner */}
        {usage.tier === 'free' && usage.remainingTokens <= 1 && (
          <motion.div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl mt-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-white font-bold text-lg mb-2">
              ⚡ Upgrade for Unlimited Access
            </h3>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-opacity-90 transition-all"
            >
              Upgrade Now
            </button>
          </motion.div>
        )}
      </div>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes aurora {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-aurora-bg {
            background-size: 200% 200%;
            animation: aurora 10s ease infinite;
          }
          .animate-aurora-bg-delayed {
            background-size: 200% 200%;
            animation: aurora 14s ease infinite 2s;
          }

          @keyframes particles {
            0% { transform: translateY(0) scale(1); opacity: 0.7; }
            50% { transform: translateY(-30px) scale(1.3); opacity: 0.3; }
            100% { transform: translateY(0) scale(1); opacity: 0.7; }
          }
          .animate-particles {
            animation: particles 7s ease-in-out infinite;
          }
          .animate-particles-delayed {
            animation: particles 7s ease-in-out infinite 3s;
          }

          @keyframes pulse-glow {
            0% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
            50% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.7); }
            100% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}