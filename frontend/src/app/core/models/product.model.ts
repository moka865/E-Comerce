import { Category } from './category.model';
import { Subcategory } from './subcategory.model';
import { Season } from './season.model';

export type StockStatus = 'in_stock' | 'almost_out_of_stock' | 'out_of_stock';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: Category;
  subcategory: Subcategory;
  season?: Season;
  stock: number;
  slug: string;
  isTopSale: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  isDeleted?: boolean;
  stockStatus?: StockStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: PaginationMeta;
}

export interface ProductSingleResponse {
  success: boolean;
  data: Product;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  season?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
