export interface VerticalItem {
  id: number;
  name: string;
  description?: string;
}

export interface CreateVerticalPayload {
  name: string;
  description?: string;
}

export interface UpdateVerticalPayload {
  name?: string;
  description?: string;
}
