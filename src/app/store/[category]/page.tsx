'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { SectionHeader } from '@/components/section-header'


// Utility to convert category name to slug and back
function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function unslugify(slug: string) {
  return slug.replace(/-/g, ' ');
}

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  category: { id: string; name: string }
  imageUrl?: string
  available: boolean
}


export default function CategoryPage({ params }: { params: { category: string } }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        // Find all unique categories
        const allCategories: string[] = Array.from(new Set(data.map((item: MenuItem) => String(item.category.name))));
        // Find the category name that matches the slug
        const matchedCategory: string | null = allCategories.find(
          (cat) => slugify(cat) === params.category
        ) || null;
        setCategoryName(matchedCategory);
        // Filter items by matched category
        const filteredItems = matchedCategory
          ? data.filter((item: MenuItem) => slugify(String(item.category.name)) === params.category)
          : [];
        setItems(filteredItems);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [params.category]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!categoryName) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SectionHeader title="Category Not Found" description="This category does not exist." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeader 
        title={categoryName}
        description={`Browse our selection of ${categoryName}.`}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            {...item}
            rating={4.5}
            ratingCount={Math.floor(Math.random() * 100) + 10}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          <p>No items found in this category.</p>
        </div>
      )}
    </div>
  );
}