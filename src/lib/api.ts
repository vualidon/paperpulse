import axios from 'axios';
import { PaperResponse } from '../types/paper';

const api = axios.create({
  baseURL: 'https://huggingface.co/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchPapers(): Promise<PaperResponse> {
  try {
    const response = await api.get('/daily_papers');
    
    const papers = response.data.map((item: any) => {
      const paper = item.paper;
      return {
        id: paper.id,
        title: paper.title,
        authors: paper.authors.map((author: any) => ({
          name: author.name,
          id: author._id,
          user: author.user ? {
            avatarUrl: author.user.avatarUrl,
            fullname: author.user.fullname,
            user: author.user.user,
          } : undefined,
        })),
        abstract: paper.summary,
        publicationDate: paper.publishedAt,
        source: 'arXiv',
        websiteUrl: `https://arxiv.org/abs/${paper.id}`,
        thumbnail: item.thumbnail,
        tags: paper.tags || [],
        isRead: false,
        isSaved: false,
        upvotes: paper.upvotes || 0,
      };
    });

    return {
      papers,
      total: papers.length,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch papers. Please try again later.');
    }
    throw error;
  }
}