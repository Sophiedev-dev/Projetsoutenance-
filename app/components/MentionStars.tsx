import React from 'react';
import { Star } from 'lucide-react';

interface MentionStarsProps {
  mention: 'Passable' | 'Bien' | 'Tres Bien' | 'Excellent' | null;
  size?: 'sm' | 'md' | 'lg';
}

export const MentionStars: React.FC<MentionStarsProps> = ({ mention, size = 'md' }) => {
  const stars: Record<'Passable' | 'Bien' | 'Tres Bien' | 'Excellent', number> = {
    Passable: 1,
    Bien: 2,
    'Tres Bien': 3,
    Excellent: 4,
  };

  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const starCount = mention ? stars[mention] || 0 : 0;

  return (
    <div className="flex items-center gap-1">
      {[...Array(starCount)].map((_, index) => (
        <Star
          key={index}
          className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`}
        />
      ))}
      {mention && (
        <span className="ml-2 text-sm text-gray-600">
          {mention}
        </span>
      )}
    </div>
  );
};
