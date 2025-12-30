// components/manufacturers/ReviewsSection.tsx
import { Star, User, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface ReviewsSectionProps {
  manufacturerId: string;
}

export default async function ReviewsSection({
  manufacturerId,
}: ReviewsSectionProps) {
  // This would fetch from your database
  const reviews = [
    {
      id: "1",
      brandName: "Tech Innovations Inc.",
      rating: 5,
      comment:
        "Excellent quality and communication. Delivered on time with perfect specifications.",
      date: new Date("2024-01-15"),
      brief: "Custom PCB Manufacturing",
    },
    {
      id: "2",
      brandName: "Green Energy Solutions",
      rating: 4,
      comment:
        "Good manufacturer with competitive pricing. Minor delays but good communication.",
      date: new Date("2024-02-20"),
      brief: "Solar Panel Components",
    },
    {
      id: "3",
      brandName: "Auto Parts Direct",
      rating: 5,
      comment:
        "Exceptional attention to detail. Will definitely work with again.",
      date: new Date("2024-03-05"),
      brief: "Automotive Metal Parts",
    },
  ];

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviews & Ratings
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(avgRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-gray-900">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-gray-500">({reviews.length} reviews)</span>
          </div>
        </div>

        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Write a Review
        </button>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="pb-6 border-b last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {review.brandName}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{format(review.date, "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm mb-2">
                {review.brief}
              </span>
            </div>

            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Be the first to review this manufacturer
          </p>
        </div>
      )}
    </div>
  );
}
