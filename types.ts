
export interface Booking {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  startDate: string; // ISO format string YYYY-MM-DD
  endDate: string;   // ISO format string YYYY-MM-DD
  totalPrice: number;
  deposit: number;
  comments: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface BookingFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  startDate: string;
  endDate: string;
  comments: string;
}

export type ViewType = 'customer' | 'admin';
