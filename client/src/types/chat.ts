export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface ChatRequest {
  message: string;
  history?: Message[];
}

export interface ChatResponse {
  response: string;
  suggestedProducts?: any[]; // We can use Product type here later
  intent?: string;
}
