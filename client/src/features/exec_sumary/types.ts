// Base request to create a new executive summary
export interface NewExecSummaryRequest {
  content: string;
}

// Author info
export interface Author {
  id: string;
  full_name: string;
  email: string;
}

// Input used internally (or for creation with backend enrichment)
export interface ExecSummaryInput extends NewExecSummaryRequest {
  author_id: string;
  application_id: string;
}

// Output / response model
export interface ExecSummaryOut extends ExecSummaryInput {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  author?: Author | null;
}
