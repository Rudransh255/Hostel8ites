'use client';

export default function VerifyOtpPage() {
  return (
    <div className="flex flex-col gap-8 py-12">
      <div className="flex flex-col gap-2">
        <span className="text-[#0062FF] text-xs font-semibold tracking-[1px]">VERIFICATION</span>
        <h1 className="text-[28px] font-bold text-[#0A0E1A] tracking-[-0.5px]">Enter OTP</h1>
        <p className="text-sm text-[#4B5563] leading-[1.4]">
          We sent a 6-digit code to your phone. Enter it below to verify.
        </p>
      </div>

      <form className="flex flex-col gap-6">
        {/* OTP Input Boxes */}
        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              className="w-12 h-14 bg-[#F5F6F8] rounded-[14px] text-center text-xl font-bold text-[#0A0E1A] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
            />
          ))}
        </div>

        <button type="submit" className="w-full h-[52px] bg-[#0062FF] text-white font-semibold rounded-[14px] text-sm hover:bg-[#0055E0] active:scale-[0.98] transition">
          Verify & Continue
        </button>
      </form>

      <p className="text-center text-sm text-[#9CA3AF]">
        Didn&apos;t receive the code?{' '}
        <button className="text-[#0062FF] font-semibold">Resend OTP</button>
      </p>
    </div>
  );
}
