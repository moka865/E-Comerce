import { Category } from './category.model';

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: Category | string;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
