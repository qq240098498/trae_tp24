import { motion, AnimatePresence } from 'framer-motion';
import { Inbox } from 'lucide-react';
import type { Provider } from '@/types';
import { useProviderStore } from '@/store/useProviderStore';
import { ProviderCard } from './ProviderCard';

interface ProviderListProps {
  onViewDetail: (provider: Provider) => void;
  onEdit: (provider: Provider) => void;
  onAddReview: (provider: Provider) => void;
}

export const ProviderList = ({ onViewDetail, onEdit, onAddReview }: ProviderListProps) => {
  const { getFilteredProviders } = useProviderStore();
  const providers = getFilteredProviders();

  if (providers.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 bg-gray-100 rounded-full mb-4">
          <Inbox className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无服务商</h3>
        <p className="text-gray-500 max-w-md">
          还没有添加任何维修服务商。点击右上角"添加服务商"按钮开始记录吧！
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {providers.map((provider, index) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onViewDetail={onViewDetail}
            onEdit={onEdit}
            onAddReview={onAddReview}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
