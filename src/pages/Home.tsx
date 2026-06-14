import { useState, useEffect } from 'react';
import type { Provider } from '@/types';
import { useProviderStore } from '@/store/useProviderStore';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ProviderList } from '@/components/ProviderList';
import { ProviderForm } from '@/components/ProviderForm';
import { ReviewForm } from '@/components/ReviewForm';
import { DetailModal } from '@/components/DetailModal';

export default function Home() {
  const { init } = useProviderStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<Provider | null>(null);
  const [reviewProvider, setReviewProvider] = useState<Provider | null>(null);
  const [detailProvider, setDetailProvider] = useState<Provider | null>(null);

  useEffect(() => {
    init();
  }, [init]);

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

  return (
    <div className="min-h-screen">
      <Header onAddClick={handleAddClick} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterBar />
        <ProviderList
          onViewDetail={handleViewDetail}
          onEdit={handleEditClick}
          onAddReview={handleReviewClick}
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
      />
    </div>
  );
}
