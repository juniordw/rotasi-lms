// src/types/category.ts
export interface Category {
  id: number;
  name: string;
  description: string;
  parent_category_id: number | null;
}