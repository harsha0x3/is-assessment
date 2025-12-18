// src\store\rootTypes.ts
export interface ApiResponse<T> {
  msg: string;
  data: T;
}
