import axios from 'axios';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post('https://ai-jlvm.onrender.com/projects/create', {
        projectName,
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  }

  return (
    <main className="h-screen flex items-center justify-evenly gap-6 bg-gradient-to-br from-[#0f172a] to-[#134e4a] px-4 py-8">
      <motion.section
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="h-1/3 lg:w-1/3  flex flex-col gap-8 justify-center items-center p-8 rounded-2xl bg-white/10 border border-white/20 shadow-xl backdrop-blur-md"
      >
        <h2 className="text-4xl font-bold text-white text-center mb-6 ">Create a New Project</h2>

        <form
          onSubmit={handleSubmit}
          className=" flex flex-col gap-8 justify-between items-center "
        >
          <input
            type="text"
            name="projectName"
            placeholder="Enter project name"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            required
            className="w-full  px-8 py-6 text-2xl rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-50 backdrop-blur-sm"
          />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-1/2 py-3 text-lg  font-bold bg-gradient-to-r border-1 border-black text-white to-emerald-400 text-black rounded-xl shadow-md hover:to-emerald-500 transition-all"
          >
            Create Project
          </motion.button>
        </form>
      </motion.section>
    </main>
  );
};

export default CreateProject;
