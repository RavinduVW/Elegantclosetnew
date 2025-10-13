"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  HomeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50 to-white" />

      <div className="absolute top-20 left-20 w-32 h-32 rounded-full blur-xl animate-pulse bg-gradient-to-r from-purple-300/20 to-purple-400/20" />
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full blur-xl animate-pulse delay-1000 bg-gradient-to-r from-purple-400/20 to-purple-500/20" />
      <div className="absolute top-1/2 left-10 w-24 h-24 rounded-full blur-xl animate-pulse delay-500 bg-gradient-to-r from-purple-200/20 to-purple-300/20" />

      <div className="z-10 text-center max-w-4xl mx-auto">
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-0 blur-3xl opacity-30">
            <div className="text-[12rem] md:text-[16rem] font-bold text-purple-500">
              404
            </div>
          </div>

          <div className="relative backdrop-blur-md rounded-3xl p-8 bg-transparent">
            <motion.h1
              className="text-[8rem] md:text-[12rem] font-bold leading-none text-purple-600"
              animate={{
              textShadow: [
                "0 0 20px rgba(168, 85, 247, 0.5)",
                "0 0 40px rgba(168, 85, 247, 0.3)",
                "0 0 20px rgba(168, 85, 247, 0.5)",
              ],
              }}
              transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              }}
            >
              404
            </motion.h1>
          </div>
        </motion.div>

        <motion.div
          className="backdrop-blur-md rounded-2xl p-6 mb-8 bg-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-black">
            Page Not Found
          </h2>
          <p className="text-base md:text-lg text-gray-700">
            The page you're looking for doesn't exist or has been moved to another location.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="px-8 py-4 rounded-xl flex items-center justify-center space-x-3 font-semibold text-white
                shadow-lg hover:shadow-xl transition-all duration-300 min-w-[180px] 
                bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 rounded-xl flex items-center justify-center space-x-3 font-semibold
                shadow-lg hover:shadow-xl transition-all duration-300 min-w-[180px] 
                bg-white hover:bg-gray-50 text-black border border-purple-300"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <p className="text-sm text-gray-600">
            If you think this is a mistake, please contact support or try refreshing the page.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
