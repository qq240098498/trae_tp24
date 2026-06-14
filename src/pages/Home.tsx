import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Provider, ServiceRecord } from '@/types';
import { useProviderStore } from '@/store/useProviderStore';
import { usePriceStore } from '@/store/usePriceStore';
import { Header, ViewMode } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ProviderList } from '@/components/ProviderList';
import { ProviderForm } from '@/components/ProviderForm';
import { ReviewForm } from '@/components/ReviewForm';
import { DetailModal } from '@/components/DetailModal';
import { ServiceRecordForm } from '@/components/ServiceRecordForm';
import { EmergencyDialButton } from '@/components/EmergencyDialButton';
import { PriceFilterBar } from '@/components/PriceFilterBar';
import { PriceReferenceList } from '@/components/PriceReferenceList';
import { PriceReferenceForm } from '@/components/PriceReferenceForm';
import { PriceTip } from '@/components/PriceTip';

export default function Home() {
  const { init, providers, searchQuery } = useProviderStore();
  const { init: initPriceStore } = usePriceStore();
  const [viewMode, setViewMode] = useState<ViewMode>('providers');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isServiceRecordOpen, setIsServiceRecordOpen] = useState(false);
  const [isPriceFormOpen, setIsPriceFormOpen] = useState(false);

  const [editProvider, setEditProvider] = useState<Provider | null>(null);
  const [reviewProvider, setReviewProvider] = useState<Provider | null>(null);
  const [detailProvider, setDetailProvider] = useState<Provider | null>(null);
  const [serviceRecordProvider, setServiceRecordProvider] = useState<Provider | null>(null);
  const [editServiceRecord, setEditServiceRecord] = useState<ServiceRecord | null>(null);

  useEffect(() => {
    init();
    initPriceStore();
  }, [init, initPriceStore]);

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

  const handleAddPriceClick = () => {
    setIsPriceFormOpen(true);
  };

  const handleViewPriceReferences = () => {
    setViewMode('prices');
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
      <Header
        onAddClick={handleAddClick}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddPriceClick={handleAddPriceClick}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {viewMode === 'providers' ? (
            <motion.div
              key="providers"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
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

              {providers.length > 0 && (
                <div className="mb-6">
                  {providers
                    .flatMap((p) => p.serviceTypes)
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .slice(0, 2)
                    .map((serviceType) => (
                      <div key={serviceType} className="mb-3">
                        <PriceTip
                          serviceType={serviceType}
                          onViewAll={handleViewPriceReferences}
                        />
                      </div>
                    ))}
                </div>
              )}

              <FilterBar />
              <ProviderList
                onViewDetail={handleViewDetail}
                onEdit={handleEditClick}
                onAddReview={handleReviewClick}
                onAddServiceRecord={handleServiceRecordClick}
              />
            </motion.div>
          ) : (
            <motion.div
              key="prices"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="mb-6 p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border border-emerald-100"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[280px]">
                    <h2
                      className="text-lg font-bold text-gray-900 mb-2"
                      style={{ fontFamily: '"Noto Serif SC", serif' }}
                    >
                      📊 维修价格参考库
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      收录常见维修项目的市场合理价格范围，避免被漫天要价。
                      价格数据来自用户匿名众包共享，每次消费后可以参与验证价格真实性。
                      高于或低于合理范围时请谨慎选择，建议货比三家。
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-emerald-600">
                        {usePriceStore.getState().priceReferences.length}
                      </div>
                      <div className="text-xs text-gray-500">条价格参考</div>
                    </div>
                    <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">
                        {usePriceStore.getState().priceReferences.filter((p) => p.source === 'community').length}
                      </div>
                      <div className="text-xs text-gray-500">条众包共享</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <PriceFilterBar />
              <PriceReferenceList />
            </motion.div>
          )}
        </AnimatePresence>
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
        onViewPriceReferences={handleViewPriceReferences}
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

      <PriceReferenceForm
        isOpen={isPriceFormOpen}
        onClose={() => {
          setIsPriceFormOpen(false);
        }}
      />
    </div>
  );
}
