'use client';

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8 py-12">
      <div className="flex flex-col gap-2">
        <span className="text-[#0062FF] text-xs font-semibold tracking-[1px]">HOSTELMART</span>
        <h1 className="text-[28px] font-bold text-[#0A0E1A] tracking-[-0.5px]">Create your account</h1>
        <p className="text-sm text-[#4B5563] leading-[1.4]">
          Join your hostel&apos;s marketplace. It takes 30 seconds.
        </p>
      </div>

      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#4B5563]">Full Name</label>
          <input type="text" placeholder="Your name" className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#4B5563]">Phone Number</label>
          <input type="tel" placeholder="+91 XXXXX XXXXX" className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition" />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-[#4B5563]">Hostel</label>
            <input type="text" placeholder="Hostel name" className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition" />
          </div>
          <div className="w-[100px] flex flex-col gap-2">
            <label className="text-sm font-medium text-[#4B5563]">Room</label>
            <input type="text" placeholder="204" className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition" />
          </div>
        </div>

        <button type="submit" className="w-full h-[52px] bg-[#0062FF] text-white font-semibold rounded-[14px] text-sm hover:bg-[#0055E0] active:scale-[0.98] transition">
          Send OTP
        </button>
      </form>

      <p className="text-center text-sm text-[#9CA3AF]">
        Already have an account?{' '}
        <a href="/login" className="text-[#0062FF] font-semibold">Sign in</a>
      </p>
    </div>
  );
}
