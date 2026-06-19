import { auth, currentUser } from "@clerk/nextjs/server";
import { Calendar, MapPin, Receipt, Lightbulb } from "lucide-react";

export default async function DashboardPage() {
  const [{ userId }, user] = await Promise.all([
    auth(),
    currentUser(),
  ]);

  const nickname =
    user?.firstName?.trim() ||
    user?.username?.trim() ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")?.[0] ||
    "Carlin!";

  return (
    <main className="max-w-lg mx-auto w-full px-4 pt-6 pb-24 flex flex-col gap-6">
      
      {/* 1. Header */}
      <section className="animate-fade-in-up">
        <h1 className="text-white text-2xl font-bold">Hey {nickname}! 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Here's your campus overview</p>
      </section>

      {/* 2. Wallet Card */}
      <section className="animate-fade-in-up delay-75">
        <div className="bg-[#1E293B] rounded-3xl p-5 flex justify-between items-center border border-[#334155]">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Wallet Balance</p>
            <p className="text-white text-3xl font-bold">₦1,250.00</p>
          </div>
          <button className="bg-[#00C853] text-black font-semibold px-4 py-2 rounded-full active:scale-95 transition-transform">
            + Add Money
          </button>
        </div>
      </section>

      {/* 3. Your Plan Today Card */}
      <section className="animate-fade-in-up delay-100">
        <div className="bg-[#1E293B] rounded-3xl p-5 border border-[#334155]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-white font-semibold text-lg">Your Plan Today</h2>
              <p className="text-gray-400 text-sm">4 Classes - 2 Stops</p>
            </div>
          </div>
          <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-[#00C853] rounded-full w-[75%]" />
          </div>
          <p className="text-xs text-gray-400">75% of your day planned</p>
        </div>
      </section>

      {/* 4. Quick Actions Grid */}
      <section className="animate-fade-in-up delay-150 mt-2">
        <h2 className="text-white font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-2xl bg-[#7C4DFF]/20 flex items-center justify-center text-[#7C4DFF] group-active:scale-95 transition-transform">
              <Calendar size={24} />
            </div>
            <span className="text-xs text-gray-400 font-medium">Schedule</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-2xl bg-[#FDC400]/20 flex items-center justify-center text-[#FDC400] group-active:scale-95 transition-transform">
              <MapPin size={24} />
            </div>
            <span className="text-xs text-gray-400 font-medium">Hotspots</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-2xl bg-[#FF6B68]/20 flex items-center justify-center text-[#FF6B68] group-active:scale-95 transition-transform">
              <Receipt size={24} />
            </div>
            <span className="text-xs text-gray-400 font-medium">Expenses</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-2xl bg-[#14B8A6]/20 flex items-center justify-center text-[#14B8A6] group-active:scale-95 transition-transform">
              <Lightbulb size={24} />
            </div>
            <span className="text-xs text-gray-400 font-medium">Tips</span>
          </button>
        </div>
      </section>

      {/* 5. Shreddy's Smart Tip */}
      <section className="animate-fade-in-up delay-200 mt-2">
        <div className="bg-[#1E293B] border border-[#00C853]/30 rounded-3xl p-4 flex flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#00C853]/20 flex items-center justify-center text-xl shrink-0">
            🦖
          </div>
          <div>
            <h3 className="text-[#00C853] text-sm font-semibold mb-0.5">Smart Tip from Shreddy</h3>
            <p className="text-white text-sm leading-snug">
              Grab a meal at CAF 2 after your lecture. Better food for less! 😋
            </p>
          </div>
        </div>
      </section>

      {/* 6. Recent Expenses & Next Class Lists */}
      <section className="animate-fade-in-up delay-300 mt-2 flex flex-col gap-6">
        
        {/* Next Class */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-white font-semibold">Next Class</h2>
            <button className="text-gray-400 text-sm">See all</button>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7C4DFF]/20 flex items-center justify-center text-[#7C4DFF] font-bold">
                M
              </div>
              <div>
                <p className="text-white font-semibold text-sm">MAT 211</p>
                <p className="text-gray-400 text-xs">CST 1st Floor</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-sm">10:00 AM</p>
              <p className="text-gray-400 text-xs">In 20 mins</p>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-white font-semibold">Recent Expenses</h2>
            <button className="text-gray-400 text-sm">See all</button>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-4 flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B68]/20 flex items-center justify-center text-[#FF6B68] font-bold">
                  B
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Buttery Snacks</p>
                  <p className="text-gray-400 text-xs">Today, 9:15 AM</p>
                </div>
              </div>
              <p className="text-white font-semibold text-sm">-₦450.00</p>
            </div>

            <div className="h-[1px] w-full bg-[#334155]" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00C853]/20 flex items-center justify-center text-[#00C853] font-bold">
                  T
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Transfer from John</p>
                  <p className="text-gray-400 text-xs">Yesterday, 4:30 PM</p>
                </div>
              </div>
              <p className="text-[#00C853] font-semibold text-sm">+₦2,000.00</p>
            </div>

          </div>
        </div>

      </section>

    </main>
  );
}
