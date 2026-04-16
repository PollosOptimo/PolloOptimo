export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Caja de Alfajores Premium',
    description: 'Caja x 12 unidades de alfajores de chocolate rellenos de dulce de leche.',
    price: 12000,
    imageUrl: 'https://picsum.photos/seed/alfajor/400/300',
    category: 'Golosinas',
    stock: 50,
  },
  {
    id: '2',
    name: 'Pack Gaseosa Cola 2.25L',
    description: 'Pack x 6 unidades de gaseosa sabor cola.',
    price: 15500,
    imageUrl: 'https://picsum.photos/seed/soda/400/300',
    category: 'Bebidas',
    stock: 30,
  },
  {
    id: '3',
    name: 'Yerba Mate 1Kg',
    description: 'Yerba mate tradicional con palo, paquete por 1 kilogramo.',
    price: 4500,
    imageUrl: 'https://picsum.photos/seed/yerba/400/300',
    category: 'Almacén',
    stock: 100,
  },
  {
    id: '4',
    name: 'Cerveza Rubia Lata 473ml',
    description: 'Pack x 24 latas de cerveza rubia clásica.',
    price: 28000,
    imageUrl: 'https://picsum.photos/seed/beer/400/300',
    category: 'Bebidas Alcohólicas',
    stock: 20,
  },
  {
    id: '5',
    name: 'Galletitas Surtidas 400g',
    description: 'Paquete familiar de galletitas dulces surtidas.',
    price: 1800,
    imageUrl: 'https://picsum.photos/seed/cookies/400/300',
    category: 'Galletitas',
    stock: 80,
  },
  {
    id: '6',
    name: 'Aceite de Girasol 1.5L',
    description: 'Aceite de girasol primera marca, botella de 1.5 litros.',
    price: 3200,
    imageUrl: 'https://picsum.photos/seed/oil/400/300',
    category: 'Almacén',
    stock: 45,
  },
];
