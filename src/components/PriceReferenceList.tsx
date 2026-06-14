import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, AlertTriangle } from 'lucide-react';
import type { PriceReference } from '@/types';
import { usePriceStore } from '@/store/usePriceStore';
import { PriceReferenceCard } from './PriceReferenceCard';
import { PriceReferenceForm } from './PriceReferenceForm';

interface PriceReferenceListProps {
  onViewDetail?: (priceRef: PriceReference) => void;
}

export const PriceReferenceList = ({ onViewDetail }: PriceReferenceListProps) => {
  const { getFilteredPriceReferences, deletePriceReference, priceReferences } = usePriceStore();
  const [editPriceRef, setEditPriceRef] = useState<PriceReference | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredPrices = getFilteredPriceReferences();

  const handleEdit = (priceRef: PriceReference) => {
    setEditPriceRef(priceRef);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条价格参考吗？')) {
      deletePriceReference(id);
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditPriceRef(null);
  };

  if (filteredPrices.length === 0) {
    return (
      <>
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 bg-gray-100 rounded-full mb-4">
            <Inbox className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无价格参考</h3>
          <p className="text-gray-500 max-w-md">
            {priceReferences.length === 0
              ? '还没有任何价格参考数据。点击"添加价格"按钮开始记录常见维修项目的市场价吧！'
              : '当前筛选条件下没有匹配的价格参考，试试调整筛选条件或搜索关键词。'}
          </p>
        </motion.div>
        <PriceReferenceForm isOpen={isFormOpen} onClose={handleClose} editPriceRef={editPriceRef} />
      </>
    );
  }

  return (
    <>
      {filteredPrices.some((p) => p.unhelpfulCount > p.helpfulCount * 0.5 && p.helpfulCount + p.unhelpfulCount >= 5) && (
        <motion.div
          className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            提示：部分价格参考的差评比例较高，建议多方核实后参考。黄色进度条低于50%的条目请谨慎参考。
          </p>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPrices.map((priceRef, index) => (
            <PriceReferenceCard
              key={priceRef.id}
              priceRef={priceRef}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </div>
      <PriceReferenceForm isOpen={isFormOpen} onClose={handleClose} editPriceRef={editPriceRef} />
    </>
  );
};
