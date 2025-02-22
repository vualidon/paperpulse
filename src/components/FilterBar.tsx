import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
  isDarkMode: boolean;
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  selectedTags,
  setSelectedTags,
  availableTags,
  isDarkMode,
}: FilterBarProps) {
  return (
    <div className={`${
      isDarkMode
        ? 'bg-black/30 backdrop-blur-lg border-white/10'
        : 'bg-white border-gray-200'
    } rounded-2xl border p-6 mb-6 space-y-6 transition-colors duration-200`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-grow">
          <div className="relative">
            <MagnifyingGlassIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              isDarkMode ? 'text-white/50' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/50'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              } border focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
            />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="sm:w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl appearance-none transition-colors duration-200 ${
              isDarkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            } border focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="upvotes">Most Upvotes</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className={`h-4 w-4 ${
              isDarkMode ? 'text-white/70' : 'text-gray-500'
            }`} />
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-white/70' : 'text-gray-700'
            }`}>
              Filter by tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter((t) => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : isDarkMode
                      ? 'bg-white/5 text-white/70 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}