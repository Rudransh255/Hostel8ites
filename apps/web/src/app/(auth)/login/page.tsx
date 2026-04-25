'use client';

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8 py-12">
      {/* Logo & Branding */}
      <div className="flex flex-col gap-2">
        <span className="text-[#0062FF] text-xs font-semibold tracking-[1px]">HOSTELMART</span>
        <h1 className="text-[28px] font-bold text-[#0A0E1A] tracking-[-0.5px]">Welcome back</h1>
        <p className="text-sm text-[#4B5563] leading-[1.4]">
          Sign in with your phone number or email to continue.
        </p>
      </div>

      {/* Login Form */}
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#4B5563]">Phone or Email</label>
          <input
            type="text"
            placeholder="Enter phone number or email"
            className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full h-[52px] bg-[#0062FF] text-white font-semibold rounded-[14px] text-sm hover:bg-[#0055E0] active:scale-[0.98] transition"
        >
          Send OTP
        </button>
      </form>

      {/* Register Link */}
      <p className="text-center text-sm text-[#9CA3AF]">
        New to HostelMart?{' '}
        <a href="/register" className="text-[#0062FF] font-semibold">Create account</a>
      </p>
    </div>
  );
}
