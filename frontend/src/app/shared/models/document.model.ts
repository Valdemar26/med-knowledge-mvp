export interface Document {
  id: number;
  title: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  content?: string;
  summary?: string;
}

export interface SearchResult {
  document: {
    id: number;
    title: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
  };
  relevance: number;
  text: string;
}
