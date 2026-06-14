import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Provider, ServiceRecord } from '@/types';
import { useProviderStore } from '@/store/useProviderStore';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ProviderList } from '@/components/ProviderList';
import { ProviderForm } from '@/components/ProviderForm';
import { ReviewForm } from '@/components/ReviewForm';
import { DetailModal } from '@/components/DetailModal';
import { ServiceRecordForm } from '@/components/ServiceRecordForm';
import { EmergencyDialButton } from '@/components/EmergencyDialButton';

export default function Home() {
  const { init, providers, searchQuery } = useProviderStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isServiceRecordOpen, setIsServiceRecordOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<Provider | null>(null);
  const [reviewProvider, setReviewProvider] = useState<Provider | null>(null);
  const [detailProvider, setDetailProvider] = useState<Provider | null>(null);
  const [serviceRecordProvider, setServiceRecordProvider] = useState<Provider | null>(null);
  const [editServiceRecord, setEditServiceRecord] = useState<ServiceRecord | null>(null);

  useEffect(() => {
    init();
  }, [init]);

  const emergencyContacts = useMemo(() => {
    let list = providers.filter((p) => p.emergency?.isEmergency);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(query) || p.phone.includes(query)
      );
    }
    return list;
  }, [providers, searchQuery]);

  const handleAddClick = () => {
    setEditProvider(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (provider: Provider) => {
    setEditProvider(provider);
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleReviewClick = (provider: Provider) => {
    setReviewProvider(provider);
    setIsReviewOpen(true);
    setIsDetailOpen(false);
  };

  const handleViewDetail = (provider: Provider) => {
    setDetailProvider(provider);
    setIsDetailOpen(true);
  };

  const handleAddServiceRecord = (provider: Provider) => {
    setServiceRecordProvider(provider);
    setEditServiceRecord(null);
    setIsServiceRecordOpen(true);
    setIsDetailOpen(false);
  };

  const handleEditServiceRecord = (record: ServiceRecord) => {
    const provider = useProviderStore.getState().providers.find((p) => p.id === record.providerId);
    if (provider) {
      setServiceRecordProvider(provider);
      setEditServiceRecord(record);
      setIsServiceRecordOpen(true);
      setIsDetailOpen(false);
    }
  };

  const handleServiceRecordClick = (provider: Provider) => {
    setServiceRecordProvider(provider);
    setEditServiceRecord(null);
    setIsServiceRecordOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header onAddClick={handleAddClick} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {emergencyContacts.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                紧急联系
              </h2>
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                {emergencyContacts.length}位
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyContacts.map((provider, index) => (
                <EmergencyDialButton key={provider.id} provider={provider} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        <FilterBar />
        <ProviderList
          onViewDetail={handleViewDetail}
          onEdit={handleEditClick}
          onAddReview={handleReviewClick}
          onAddServiceRecord={handleServiceRecordClick}
        />
      </main>

      <ProviderForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditProvider(null);
        }}
        editProvider={editProvider}
      />

      <ReviewForm
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setReviewProvider(null);
        }}
        provider={reviewProvider}
      />

      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailProvider(null);
        }}
        provider={detailProvider}
        onEdit={handleEditClick}
        onAddReview={handleReviewClick}
        onAddServiceRecord={handleAddServiceRecord}
        onEditServiceRecord={handleEditServiceRecord}
      />

      <ServiceRecordForm
        isOpen={isServiceRecordOpen}
        onClose={() => {
          setIsServiceRecordOpen(false);
          setServiceRecordProvider(null);
          setEditServiceRecord(null);
        }}
        provider={serviceRecordProvider}
        editRecord={editServiceRecord}
      />
    </div>
  );
}
