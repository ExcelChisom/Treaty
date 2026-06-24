"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, MapPin, PieChart, Loader2 } from "lucide-react";
import { completeUserOnboarding } from "@/actions/user";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 8));

  return (
    <main className="max-w-md mx-auto min-h-screen bg-[#0F172A] text-white font-poppins flex flex-col p-6 relative">
      {step === 1 && (
        <div className="flex flex-col flex-1 items-center justify-center text-center">
          <h1 className="text-4xl font-bold mb-12">Treaty</h1>
          <div className="w-48 h-48 bg-[#00C853]/20 rounded-full flex items-center justify-center text-7xl mb-12">
            🦖
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">Your Campus.<br/>Your Way.</h2>
          <p className="text-gray-400 text-sm">Plan. Save. Succeed.</p>
          <button onClick={nextStep} className="mt-auto bg-[#00C853] text-black w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-transform">
            Get Started
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col flex-1">
          <h1 className="text-3xl font-bold mt-12 mb-8">What should we call you?</h1>
          <p className="text-gray-400 mb-6">Choose a nickname that's unique to you.</p>
          <div className="mb-8">
            <label className="text-sm font-semibold text-gray-400 ml-1 mb-2 block">Nickname</label>
            <input 
              type="text" 
              placeholder="Carlin" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-4 w-full text-white outline-none focus:border-[#00C853] transition-colors" 
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-auto">
             {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="aspect-square rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-3xl">🧑🏽‍🎓</div>
             ))}
          </div>

          <button onClick={nextStep} className="mt-auto bg-[#00C853] text-black w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-transform">
            Continue
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col flex-1">
          <h1 className="text-3xl font-bold mt-12 mb-8">Where are you starting?</h1>
          
          <div className="flex flex-col gap-3 mb-8">
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 flex justify-between items-center">
              <span>Hostel</span>
              <span className="text-gray-500">›</span>
            </div>
            
            <p className="text-gray-400 text-sm font-semibold mt-4 mb-1 ml-1">Add your stops</p>
            
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 flex justify-between items-center">
              <span>Mathematics II (LT 4)</span>
              <span className="text-gray-500">›</span>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 flex justify-between items-center">
              <span>Physics Lecture (LT 2)</span>
              <span className="text-gray-500">›</span>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 flex justify-between items-center">
              <span>Lunch (Caf 2)</span>
              <span className="text-gray-500">›</span>
            </div>
            
            <button className="text-[#00C853] font-semibold text-left p-2 mt-2">+ Add Stop</button>
          </div>

          <button onClick={nextStep} className="mt-auto bg-[#00C853] text-black w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-transform">
            Save Plan
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col flex-1">
          <h1 className="text-3xl font-bold mt-12 mb-2">Smart Suggestions</h1>
          <p className="text-gray-400 mb-8">Suggested for you</p>
          
          <div className="bg-[#1E293B] border border-[#00C853]/50 rounded-2xl p-6 mb-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={64} />
             </div>
             <h3 className="text-white font-semibold text-lg mb-2">Eat at CAF 2<br/>after your lecture!</h3>
             <p className="text-gray-400 text-sm mb-6">Better food, same price as Caf 1</p>
             <button className="text-[#00C853] font-semibold text-sm">Why?</button>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 mb-auto">
             <h3 className="text-white font-semibold text-lg mb-2">Cheapest Route</h3>
             <p className="text-gray-400 text-sm mb-6">Save up to ₦450 today</p>
             <button className="text-[#FDC400] font-semibold text-sm">View Route</button>
          </div>

          <button onClick={nextStep} className="mt-auto bg-[#00C853] text-black w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-transform">
            Continue
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col flex-1">
          <h1 className="text-3xl font-bold mt-12 mb-8">Explore Hotspots</h1>
          
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-3 flex gap-2 mb-6 text-sm">
             <span className="text-gray-400">🔍</span>
             <input type="text" placeholder="Search hotspot" className="bg-transparent outline-none w-full" />
          </div>

          <div className="flex gap-3 mb-6">
             <button className="bg-[#00C853]/20 text-[#00C853] px-4 py-2 rounded-lg font-semibold text-sm">Food</button>
             <button className="bg-[#1E293B] text-gray-400 px-4 py-2 rounded-lg font-semibold text-sm border border-[#334155]">Drinks</button>
             <button className="bg-[#1E293B] text-gray-400 px-4 py-2 rounded-lg font-semibold text-sm border border-[#334155]">Snacks</button>
          </div>

          <div className="flex flex-col gap-4 mb-auto">
             {[1,2,3].map((i) => (
                <div key={i} className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4 flex gap-4 items-center">
                   <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">🍱</div>
                   <div>
                      <h3 className="font-semibold">Caf {i}</h3>
                      <p className="text-gray-400 text-xs mt-1">Buttermilk & rice</p>
                   </div>
                </div>
             ))}
          </div>

          <button onClick={nextStep} className="mt-auto bg-[#00C853] text-black w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-transform">
            Continue
          </button>
        </div>
      )}

      {step === 6 && (
        <div className="flex flex-col flex-1">
          <h1 className="text-3xl font-bold mt-12 mb-2">Track Expenses</h1>
          <p className="text-gray-400 mb-8">Today</p>

          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 mb-auto flex flex-col items-center">
             <p className="text-gray-400 font-semibold mb-1">Total Spent</p>
             <p className="text-4xl font-bold mb-8">₦950.00</p>
             
             <div className="w-48 h-48 rounded-full border-8 border-[#334155] flex items-center justify-center mb-8 relative">
                <PieChart size={64} className="text-gray-500 opacity-50" />
             </div>

             <div className="w-full flex flex-col gap-3">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Food</span><span>63%</span><span>₦600</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Drinks</span><span>21%</span><span>₦200</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Snacks</span><span>16%</span><span>₦150</span></div>
             </div>
          </div>

          <button onClick={nextStep} className="mt-auto bg-[#00C853] text-black w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-transform">
            Add Expense
          </button>
        </div>
      )}

      {step === 7 && (
        <div className="flex flex-col flex-1">
          <h1 className="text-3xl font-bold mt-12 mb-8">Choose a plan</h1>
          
          <div className="flex flex-col gap-4 mb-auto">
             <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-500"></div>
                  <div>
                    <h3 className="font-bold">₦50</h3>
                    <p className="text-gray-400 text-sm">1 Hour</p>
                  </div>
               </div>
             </div>
             <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-500"></div>
                  <div>
                    <h3 className="font-bold">₦100</h3>
                    <p className="text-gray-400 text-sm">1 Day</p>
                  </div>
               </div>
             </div>
             <div className="bg-[#1E293B] border border-[#00C853] rounded-2xl p-5 flex justify-between items-center relative overflow-hidden">
               <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-[#00C853] flex items-center justify-center">
                     <div className="w-3 h-3 bg-[#00C853] rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#00C853]">₦750</h3>
                    <p className="text-[#00C853]/70 text-sm">1 Month</p>
                  </div>
               </div>
               <span className="bg-[#00C853]/20 text-[#00C853] text-xs font-bold px-3 py-1 rounded-full">Best Value</span>
             </div>
          </div>

          <button onClick={nextStep} className="mt-auto bg-[#00C853] text-black w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-transform">
            Continue
          </button>
        </div>
      )}

      {step === 8 && (
        <div className="flex flex-col flex-1 items-center justify-center text-center">
          <div className="w-48 h-48 bg-[#00C853]/20 rounded-full flex items-center justify-center text-7xl mb-12">
            🦖
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">You're all set!</h2>
          <p className="text-gray-400 text-sm px-6">Enjoy your premium experience.</p>
          <button 
            onClick={async () => {
              setIsSaving(true);
              try {
                await completeUserOnboarding(nickname);
                router.push('/dashboard');
              } catch (error) {
                console.error("Failed to save onboarding data:", error);
                setIsSaving(false);
              }
            }} 
            disabled={isSaving}
            className="mt-auto bg-[#00C853] text-black w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : "Go to Dashboard"}
          </button>
        </div>
      )}

    </main>
  );
}
