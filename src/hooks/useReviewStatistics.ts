import { useQuery } from '@tanstack/react-query';
import { usePublishedReviews } from './useReviews';

export const useReviewStatistics = (itemType: 'package' | 'destination', itemId: string) => {
  const { data: reviews = [], isLoading } = usePublishedReviews(itemType, itemId);

  return useQuery({
    queryKey: ['review-statistics', itemType, itemId, reviews.length],
    queryFn: () => {
      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      const ratingDistribution = reviews.reduce((dist, review) => {
        dist[review.rating as keyof typeof dist] = (dist[review.rating as keyof typeof dist] || 0) + 1;
        return dist;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution
      };
    },
    enabled: !isLoading
  });
};