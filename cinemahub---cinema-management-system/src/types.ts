/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MovieStatus = 'now-showing' | 'coming-soon' | 'stopped';
export type RoomType = '2D' | '3D' | 'IMAX' | '4DX';
export type SeatType = 'normal' | 'vip' | 'double' | 'disabled';
export type SeatStatus = 'available' | 'booked' | 'sold' | 'broken';
export type UserRole = 'admin' | 'manager' | 'staff' | 'customer';
export type ShiftType = 'morning' | 'afternoon' | 'evening';

export interface Movie {
  id: string;
  code: string;
  title: string;
  description: string;
  duration: number; // in minutes
  genre: string[];
  rating: string;
  posterUrl: string;
  trailerUrl?: string;
  director: string;
  actors: string[];
  releaseDate: string;
  endDate: string;
  status: MovieStatus;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  capacity: number;
  rows: number;
  cols: number;
  type: RoomType;
}

export interface Seat {
  id: string;
  row: string;
  col: number;
  type: SeatType;
  status: SeatStatus;
}

export interface Showtime {
  id: string;
  movieId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  basePrice: number;
}

export interface User {
  id: string;
  code?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  points?: number;
  address?: string;
}

export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  seatIds: string[];
  totalPrice: number;
  paymentMethod: 'vnpay' | 'momo' | 'credit-card' | 'cash';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  qrCode?: string;
}

export interface Shift {
  id: string;
  staffId: string;
  type: ShiftType;
  date: string;
  revenue: number;
  status: 'scheduled' | 'completed' | 'absent';
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  validUntil: string;
}
