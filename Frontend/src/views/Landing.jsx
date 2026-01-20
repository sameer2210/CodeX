import { motion, useScroll, useTransform } from 'framer-motion';
import { Code2, Github, Shield, Terminal, Twitter, Users, Zap } from 'lucide-react';
const EASE = [0.22, 1, 0.36, 1];

const HUDLabel = ({ children, className = '' }) => (
  <span className={`text-[10px] uppercase tracking-[0.2em] font-mono opacity-50 ${className}`}>
    {children}
  </span>
);

const GlassCard = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: EASE }}
    whileHover={{ y: -8, transition: { duration: 0.4, ease: EASE } }}
    className={`relative overflow-hidden rounded-[24px] border border-white/5 bg-[#10120F]/40 backdrop-blur-2xl p-8 group ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(23,225,255,0.05),transparent_70%)]" />
    {children}
  </motion.div>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden">
      {/* HUD Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#17E1FF]/10 rounded-full blur-[160px] opacity-40" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          // Fix: Transition corrected by using typed EASE constant to avoid line 162 error
          transition={{ duration: 0.8, ease: EASE }}
          className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-10"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#17E1FF] animate-pulse" />
          <HUDLabel>System version 2.5.0_stable</HUDLabel>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.2em' }}
          animate={{ opacity: 1, letterSpacing: '-0.04em' }}
          // Fix: Transition corrected by using typed EASE constant to avoid line 172 error
          transition={{ duration: 1.5, ease: EASE }}
          className="text-6xl md:text-[140px] font-black leading-[0.85] uppercase mb-10"
        >
          Build <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            Together
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-12"
        >
          High-performance collaborative engineering. Powered by Gemini AI for real-time reviews and
          aerospace-grade sync.
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="px-12 py-5 bg-[#17E1FF] text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(23,225,255,0.3)]">
            Initialize Session
          </button>
          <div className="flex items-center gap-4 text-white/30 font-mono text-xs uppercase tracking-[0.2em]">
            <span>Latency: 14ms</span>
            <div className="w-px h-6 bg-white/10" />
            <span>Encrypted: AES-256</span>
          </div>
        </div>
      </motion.div>

      {/* Floating IDE UI */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        // Fix: Transition corrected by using typed EASE constant to avoid line 204 error
        transition={{ delay: 0.8, duration: 1.2, ease: EASE }}
        className="mt-20 w-full max-w-6xl px-4 relative"
      >
        <div className="rounded-t-3xl border-x border-t border-white/10 bg-black/40 backdrop-blur-xl p-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
          </div>
          <HUDLabel className="opacity-20 text-[8px]">CORE_WORKFLOW_V2.JS</HUDLabel>
          <div className="w-10" />
        </div>
        <div className="aspect-video bg-[#0B0E11] border-x border-b border-white/10 rounded-b-3xl overflow-hidden relative group">
          <div className="absolute inset-0 p-10 font-mono text-sm opacity-40 group-hover:opacity-100 transition-opacity duration-700">
            <div className="text-[#17E1FF]">async function</div> analyzeCode(bundle) {'{'}
            <div className="ml-4 text-white/60 mt-1">
              const review = await gemini.review(bundle);
            </div>
            <div className="ml-4 text-[#FFB020] mt-1">if (review.hasOptimizations) {'{'}</div>
            <div className="ml-8 text-white/60">return review.apply(bundle);</div>
            <div className="ml-4">{'}'}</div>
            {'}'}
          </div>
          {/* Glass Overlay Module */}
          <div className="absolute right-8 top-12 bottom-12 w-1/3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col gap-6">
            <HUDLabel>Real-time Analysis</HUDLabel>
            <div className="space-y-4">
              {[85, 42, 91].map((val, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono opacity-40">
                    <span>MODULE_{i + 1}</span>
                    <span>{val}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 2, delay: 1 + i * 0.2 }}
                      className="h-full bg-[#17E1FF]"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 text-[10px] text-[#17E1FF] font-black uppercase">
                <Zap className="w-3 h-3" />
                Optimization Pending
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const BentoGrid = () => {
  return (
    <section className="py-32 px-8 max-w-[1440px] mx-auto">
      <div className="mb-20">
        <HUDLabel className="text-[#17E1FF] mb-4 block">Engineered for Scale</HUDLabel>
        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
          Unified Workspace.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <GlassCard className="md:col-span-8 md:row-span-2">
          <div className="h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-[#17E1FF]/10 flex items-center justify-center text-[#17E1FF]">
                <Users className="w-8 h-8" />
              </div>
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-4 border-[#10120F] bg-zinc-800 flex items-center justify-center text-[10px] font-bold"
                  >
                    U{i}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-black uppercase mb-4 tracking-tighter">
                Global Sync Engine
              </h3>
              <p className="text-white/40 max-w-md font-light">
                Our proprietary operational transformation layer ensures conflict-free editing
                across continents with sub-50ms latency.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="md:col-span-4 border-[#FFB020]/20">
          <Zap className="w-8 h-8 text-[#FFB020] mb-6" />
          <h3 className="text-xl font-black uppercase mb-2 tracking-tight">Gemini 2.5 Pro</h3>
          <p className="text-sm text-white/30 font-light italic">
            Automated refactoring and deep logical analysis integrated into your commit flow.
          </p>
        </GlassCard>

        <GlassCard className="md:col-span-4 bg-black/60">
          <Terminal className="w-8 h-8 text-green-500/50 mb-6" />
          <div className="font-mono text-[10px] text-green-500/40">
            $ codex deploy --prod <br />
            [INFO] Analyzing bundle... <br />
            [OK] Build verified.
          </div>
        </GlassCard>

        <GlassCard className="md:col-span-12 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">
              Enterprise Shielding
            </h3>
            <p className="text-white/40 font-light">
              End-to-end encryption for every keystroke. Your source code never leaves your private
              cloud instance.
            </p>
          </div>
          <Shield className="w-24 h-24 text-white/5 opacity-40 shrink-0" />
        </GlassCard>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const stats = [
    { label: 'Latency', value: '14ms' },
    { label: 'Availability', value: '99.9%' },
    { label: 'Security', value: 'A+' },
    { label: 'Users', value: '850K+' },
  ];

  return (
    <div className="border-y border-white/5 bg-black/20 py-16">
      <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-2">
            <HUDLabel>{stat.label}</HUDLabel>
            <div className="text-4xl md:text-6xl font-black uppercase font-mono tracking-tighter">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProcessSection = () => {
  const steps = [
    {
      id: '01',
      title: 'Initialize',
      desc: 'Sync your repositories via secure SSH tunneling in seconds.',
    },
    {
      id: '02',
      title: 'Collaborate',
      desc: 'Invite your team and begin zero-latency pair programming.',
    },
    {
      id: '03',
      title: 'Optimize',
      desc: 'Run Gemini AI reviews to scan for performance bottlenecks.',
    },
    {
      id: '04',
      title: 'Deploy',
      desc: 'Push verified, high-quality code to production effortlessly.',
    },
  ];

  return (
    <section className="py-40 px-8 max-w-[1440px] mx-auto">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter mb-4">
          The Workflow.
        </h2>
        <HUDLabel>Precision from Start to Finish</HUDLabel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/5 border border-white/5">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            whileHover={{ backgroundColor: 'rgba(23,225,255,0.02)' }}
            className="bg-[#0B0E11] p-12 group transition-colors duration-500"
          >
            <div className="text-[#17E1FF] font-mono text-xs mb-10 opacity-30 group-hover:opacity-100 transition-opacity">
              STEP_{step.id} —
            </div>
            <h3 className="text-2xl font-black uppercase mb-6 tracking-tight group-hover:text-[#17E1FF] transition-colors">
              {step.title}
            </h3>
            <p className="text-white/30 text-sm font-light leading-relaxed group-hover:text-white/60 transition-colors">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="pt-32 pb-12 px-8 border-t border-white/5 bg-[#0B0E11]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-[#17E1FF] rounded-lg flex items-center justify-center">
                <Code2 className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-bold uppercase tracking-tight">CodeX</span>
            </div>
            <p className="text-white/30 text-sm max-w-sm font-light leading-relaxed mb-10">
              The high-fidelity workspace for distributed engineering teams. Built with speed and
              security at its core.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center hover:border-[#17E1FF] transition-all">
                <Github className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center hover:border-[#17E1FF] transition-all">
                <Twitter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <HUDLabel className="mb-8 block">PLATFORM</HUDLabel>
            <ul className="space-y-4 text-sm text-white/40 font-light">
              <li className="hover:text-[#17E1FF] cursor-pointer transition-colors">Workspace</li>
              <li className="hover:text-[#17E1FF] cursor-pointer transition-colors">AI Analysis</li>
              <li className="hover:text-[#17E1FF] cursor-pointer transition-colors">
                Security Core
              </li>
              <li className="hover:text-[#17E1FF] cursor-pointer transition-colors">Changelog</li>
            </ul>
          </div>

          <div>
            <HUDLabel className="mb-8 block">RESOURCES</HUDLabel>
            <ul className="space-y-4 text-sm text-white/40 font-light">
              <li className="hover:text-[#17E1FF] cursor-pointer transition-colors">Docs</li>
              <li className="hover:text-[#17E1FF] cursor-pointer transition-colors">
                API References
              </li>
              <li className="hover:text-[#17E1FF] cursor-pointer transition-colors">Community</li>
              <li className="hover:text-[#17E1FF] cursor-pointer transition-colors">Support</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
          <HUDLabel className="opacity-20">© 2025 CODEX AEROSPACE. ALL RIGHTS RESERVED.</HUDLabel>
          <div className="flex gap-10">
            <HUDLabel className="hover:opacity-100 cursor-pointer transition-opacity">
              Privacy
            </HUDLabel>
            <HUDLabel className="hover:opacity-100 cursor-pointer transition-opacity">
              Terms
            </HUDLabel>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main View ---

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0B0E11] dark:text-[#E6E8E5] font-['Inter',_sans-serif] selection:bg-[#17E1FF] selection:text-black">
      {/* Noise Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999]"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />
      <main>
        <Hero />
        <StatsSection />
        <BentoGrid />

        {/* Kinetic Typography Break */}
        <section className="py-60 px-8 text-center overflow-hidden">
          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.05 }}
            // Fix: Transition corrected by using typed EASE constant to avoid line 456 error
            transition={{ duration: 1.5, ease: EASE }}
            className="text-[12vw] font-black uppercase tracking-[-0.05em] leading-[0.7] whitespace-nowrap select-none"
          >
            AI REVIEW
          </motion.h2>
        </section>

        <ProcessSection />

        {/* Cinematic CTA */}
        <section className="py-60 px-8 relative overflow-hidden bg-gradient-to-t from-[#17E1FF]/10 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <HUDLabel className="mb-8 block">Ready for Acceleration?</HUDLabel>
            <h2 className="text-5xl md:text-[100px] font-black uppercase tracking-tighter leading-[0.9] mb-16">
              Empower <br /> Your Team.
            </h2>
            <button className="px-16 py-7 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-[#17E1FF] transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_80px_rgba(255,255,255,0.2)]">
              Launch Free Instance
            </button>
          </div>

          {/* Subtle light beams */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[300px] bg-[#17E1FF]/20 blur-[120px] rounded-full translate-y-1/2" />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;

// import { useEffect } from 'react';
// import { useTheme } from '../context/ThemeContext';
// import { notify } from '../lib/notify';

// const Landing = () => {
//   const { isDarkMode, toggleTheme } = useTheme();

//   useEffect(() => {
//     notify('Welcome to CodeX', 'success');
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-6
//                     bg-white text-black dark:bg-black dark:text-white transition-colors">

//       <h1 className="text-4xl font-bold">Basic Landing Page</h1>

//       <p>Theme is currently: <b>{isDarkMode ? 'Dark' : 'Light'}</b></p>

//       <button
//         onClick={toggleTheme}
//         className="px-6 py-3 rounded bg-black text-white dark:bg-white dark:text-black"
//       >
//         Toggle Theme
//       </button>
//     </div>
//   );
// };

// export default Landing;
