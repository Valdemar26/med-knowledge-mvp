export interface Document {
  id: number;
  title: string;
  fileName: string;
  fileType: string;
  content?: string;
  summary?: string;
  uploadDate: string;
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
