'use client';

import { create } from 'zustand';

interface FilterState {
  searchQuery: string;
  category: string | null;
  priceMin: number | null;
  priceMax: number | null;
  sort: 'price_asc' | 'price_desc' | 'newest';
  inStock: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setSort: (sort: FilterState['sort']) => void;
  setInStock: (inStock: boolean) => void;
  resetFilters: () => void;
}

const initialState = {
  searchQuery: '',
  category: null,
  priceMin: null,
  priceMax: null,
  sort: 'price_asc' as const,
  inStock: true,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategory: (category) => set({ category }),
  setPriceRange: (priceMin, priceMax) => set({ priceMin, priceMax }),
  setSort: (sort) => set({ sort }),
  setInStock: (inStock) => set({ inStock }),
  resetFilters: () => set(initialState),
}));
