import React, { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { SkeletonLoader } from "../components/SkeletonLoader";
import { ERROR_MESSAGES } from "../constants";

interface ContentPageProps {
  title: string;
  fetchData: () => Promise<any>;
  renderContent: (data: any) => React.ReactNode;
  skeletonType?: "text" | "card" | "image";
}

const ContentPage: React.FC<ContentPageProps> = ({ 
  title, 
  fetchData, 
  renderContent,
  skeletonType = "text"
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchData();
      setData(response);
    } catch (err) {
      console.error("ContentPage error:", err);
      setError(ERROR_MESSAGES.LOAD_FAILED);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRetry = () => {
    loadData();
  };

  return (
    <div className="pb-12 min-h-screen bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6">
            <span className="section-label">Information</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-text font-display uppercase tracking-tight">{title}</h1>
          </div>

          {loading ? (
            <SkeletonLoader count={3} type={skeletonType} />
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2">Error Loading Content</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  aria-label="Retry loading content"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : data && (!Array.isArray(data) || data.length > 0) ? (
            <div className="min-h-[400px]">{renderContent(data)}</div>
          ) : (
            <div className="py-24 text-center text-brand-muted font-bold uppercase tracking-widest">
              No content available at this time.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ContentPage;
