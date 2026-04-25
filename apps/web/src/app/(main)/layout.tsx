import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "HostelMart — Your Hostel Marketplace",
  description: "Buy and sell snacks, groceries, and daily essentials within your hostel.",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen md:max-w-[1400px] md:mx-auto">
        <main className="pb-[120px] md:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
