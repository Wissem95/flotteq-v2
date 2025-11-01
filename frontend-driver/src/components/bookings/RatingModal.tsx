import { X } from 'lucide-react';
import RatingForm from '../ratings/RatingForm';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  partnerName: string;
}

export default function RatingModal({ isOpen, onClose, bookingId, partnerName }: RatingModalProps) {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Noter la prestation</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <RatingForm bookingId={bookingId} partnerName={partnerName} onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </>
  );
}
