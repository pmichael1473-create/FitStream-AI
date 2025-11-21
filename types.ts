export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  id?: number;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  isError?: boolean;
  sources?: GroundingSource[];
  generatedVideo?: {
    url: string;
    mimeType: string;
  };
}
