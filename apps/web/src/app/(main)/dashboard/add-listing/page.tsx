'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import { useToast } from '@/components/ToastProvider';
import { useAuth } from '@/components/UserProvider';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Compress image to keep Firestore docs under 1 MB (max field size).
// Resize to max 600px on the longer side and encode as JPEG @ 0.7 quality.
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 600;
        let { width, height } = img;
        if (width > height && width > MAX) {
          height = (height * MAX) / width;
          width = MAX;
        } else if (height > MAX) {
          width = (width * MAX) / height;
          height = MAX;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unavailable'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
};

export default function AddListingPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const price = Number(formData.get('price'));
      const quantity = Number(formData.get('quantity'));
      const category = formData.get('category') as string;
      const description = formData.get('description') as string;

      let imageData = '';
      if (imageFile) {
        imageData = await compressImage(imageFile);
      }

      if (!user || !profile) {
        toast.error('Profile not loaded. Please refresh.');
        return;
      }

      await addDoc(collection(db, 'listings'), {
        title,
        price,
        quantity,
        category,
        description,
        images: imageData ? [imageData] : [],
        sellerId: user.uid,
        sellerName: profile.name,
        sellerRoom: profile.roomNumber,
        sellerHostel: profile.hostelName,
        sellerPhoto: user.photoURL || null,
        status: 'active',
        viewsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Listing posted successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error adding listing:', error);
      toast.error(`Failed to post listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-3 pb-32 md:px-8 md:pt-6 md:pb-12 md:max-w-2xl md:mx-auto md:w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 bg-[#F5F6F8] rounded-full flex items-center justify-center hover:bg-[#EEF0F3]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-[22px] font-bold text-[#0A0E1A] tracking-[-0.5px]">Add New Listing</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        <ImageUpload onImageSelected={setImageFile} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#4B5563]">Item Name</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g., Maggi Masala 70g"
              className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-[#4B5563]">Price (₹)</label>
              <input
                type="number"
                name="price"
                required
                min="1"
                placeholder="0"
                className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-[#4B5563]">Quantity</label>
              <input
                type="number"
                name="quantity"
                required
                min="1"
                defaultValue="1"
                className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#4B5563]">Category</label>
            <select
              name="category"
              required
              className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition appearance-none"
            >
              <option value="Snacks">Snacks</option>
              <option value="Noodles">Noodles</option>
              <option value="Drinks">Drinks</option>
              <option value="Toiletries">Toiletries</option>
              <option value="Stationery">Stationery</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#4B5563]">Description (Optional)</label>
            <textarea
              name="description"
              placeholder="Any details about the item..."
              className="w-full h-[120px] bg-[#F5F6F8] rounded-[14px] p-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[56px] bg-[#0062FF] text-white font-semibold rounded-[16px] text-[15px] hover:bg-[#0055E0] active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {loading ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            'Post Listing'
          )}
        </button>
      </form>
    </div>
  );
}
