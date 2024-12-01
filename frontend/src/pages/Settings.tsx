
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="p-8 bg-[#0D0D1F]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-black/40 backdrop-blur-2xl border border-white/10">
              <h2 className="text-xl text-white mb-4">Account Settings</h2>
              <p className="text-gray-400">Settings page content coming soon...</p>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;