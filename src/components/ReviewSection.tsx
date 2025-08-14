import { usePublishedReviews } from '@/hooks/useReviews';
import { useReviewStatistics } from '@/hooks/useReviewStatistics';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, PlusCircle } from 'lucide-react';
import { Review } from '@/types/database';
import { Link } from 'react-router-dom';
import { ReviewCard } from '@/components/ui/ReviewCard';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewSectionProps {
  itemType: 'package' | 'destination';
  itemId: string;
}


const ReviewSection = ({ itemType, itemId }: ReviewSectionProps) => {
  const { data: reviews = [], isLoading } = usePublishedReviews(itemType, itemId);
  const { data: statistics } = useReviewStatistics(itemType, itemId);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Reviews</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold flex items-center space-x-2">
            <span>Customer Reviews</span>
            <Badge variant="secondary" className="text-sm">
              {statistics?.totalReviews || 0}
            </Badge>
          </h3>
          {statistics && statistics.totalReviews > 0 && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(statistics.averageRating) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-800">
                  {statistics.averageRating}
                </span>
                <span className="text-sm text-gray-600">
                  ({statistics.totalReviews} review{statistics.totalReviews !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
          )}
        </div>
        <Button asChild variant="default" size="lg" className="whitespace-nowrap">
          <Link to={`/add-review?itemType=${itemType}&itemId=${itemId}`}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Share Your Experience
          </Link>
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Reviews Yet</h4>
            <p className="text-gray-500">Be the first to share your experience!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              userProfileImage={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;