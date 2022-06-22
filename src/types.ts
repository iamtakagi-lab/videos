export interface Pagination {
  index: number;
  size: number;
  prev: number | null;
  next: number | null;
  files: string[];
}

export interface VideoFilesProvider {
  files: string[];
  pagination: Pagination;
}
