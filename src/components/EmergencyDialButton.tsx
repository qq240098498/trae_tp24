import { Phone, Clock, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Provider } from '@/types';

interface EmergencyDialButtonProps {
  provider: Provider;
  index: number;
}

export const EmergencyDialButton = ({ provider, index }: EmergencyDialButtonProps) => {
  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500"
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient 3s ease infinite',
        }}
      />
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
      `}</style>

      <div
        className="relative p-5 rounded-2xl cursor-pointer text-white shadow-lg"
        onClick={() => window.open(`tel:${provider.phone}`)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="absolute inset-0 bg-white/30 rounded-full"
                style={{
                  animation: 'pulse-ring 2s ease-in-out infinite',
                }}
              />
              <div
                className="relative p-3 bg-white/20 backdrop-blur rounded-full"
                style={{
                  animation: 'shake 0.5s ease-in-out infinite',
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <Phone size={28} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                  {provider.name}
                </h3>
                {provider.emergency?.is24Hours && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/80 text-yellow-900 text-xs font-bold rounded-full">
                    <Clock size={12} />
                    24小时
                  </span>
                )}
              </div>
              <p className="text-white/90 font-mono text-sm">{provider.phone}</p>
              {provider.emergency?.emergencyNote && (
                <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
                  <ShieldAlert size={12} />
                  {provider.emergency.emergencyNote}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <motion.div
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl font-bold"
              whileHover={{ scale: 1.05 }}
            >
              一键拨打
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
