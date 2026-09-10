export interface Season {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
