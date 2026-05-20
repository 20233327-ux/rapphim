import { Movie, Room, Showtime, User, Shift, Promotion, Booking } from './types';

export const MOVIES: Movie[] = [
  {
    id: '1',
    code: 'M001',
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    duration: 166,
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    rating: 'PG-13',
    posterUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMccj10b-BnIPz19MGuDnKIhFLZetZEhjrCw&s',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    director: 'Denis Villeneuve',
    actors: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    releaseDate: '2024-03-01',
    endDate: '2024-05-01',
    status: 'now-showing',
  },
  {
    id: '2',
    code: 'M002',
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    duration: 180,
    genre: ['Biography', 'Drama', 'History'],
    rating: 'R',
    posterUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fkroPNHFGum8l3It6BZYkQ8eRQ1MJqv7uw&s',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    director: 'Christopher Nolan',
    actors: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'],
    releaseDate: '2023-07-21',
    endDate: '2023-10-21',
    status: 'stopped',
  },
  {
    id: '3',
    code: 'M003',
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    duration: 140,
    genre: ['Animation', 'Action', 'Adventure'],
    rating: 'PG',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=shW9i6k8cB0',
    director: 'Joaquim Dos Santos',
    actors: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    releaseDate: '2023-06-02',
    endDate: '2023-08-02',
    status: 'stopped',
  },
  {
    id: '4',
    code: 'M004',
    title: 'Godzilla x Kong: The New Empire',
    description: 'Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins and connection to Skull Island\'s mysteries.',
    duration: 115,
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    rating: 'PG-13',
    posterUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkRpqALiApXP9okiRMVWwQoCGeGHA2kEUjJA&s',
    trailerUrl: 'https://www.youtube.com/watch?v=lV1OOlGwExM',
    director: 'Adam Wingard',
    actors: ['Rebecca Hall', 'Brian Tyree Henry', 'Dan Stevens'],
    releaseDate: '2024-03-29',
    endDate: '2024-06-29',
    status: 'now-showing',
  },
];

export const ROOMS: Room[] = [
  { id: 'R1', code: 'P01', name: 'Cinema 1', capacity: 100, rows: 10, cols: 10, type: '2D' },
  { id: 'R2', code: 'P02', name: 'Cinema 2', capacity: 80, rows: 8, cols: 10, type: '3D' },
  { id: 'R3', code: 'P03', name: 'IMAX Theatre', capacity: 150, rows: 10, cols: 15, type: 'IMAX' },
  { id: 'R4', code: 'P04', name: '4DX Cinema', capacity: 64, rows: 8, cols: 8, type: '4DX' },
];

export const SHOWTIMES: Showtime[] = [
  { id: 'S1', movieId: '1', roomId: 'R3', startTime: '2024-04-10T14:00:00', endTime: '2024-04-10T16:46:00', basePrice: 150000 },
  { id: 'S2', movieId: '1', roomId: 'R3', startTime: '2024-04-10T18:00:00', endTime: '2024-04-10T20:46:00', basePrice: 150000 },
  { id: 'S3', movieId: '4', roomId: 'R1', startTime: '2024-04-10T15:00:00', endTime: '2024-04-10T16:55:00', basePrice: 120000 },
  { id: 'S4', movieId: '4', roomId: 'R2', startTime: '2024-04-10T16:30:00', endTime: '2024-04-10T18:25:00', basePrice: 100000 },
];

export const USERS: User[] = [
  { id: 'U1', code: 'NV001', name: 'Admin User', email: 'admin@cinema.com', phone: '0901234567', role: 'admin', address: '123 Main St' },
  { id: 'U2', code: 'NV002', name: 'Staff Member', email: 'staff@cinema.com', phone: '0907654321', role: 'staff', address: '456 Side St' },
  { id: 'U3', name: 'John Doe', email: 'john@example.com', phone: '0912345678', role: 'customer', points: 150 },
  { id: 'U4', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', role: 'customer', points: 50 },
];

export const SHIFTS: Shift[] = [
  { id: 'SH1', staffId: 'U2', type: 'morning', date: '2024-04-10', revenue: 5400000, status: 'completed' },
  { id: 'SH2', staffId: 'U2', type: 'afternoon', date: '2024-04-10', revenue: 0, status: 'scheduled' },
];

export const PROMOTIONS: Promotion[] = [
  { id: 'P1', code: 'WELCOME50', description: 'Giảm 50% cho khách hàng mới', discountPercent: 50, validUntil: '2024-12-31' },
  { id: 'P2', code: 'WEEKEND10', description: 'Giảm 10% cho ngày cuối tuần', discountPercent: 10, validUntil: '2024-12-31' },
];

export const BOOKINGS: Booking[] = [
  {
    id: 'B1',
    userId: 'U1',
    showtimeId: 'S1',
    seatIds: ['A1', 'A2'],
    totalPrice: 300000,
    paymentMethod: 'vnpay',
    status: 'completed',
    createdAt: '2024-04-09T10:00:00',
    qrCode: 'CH-B1-QR',
    movieId: ''
  },
  {
    id: 'B2',
    userId: 'U1',
    showtimeId: 'S3',
    seatIds: ['C5'],
    totalPrice: 120000,
    paymentMethod: 'momo',
    status: 'completed',
    createdAt: '2024-04-08T15:30:00',
    qrCode: 'CH-B2-QR',
    movieId: ''
  }
];
