import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPapers } from '../lib/api';
import { Paper } from '../types/paper';
import PaperCard from './PaperCard';
import FilterBar from './FilterBar';
import { ErrorBoundary } from 'react-error-boundary';
import PaperDetail from './PaperDetail';

interface PaperListProps {
  isDarkMode: boolean;
}

export default function PaperList({ isDarkMode }: PaperListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['papers'],
    queryFn: () => fetchPapers(),
  });

  const papers = data?.papers || [];

  // Extract unique tags from all papers
  const availableTags = React.useMemo(() => {
    const tags = new Set<string>();
    papers.forEach(paper => {
      paper.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [papers]);

  // Filter and sort papers
  const filteredAndSortedPapers = React.useMemo(() => {
    let filtered = papers;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        paper =>
          paper.title.toLowerCase().includes(query) ||
          paper.abstract.toLowerCase().includes(query) ||
          paper.authors.some(author => 
            (author.user?.fullname || author.name).toLowerCase().includes(query)
          )
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(paper =>
        selectedTags.every(tag => paper.tags.includes(tag))
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime();
        case 'date_desc':
          return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
        case 'upvotes':
          return b.upvotes - a.upvotes;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [papers, searchQuery, selectedTags, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          isDarkMode ? 'border-pink-500' : 'border-purple-500'
        }`} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`text-center p-4 ${
        isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
      } rounded-lg`}>
        <p className={isDarkMode ? 'text-red-400' : 'text-red-600'}>
          Error loading papers: {(error as Error).message}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className={`mt-2 px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          Retry
        </button>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="text-center p-4">
        <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
          No papers available.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className={`text-center p-4 ${
          isDarkMode ? 'text-red-400' : 'text-red-600'
        }`}>
          Something went wrong
        </div>
      }
    >
      <div className="space-y-6 p-4">
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={availableTags}
          isDarkMode={isDarkMode}
        />
        
        {filteredAndSortedPapers.length === 0 ? (
          <div className={`text-center p-8 ${
            isDarkMode ? 'bg-white/5' : 'bg-gray-50'
          } rounded-lg`}>
            <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
              No papers match your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredAndSortedPapers.map((paper: Paper) => (
              <PaperCard 
                key={paper.id} 
                paper={paper}
                isDarkMode={isDarkMode}
                onSelect={() => setSelectedPaper(paper)}
              />
            ))}
          </div>
        )}

        {selectedPaper && (
          <PaperDetail
            paper={selectedPaper}
            onClose={() => setSelectedPaper(null)}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}