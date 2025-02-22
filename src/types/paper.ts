export interface Author {
  name: string;
  id?: string;
  user?: {
    avatarUrl?: string;
    fullname?: string;
    user?: string;
  };
}

export interface Paper {
  id: string;
  title: string;
  authors: Author[];
  abstract: string;
  publicationDate: string;
  source: string;
  pdfUrl?: string;
  websiteUrl?: string;
  thumbnail?: string;
  tags: string[];
  isRead: boolean;
  isSaved: boolean;
  upvotes: number;
}

export interface PaperResponse {
  papers: Paper[];
  total: number;
}