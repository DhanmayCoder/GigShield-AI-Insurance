import { useAuth } from "@/lib/auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useGetWallet } from "@workspace/api-client-react";
import { Loader2, TrendingUp, PiggyBank, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Wallet() {
  const { deliveryId } = useAuth();
  const { data: wallet, isLoading } = useGetWallet(deliveryId || "", {
    query: { enabled: !!deliveryId }
  });

  if (isLoading || !wallet) {
    return <MobileLayout><Loader2 className="mx-auto mt-20 animate-spin text-primary w-8 h-8" /></MobileLayout>;
  }

  return (
    <MobileLayout>
      <div className="px-6 py-8">
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">Smart Wallet</h1>

        {/* Main Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-primary to-accent rounded-[2rem] p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden mb-6"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1">Available Balance</p>
            <h2 className="text-5xl font-display font-bold tracking-tight mb-8">
              {formatCurrency(wallet.balance)}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
                  <PiggyBank size={14} /> Saved
                </div>
                <p className="text-xl font-bold">{formatCurrency(wallet.totalSaved)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
                  <TrendingUp size={14} /> Interest ({wallet.interestRate}%)
                </div>
                <p className="text-xl font-bold text-green-300">+{formatCurrency(wallet.interestEarned)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {wallet.transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No transactions yet
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {wallet.transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                      tx.type === 'payout' ? "bg-green-100 text-green-600" :
                      tx.type === 'interest' ? "bg-blue-100 text-blue-600" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {tx.type === 'payout' ? <ArrowDownLeft size={20} /> :
                       tx.type === 'interest' ? <TrendingUp size={20} /> :
                       <ArrowUpRight size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate capitalize">{tx.description || tx.type}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <Calendar size={12} />
                        {format(new Date(tx.createdAt), "MMM d, yyyy • h:mm a")}
                      </div>
                    </div>
                    
                    <div className={cn(
                      "font-bold text-right",
                      tx.type === 'premium' ? "text-gray-900" : "text-green-600"
                    )}>
                      {tx.type === 'premium' ? "-" : "+"}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
