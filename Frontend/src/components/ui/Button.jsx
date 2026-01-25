<motion.button
  type="submit"
  disabled={isLoading}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="group relative w-full md:w-56 h-16 flex items-center justify-center overflow-hidden rounded-full border border-white/20 hover:border-[#17E1FF] transition-colors"
>
  <motion.div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
  <span className="relative z-10 font-bold uppercase tracking-[0.2em] group-hover:text-black transition-colors duration-300">
    {isLoading ? 'Processing...' : 'Confirm Access'}
  </span>
  {!isLoading && (
    <ChevronRight
      size={18}
      className="relative z-10 ml-2 group-hover:text-black transition-colors"
    />
  )}
</motion.button>;
