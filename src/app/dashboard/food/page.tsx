import { supabase } from "@/lib/supabase";
import { Food } from "@/types/database";

export default async function FoodDiscoveryPage() {
  const { data: foods, error } = await supabase
    .from("foods")
    .select("*")
    .eq("active", true);

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return (
      <main className="min-h-screen bg-[#0F172A] text-white p-4 font-poppins flex flex-col items-center justify-center">
        <p className="text-red-400">Failed to load campus menu. Please try again later.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-white p-4 font-poppins flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Campus Hotspots & Menu</h1>
        
        {/* Shreddy Banner */}
        <div className="bg-[#1E293B] border border-[#00C853]/30 rounded-2xl p-4 flex flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#00C853]/20 flex items-center justify-center text-xl shrink-0">
            🦖
          </div>
          <div>
            <h3 className="text-[#00C853] text-sm font-semibold mb-0.5">Shreddy says:</h3>
            <p className="text-white text-sm leading-snug">
              "Fish & chips before CST? Interesting decision."
            </p>
          </div>
        </div>
      </header>

      {/* Food Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {foods?.map((food: Food) => {
          let budgetColor = "bg-gray-600";
          if (food.budget_tier === "Medium") budgetColor = "bg-blue-600";
          if (food.budget_tier === "Premium") budgetColor = "bg-purple-600";
          if (food.budget_tier === "Budget") budgetColor = "bg-green-600";

          let fitnessColor = "bg-gray-600";
          if (food.fitness_tag?.includes("Protein")) fitnessColor = "bg-green-600";
          if (food.fitness_tag?.includes("Carb")) fitnessColor = "bg-orange-600";
          if (food.fitness_tag?.includes("Cheat")) fitnessColor = "bg-red-600";

          return (
            <div 
              key={food.id}
              className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{food.name}</h3>
                  <p className="text-sm text-gray-400">{food.vendor}</p>
                </div>
                <div className="text-right font-bold text-[#00C853]">
                  ₦{food.price?.toLocaleString("en-NG")}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-auto">
                {food.budget_tier && (
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold text-white uppercase tracking-wider ${budgetColor}`}>
                    {food.budget_tier}
                  </span>
                )}
                {food.fitness_tag && (
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold text-white uppercase tracking-wider ${fitnessColor}`}>
                    {food.fitness_tag}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {(!foods || foods.length === 0) && (
          <div className="col-span-1 md:col-span-2 text-center text-gray-400 py-12">
            No active menu items found.
          </div>
        )}
      </section>
    </main>
  );
}
