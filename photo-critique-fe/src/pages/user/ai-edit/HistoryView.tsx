import { useState, useEffect } from "react";
import { ArrowDownIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, ImageCarousel, Loading, Modal } from "../../../components";
import { imageGenerationHistoryService, type ImageGenerationHistoryResponse } from "../../../services";
import { showToast, formatTimeAgo } from "../../../utils";
import { ToastType } from "../../../components";

interface HistoryViewProps {
  onReEdit: (history: ImageGenerationHistoryResponse) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onReEdit }) => {
  const [history, setHistory] = useState<ImageGenerationHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await imageGenerationHistoryService.getMyHistory(0, 10);
      const items = response.content || [];
      setHistory(items);
      setCurrentPage(0);
      setHasMore(!response.last && response.number < response.totalPages - 1);
    } catch {
      showToast(ToastType.ERROR, "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreHistory = async () => {
    if (!hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await imageGenerationHistoryService.getMyHistory(nextPage, 10);
      const items = response.content || [];
      setHistory((prev) => [...prev, ...items]);
      setCurrentPage(nextPage);
      setHasMore(!response.last && response.number < response.totalPages - 1);
    } catch {
      showToast(ToastType.ERROR, "Failed to load more history");
    } finally {
      setIsLoadingMore(false);
    }
  };


  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await imageGenerationHistoryService.delete(itemToDelete);
      setHistory(history.filter((item) => item.id !== itemToDelete));
      showToast(ToastType.SUCCESS, "History deleted successfully", undefined, 2000);
    } catch {
      showToast(ToastType.ERROR, "Failed to delete history", undefined, 2000);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const formatTime = (dateString: string): string => {
    try {
      return formatTimeAgo(dateString);
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading variant="inline" text="Loading history..." />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="text-lg mb-2">No history yet</p>
        <p className="text-sm">Start generating images to see your history here</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative w-full aspect-[4/3] flex-shrink-0">
                  <ImageCarousel
                    images={[item.outImageUrl]}
                    initialIndex={0}
                    showPreview={true}
                    fitMode="cover"
                    className="w-full rounded-3xl"
                  />
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1 min-h-0">
                  {/* Title and Time */}
                  <div className="flex items-start justify-between mb-2 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                      {item.prompt.substring(0, 50)}
                      {item.prompt.length > 50 ? "..." : ""}
                    </h3>
                    <span className="text-sm text-gray-500 ml-4 flex-shrink-0">
                      {formatTime(item.createdAt)}
                    </span>
                  </div>

                  {/* Description - Flexible height */}
                  <p className="text-sm text-gray-600 mb-4 font-light line-clamp-3 flex-1 min-h-0">
                    {item.prompt}
                  </p>

                  {/* Actions - Fixed at bottom */}
                  <div className="flex gap-2 mt-auto flex-shrink-0">
                    <Button
                      variant="primary"
                      size="medium"
                      onClick={() => onReEdit(item)}
                      leftIcon={PencilSquareIcon}
                      className="flex-1 text-sm rounded-xl"
                    >
                      Re-edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="medium"
                      onClick={() => handleDeleteClick(item.id)}
                      leftIcon={TrashIcon}
                      className="bg-gray-200 hover:bg-red-100 hover:text-red-700 p-3 rounded-xl flex-shrink-0"
                    >
                    </Button>
                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* View More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              {isLoadingMore ? (
                <Loading variant="inline" text="Loading..." />
              ) : (
                <Button
                  variant="ghost"
                  size="medium"
                  onClick={loadMoreHistory}
                  disabled={isLoadingMore}
                  leftIcon={ArrowDownIcon}
                  className="text-sm hover:text-[#15B8A6]" 
                >
                  View More History
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title="Delete History?"
        message="Are you sure you want to delete this generation history? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </>
  );
};

