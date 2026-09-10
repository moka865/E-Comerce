export interface DeliveryFee {
  _id: string;
  governorate: string;
  city?: string;
  area?: string;
  fee: number;
  isActive: boolean;
}
