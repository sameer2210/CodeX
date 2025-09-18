import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Code2,
  MessageSquare,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const Landing = () => {
  const { isDarkMode } = useAppSelector(state => state.ui);
  const navigate = useNavigate();

  const features = [
    {
      icon: Code2,
      title: 'Professional Code Editor',
      description:
        'Industry-standard Monaco Editor with syntax highlighting and auto-completion for multiple languages.',
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description:
        'Live code synchronization, instant updates, and project rooms for seamless team work.',
    },
    {
      icon: Video,
      title: 'Video Call Integration',
      description:
        'Real-time video communication within projects for better team coordination and discussions.',
    },
    {
      icon: Bot,
      title: 'AI-Powered Code Review',
      description:
        'Intelligent analysis using Google Gemini AI, suggesting improvements and best practices.',
    },
    {
      icon: MessageSquare,
      title: 'Team Communication',
      description: 'Live chat with message history and user presence indicators.',
    },
    {
      icon: Shield,
      title: 'Secure Development',
      description: 'Enterprise-grade security with CORS, input validation, secure API.',
    },
    {
      icon: Rocket,
      title: 'Rapid Project Creation',
      description: 'Quick setup and deployment with integrated tools and AI assistance.',
    },
    {
      icon: Zap,
      title: 'Real-time Capabilities',
      description: 'Efficient WebSocket communication for instantfeatures.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '50K+', label: 'Projects Created' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white' : 'bg-gradient-to-br from-gray-100 via-gray-300 to-gray-200 text-gray-900'}`}
    >
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="max-w-7xl mx-auto text-center">
          {/* Floating particles animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-500/30' : 'bg-blue-400/100'}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            {/* Badge */}
            <div
              className={`inline-flex items-center space-x-2 backdrop-blur-sm border rounded-full px-4 py-2 mb-6 ${isDarkMode ? 'bg-white/10 border-white/20 text-gray-300' : 'bg-gray-100/80 border-gray-200/50 text-gray-700'}`}
            >
              <Sparkles
                className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`}
              />
              <span className="text-sm font-medium">Collaborative AI-Powered Code Editor</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Build Together with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                CodeX
              </span>
            </h1>

            <p
              className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Real-time collaborative code editor with AI-powered review, live chat, video calls,
              and intelligent code analysis using Google's Gemini AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <motion.button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                onClick={() => navigate('/login')}
                className={`backdrop-blur-sm hover:bg-opacity-20 border hover:border-opacity-30 font-semibold px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${isDarkMode ? 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 text-white' : 'bg-gray-100/80 border-gray-200/50 hover:bg-gray-200/80 hover:border-gray-300/50 text-gray-900'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className={`px-4 py-16 border-y ${isDarkMode ? 'border-white/10' : 'border-gray-200/50'}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div
                  className={`text-3xl md:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {stat.value}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2
              className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Why Choose CodeX?
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Experience the future of collaborative coding with powerful features designed for
              modern development teams.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div
                  className={`backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-gray-50/80 border-gray-200/50 hover:bg-gray-100/80 hover:border-gray-300/50'}`}
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3
                    className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className={`px-4 py-20 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/80'}`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2
              className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Getting Started with CodeX
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Simple steps to set up your team and start collaborating.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <div
              className={`backdrop-blur-sm border rounded-2xl p-8 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/95 border-gray-200/50'}`}
            >
              <h3
                className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                For Team Admins
              </h3>
              <ol className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">1.</span>
                  Navigate to the Register page.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">2.</span>
                  Create a unique team name, your username, and a secure password.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">3.</span>
                  Share the team name and password with your team members.
                </li>
              </ol>
            </div>

            <div
              className={`backdrop-blur-sm border rounded-2xl p-8 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/95 border-gray-200/50'}`}
            >
              <h3
                className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                For Team Members
              </h3>
              <ol className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">1.</span>
                  Go to the Register page.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">2.</span>
                  Use the team name and password provided by your admin.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">3.</span>
                  Create your own unique username.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">4.</span>
                  Log in and start collaborating on projects.
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Once logged in, create projects, invite team members, and use features like real-time
              editing, chat, video calls, and AI reviews.
            </p>
            <motion.button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Create Your Team Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`backdrop-blur-sm border rounded-3xl p-12 ${isDarkMode ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-white/10' : 'bg-gradient-to-r from-blue-100/20 to-purple-100/20 border-gray-200/50'}`}
          >
            <div className="flex items-center justify-center mb-6">
              <Zap
                className={`w-8 h-8 mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}
              />
              <h2
                className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Ready to Transform Your Coding Workflow?
              </h2>
            </div>
            <p
              className={`text-xl mb-8 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Join developers worldwide who are building faster and smarter with CodeX. Start your
              collaborative journey today!
            </p>
            <motion.button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Try CodeX for Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`px-4 py-8 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200/50'}`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            © 2025 CodeX. Built with for developers worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
