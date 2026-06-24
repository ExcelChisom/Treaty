import { clerkClient } from "@clerk/nextjs/server";

export default async function AdminPage() {
  const client = await clerkClient();
  const usersResponse = await client.users.getUserList();
  const users = usersResponse.data;

  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.publicMetadata?.isPremium === true).length;
  const totalRevenue = premiumUsers * 750;

  return (
    <main className="max-w-5xl mx-auto w-full px-6 pt-12 pb-24 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Treaty Command Center</h1>
        <p className="text-gray-400">System Overview & Analytics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Total Students</p>
          <p className="text-3xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Premium Upgrades</p>
          <p className="text-3xl font-bold text-[#00C853]">{premiumUsers}</p>
        </div>
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Estimated Revenue</p>
          <p className="text-3xl font-bold text-white">₦{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* User Ledger */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">User Ledger</h2>
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden">
          <div className="flex flex-col">
            {users.map((u, index) => {
              const isPremium = u.publicMetadata?.isPremium === true;
              return (
                <div 
                  key={u.id} 
                  className={`flex flex-row items-center justify-between p-4 ${index !== users.length - 1 ? 'border-b border-[#334155]' : ''}`}
                >
                  <div className="flex flex-col">
                    <p className="text-white font-medium">{u.firstName || 'Student'}</p>
                    <p className="text-gray-400 text-sm">{u.emailAddresses[0]?.emailAddress}</p>
                  </div>
                  <div>
                    {isPremium ? (
                      <span className="bg-[#00C853]/20 text-[#00C853] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Premium
                      </span>
                    ) : (
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Standard
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {users.length === 0 && (
              <div className="p-6 text-center text-gray-400">
                No users found.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
