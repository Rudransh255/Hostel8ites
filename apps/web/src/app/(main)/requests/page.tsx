'use client';

const mockRequests = [
  { id: '1', item: 'Colgate Toothpaste', budget: 50, urgency: 'high' as const, user: 'Amit K.', room: '115', time: '12m' },
  { id: '2', item: 'Notebook (200 pages)', budget: 80, urgency: 'medium' as const, user: 'Sneha M.', room: '302', time: '1h' },
  { id: '3', item: 'Phone Charger (Type-C)', budget: null, urgency: 'low' as const, user: 'Rahul V.', room: '410', time: '3h' },
];

const urgencyConfig = {
  high: { label: 'URGENT', color: '#EF4444', bg: '#FEF2F2' },
  medium: { label: 'MEDIUM', color: '#F59E0B', bg: '#FFFBEB' },
  low: { label: 'LOW', color: '#10B981', bg: '#F0FDF4' },
};

export default function RequestsPage() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-4 md:px-8 md:pt-6">
      <div className="flex flex-col gap-[6px]">
        <span className="text-[#0062FF] text-[11px] font-semibold tracking-[1px]">COMMUNITY</span>
        <h1 className="text-[28px] font-bold text-[#0A0E1A] tracking-[-0.5px]">Request Board</h1>
        <p className="text-sm text-[#4B5563] leading-[1.4]">
          Post a request and someone in your hostel will respond.
        </p>
      </div>

      <button className="w-full h-[52px] bg-[#0062FF] text-white font-semibold rounded-[14px] text-sm transition">
        + Post a Request
      </button>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-[#0A0E1A]">Open requests</span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {mockRequests.map((req) => {
          const urg = urgencyConfig[req.urgency];
          return (
            <div key={req.id} className="bg-[#F5F6F8] rounded-[18px] p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[15px] font-semibold text-[#0A0E1A]">{req.item}</span>
                  <span className="text-xs text-[#9CA3AF]">{req.user} · Room {req.room} · {req.time} ago</span>
                </div>
                <span className="text-[9px] font-bold tracking-[0.5px] rounded-full px-[10px] py-[4px]" style={{ color: urg.color, backgroundColor: urg.bg }}>{urg.label}</span>
              </div>
              {req.budget && <span className="text-xs text-[#4B5563]">Budget: <strong>₹{req.budget}</strong></span>}
              <button className="w-full h-10 border border-[#0062FF] text-[#0062FF] font-semibold rounded-[12px] text-[13px] hover:bg-[#E6EFFF] transition-colors">I Have This</button>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
