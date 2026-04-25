import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — HostelMart",
  description: "Sign in to HostelMart to buy and sell within your hostel.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5">
      <div className="w-full max-w-[390px]">
        {children}
      </div>
    </div>
  );
}
