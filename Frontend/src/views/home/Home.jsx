import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios
      .get('https://ai-jlvm.onrender.com/projects/get-all')
      .then(response => {
        setProjects(response.data.data);
      })
      .catch(err => console.error('Error fetching projects:', err));
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#0d9488] text-white px-4 py-10 ">
      <section className="max-w-6xl mx-auto ">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10"
        >
          <h1 className="text-4xl sm:text-7xl font-bold tracking-wide "> CoDevAI</h1>
          <button
            onClick={() => navigate('/create-project')}
            className="bg-gradient-to-r from-emerald-400 hover:from-emerald-500 hover:to-lime-500 text-black font-bold px-8 py-6 rounded-3xl border-white border-1 shadow-md transition-all duration-300"
          >
            + New Project
          </button>
        </motion.div>

        {projects.length === 0 ? (
          <motion.div
            className="text-center text-lg sm:text-xl mt-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No projects found. Start by creating one!
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-16 mt-5 ml-4 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {projects.map(project => (
              <motion.div
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="cursor-pointer bg-white/10 hover:bg-white/20 p-5 rounded-xl shadow-lg backdrop-blur-md border border-white/20 transition-all duration-300 p-5"
              >
                <h2 className="text-xl font-semibold text-white mb-1 ">{project.name}</h2>
                <p className="text-sm text-gray-300">Click to view or edit this project.</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
};

export default Home;
