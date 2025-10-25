import { useState } from 'react';
import { Star } from 'lucide-react';
import { useCreateRating } from '@/hooks/useRatingsClient';

interface RatingFormProps {
  bookingId: string;
  partnerName: string;
  onSuccess?: () => void;
}

export default function RatingForm({ bookingId, partnerName, onSuccess }: RatingFormProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const createRatingMutation = useCreateRating();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createRatingMutation.mutate(
      {
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Notez votre expérience avec {partnerName}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Partagez votre avis pour aider d'autres clients
        </p>
      </div>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Note *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-lg font-semibold text-gray-900">{rating}/5</span>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaire (optionnel)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Partagez votre expérience..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/500 caractères</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={createRatingMutation.isPending}
        className="w-full bg-flotteq-blue text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {createRatingMutation.isPending ? 'Envoi en cours...' : 'Envoyer mon avis'}
      </button>
    </form>
  );
}
