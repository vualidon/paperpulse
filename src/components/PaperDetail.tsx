import { useState } from 'react';
import { Dialog, Tab } from '@headlessui/react';
import { format } from 'date-fns';
import { Paper } from '../types/paper';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { XMarkIcon, ChatBubbleLeftRightIcon, DocumentIcon, GlobeAltIcon, DocumentTextIcon as AbstractIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import Discussion from './Discussion';
import { generateObsidianNote } from '../lib/ai';

interface PaperDetailProps {
  paper: Paper;
  onClose: () => void;
  isDarkMode: boolean;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function getValidUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  try {
    new URL(url);
    return url;
  } catch {
    return fallback;
  }
}

export default function PaperDetail({ paper, onClose, isDarkMode }: PaperDetailProps) {
  const [noteContent, setNoteContent] = useState<string>('');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Ensure we have valid URLs with proper validation
  const paperUrl = getValidUrl(paper.websiteUrl, `https://arxiv.org/abs/${paper.id}`);
  const pdfUrl = getValidUrl(paper.pdfUrl, `https://arxiv.org/pdf/${paper.id}.pdf`);

  const generateNote = async () => {
    setIsGeneratingNote(true);
    setNoteError(null);
    try {
      let content = '';
      for await (const chunk of generateObsidianNote(paper)) {
        content += chunk;
        setNoteContent(content);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate note';
      setNoteError(message);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl ${
          isDarkMode
            ? 'bg-black/95 border border-white/10'
            : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-start gap-4">
              <div>
                <Dialog.Title className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {paper.title}
                </Dialog.Title>
                <div className={`mt-2 text-sm ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>
                  {paper.authors.map(author => author.user?.fullname || author.name).join(', ')}
                </div>
                <div className={`mt-1 text-sm ${
                  isDarkMode ? 'text-white/50' : 'text-gray-500'
                }`}>
                  Published: {format(new Date(paper.publicationDate), 'MMMM d, yyyy')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`p-2 rounded-full transition-colors ${
                    paper.isSaved
                      ? isDarkMode ? 'text-pink-500' : 'text-purple-500'
                      : isDarkMode ? 'text-white/40 hover:bg-white/10' : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {paper.isSaved ? (
                    <BookmarkSolid className="h-6 w-6" />
                  ) : (
                    <BookmarkOutline className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-colors ${
                    isDarkMode
                      ? 'text-white/70 hover:bg-white/10'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <Tab.Group>
            <Tab.List className="flex border-b border-white/10">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'flex items-center gap-2 px-6 py-3 text-sm font-medium focus:outline-none transition-colors',
                    selected
                      ? isDarkMode
                        ? 'text-pink-500 border-b-2 border-pink-500'
                        : 'text-purple-600 border-b-2 border-purple-600'
                      : isDarkMode
                        ? 'text-white/70 hover:text-white/90'
                        : 'text-gray-500 hover:text-gray-700'
                  )
                }
              >
                <AbstractIcon className="h-5 w-5" />
                Abstract
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'flex items-center gap-2 px-6 py-3 text-sm font-medium focus:outline-none transition-colors',
                    selected
                      ? isDarkMode
                        ? 'text-pink-500 border-b-2 border-pink-500'
                        : 'text-purple-600 border-b-2 border-purple-600'
                      : isDarkMode
                        ? 'text-white/70 hover:text-white/90'
                        : 'text-gray-500 hover:text-gray-700'
                  )
                }
              >
                <DocumentIcon className="h-5 w-5" />
                Full Paper
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'flex items-center gap-2 px-6 py-3 text-sm font-medium focus:outline-none transition-colors',
                    selected
                      ? isDarkMode
                        ? 'text-pink-500 border-b-2 border-pink-500'
                        : 'text-purple-600 border-b-2 border-purple-600'
                      : isDarkMode
                        ? 'text-white/70 hover:text-white/90'
                        : 'text-gray-500 hover:text-gray-700'
                  )
                }
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                Discussion
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'flex items-center gap-2 px-6 py-3 text-sm font-medium focus:outline-none transition-colors',
                    selected
                      ? isDarkMode
                        ? 'text-pink-500 border-b-2 border-pink-500'
                        : 'text-purple-600 border-b-2 border-purple-600'
                      : isDarkMode
                        ? 'text-white/70 hover:text-white/90'
                        : 'text-gray-500 hover:text-gray-700'
                  )
                }
              >
                <PencilSquareIcon className="h-5 w-5" />
                Notes
              </Tab>
            </Tab.List>

            <Tab.Panels className="overflow-auto max-h-[calc(90vh-200px)]">
              {/* Abstract Panel */}
              <Tab.Panel className="p-6 space-y-6">
                {paper.thumbnail && (
                  <div className="mb-6">
                    <img 
                      src={paper.thumbnail} 
                      alt={paper.title}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                )}

                <div className={`prose max-w-none ${
                  isDarkMode ? 'prose-invert' : ''
                }`}>
                  <ReactMarkdown>{paper.abstract}</ReactMarkdown>
                </div>

                <div>
                  <h3 className={`font-medium mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {paper.tags.map(tag => (
                      <span
                        key={tag}
                        className={`px-3 py-1.5 text-sm rounded-full font-medium ${
                          isDarkMode
                            ? 'bg-white/5 text-white/70'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Tab.Panel>

              {/* Full Paper Panel */}
              <Tab.Panel className="p-6">
                <div className={`flex flex-col items-center justify-center h-full space-y-8 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className={`text-center max-w-lg ${
                    isDarkMode ? 'text-white/70' : 'text-gray-600'
                  }`}>
                    <p className="mb-8">
                      Choose your preferred way to read the full paper:
                    </p>
                    <div className="flex flex-col gap-4">
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                          isDarkMode
                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        <DocumentIcon className="h-5 w-5" />
                        Download PDF
                      </a>
                      <a
                        href={paperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                          isDarkMode
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        <GlobeAltIcon className="h-5 w-5" />
                        View on {paper.source}
                      </a>
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* Discussion Panel */}
              <Tab.Panel>
                <Discussion paper={paper} isDarkMode={isDarkMode} />
              </Tab.Panel>

              {/* Notes Panel */}
              <Tab.Panel className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Obsidian Note
                    </h3>
                    <button
                      onClick={generateNote}
                      disabled={isGeneratingNote}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-pink-500 text-white hover:bg-pink-600 disabled:bg-pink-500/50'
                          : 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400'
                      }`}
                    >
                      {isGeneratingNote ? 'Generating...' : 'Generate Note'}
                    </button>
                  </div>

                  {noteError && (
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                    }`}>
                      {noteError}
                    </div>
                  )}

                  {(noteContent || isGeneratingNote) && (
                    <div className={`rounded-lg border ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`p-4 border-b ${
                        isDarkMode ? 'border-white/10' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            Preview
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(noteContent);
                            }}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              isDarkMode
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Copy to Clipboard
                          </button>
                        </div>
                      </div>
                      <div className={`p-4 font-mono text-sm whitespace-pre-wrap ${
                        isDarkMode ? 'text-white/90' : 'text-gray-800'
                      }`}>
                        {isGeneratingNote && !noteContent ? (
                          <div className="flex items-center justify-center py-8">
                            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                              isDarkMode ? 'border-pink-500' : 'border-purple-600'
                            }`} />
                          </div>
                        ) : (
                          <ReactMarkdown>{noteContent}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}