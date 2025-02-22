import { format, formatDistanceToNow } from 'date-fns';
import { Paper } from '../types/paper';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface PaperCardProps {
  paper: Paper;
  isDarkMode: boolean;
  onSelect: (paper: Paper) => void;
}

export default function PaperCard({ paper, isDarkMode, onSelect }: PaperCardProps) {
  const formattedDate = new Date(paper.publicationDate);
  const isRecent = new Date().getTime() - formattedDate.getTime() < 7 * 24 * 60 * 60 * 1000;
  
  const displayDate = isRecent
    ? formatDistanceToNow(formattedDate, { addSuffix: true })
    : format(formattedDate, 'MMM d, yyyy');

  const truncateAuthors = (authors: Paper['authors']) => {
    if (authors.length <= 3) return authors.map(a => a.user?.fullname || a.name).join(', ');
    return `${authors.slice(0, 3).map(a => a.user?.fullname || a.name).join(', ')} et al.`;
  };

  return (
    <div 
      onClick={() => onSelect(paper)}
      className={`
        rounded-2xl p-6 transition-all cursor-pointer ${
          isDarkMode
            ? 'bg-black/30 backdrop-blur-lg border-white/10 hover:border-pink-500/50'
            : 'bg-white border-gray-200 hover:border-purple-500/50'
        } border ${paper.isRead ? 'opacity-75' : ''}
      `}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            {paper.isRead && (
              <CheckCircleIcon className="h-5 w-5 text-green-500" title="Read" />
            )}
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-white/50' : 'text-gray-500'
            }`}>
              {paper.source} • {displayDate}
            </span>
          </div>
          
          <h2 className={`text-xl font-semibold mb-3 group ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <span className="inline-flex items-center gap-1">
              {paper.title}
              <ArrowTopRightOnSquareIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </h2>

          <p className={`text-sm mb-3 ${
            isDarkMode ? 'text-white/70' : 'text-gray-600'
          }`}>
            {truncateAuthors(paper.authors)}
          </p>
        </div>

        <div className="flex items-start gap-3">
          <div className={`text-sm font-medium flex items-center gap-1 ${
            isDarkMode ? 'text-white/50' : 'text-gray-500'
          }`}>
            <span>{paper.upvotes}</span>
            <span className="text-xs">upvotes</span>
          </div>
          <button 
            className={`p-1.5 rounded-full transition-colors ${
              paper.isSaved
                ? isDarkMode ? 'text-pink-500' : 'text-purple-500'
                : isDarkMode ? 'text-white/40 hover:bg-white/5' : 'text-gray-400 hover:bg-gray-100'
            }`}
            aria-label={paper.isSaved ? "Remove from bookmarks" : "Add to bookmarks"}
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement bookmark toggle
            }}
          >
            {paper.isSaved ? (
              <BookmarkSolid className="h-5 w-5" />
            ) : (
              <BookmarkOutline className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {paper.thumbnail && (
        <div className="mb-4 mt-3">
          <img 
            src={paper.thumbnail} 
            alt={paper.title}
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>
      )}

      <p className={`mb-4 line-clamp-2 text-sm ${
        isDarkMode ? 'text-white/70' : 'text-gray-700'
      }`}>
        {paper.abstract}
      </p>

      <div className="flex flex-wrap gap-2">
        {paper.tags.map(tag => (
          <span 
            key={tag}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 text-white/70 hover:bg-white/10'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement tag filtering
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}