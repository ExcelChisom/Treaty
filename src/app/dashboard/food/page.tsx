import { supabase } from "@/lib/supabase";
import { Food } from "@/types/database";
import LogMealButton from "@/components/ui/LogMealButton";

export default async function FoodDiscoveryPage() {
  const { data: foods, error } = await supabase
    .from("foods")
    .select("*")
    .eq("active", true);

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return (
      <main className="flex flex-col items-center justify-center pt-20">
        <p className="text-treaty-red font-bold">Failed to load campus menu. Please try again later.</p>
      </main>
    );
  }

  return (
    <div className="animate-fade-up pt-6">
      <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-[16px] p-3 flex gap-3 mb-5">
        <i className="fas fa-search text-treaty-text-muted mt-1"></i>
        <input 
          type="text" 
          placeholder="Search meals..." 
          className="border-none outline-none w-full text-[14px] bg-transparent text-treaty-text-main placeholder:text-treaty-text-muted" 
        />
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-3 mb-4 no-scrollbar">
        <span className="px-[18px] py-[8px] rounded-[20px] text-[13px] font-medium whitespace-nowrap bg-treaty-primary text-white border border-treaty-primary">All</span>
        <span className="px-[18px] py-[8px] rounded-[20px] text-[13px] font-medium whitespace-nowrap bg-white/70 border border-[#E2E8F0] text-treaty-text-main">Burgers</span>
        <span className="px-[18px] py-[8px] rounded-[20px] text-[13px] font-medium whitespace-nowrap bg-white/70 border border-[#E2E8F0] text-treaty-text-main">Rice</span>
        <span className="px-[18px] py-[8px] rounded-[20px] text-[13px] font-medium whitespace-nowrap bg-white/70 border border-[#E2E8F0] text-treaty-text-main">Snacks</span>
      </div>

      <div className="flex flex-col gap-3">
        {foods?.map((food: Food) => (
          <div 
            key={food.id}
            className="flex justify-between items-center bg-white/70 backdrop-blur-md rounded-[16px] px-4 py-[14px] border border-white/80"
          >
            <div>
              <h4 className="text-[15px] font-semibold text-treaty-text-main">{food.name}</h4>
              <p className="text-[12px] text-treaty-text-muted">{food.vendor} • {food.fitness_tag}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="font-bold text-treaty-red">₦{food.price?.toLocaleString("en-NG")}</div>
              <div className="text-treaty-text-muted text-[12px]">{food.calories || 0} cal</div>
              <LogMealButton food={food} />
            </div>
          </div>
        ))}

        {(!foods || foods.length === 0) && (
          <div className="text-center text-treaty-text-muted py-12">
            No active menu items found.
          </div>
        )}
      </div>
    </div>
  );
}
