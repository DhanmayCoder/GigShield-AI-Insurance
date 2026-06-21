import { useAuth } from "@/lib/auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/Button";
import { useGetUser, useUpdateUserPlan } from "@workspace/api-client-react";
import { Shield, Check, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Plans() {
  const { deliveryId } = useAuth();
  const { data: user, refetch } = useGetUser(deliveryId || "", {
    query: { enabled: !!deliveryId }
  });
  const { mutate: updatePlan, isPending } = useUpdateUserPlan();

  if (!user) return <MobileLayout><Loader2 className="mx-auto mt-20 animate-spin" /></MobileLayout>;

  const handleSelectPlan = (planId: "bronze" | "silver" | "gold") => {
    if (user.plan === planId) return;
    updatePlan(
      { deliveryId: user.deliveryId, data: { plan: planId } },
      { onSuccess: () => refetch() }
    );
  };

  const plans = [
    {
      id: "bronze",
      name: "Bronze Plan",
      price: 59,
      color: "from-amber-600 to-amber-700",
      bgClass: "bg-amber-50/50",
      borderClass: "border-amber-200",
      textClass: "text-amber-700",
      features: ["Rain Coverage", "Temperature Extremes"],
      missing: ["Pollution Coverage", "Traffic Delays", "Strike Protection"]
    },
    {
      id: "silver",
      name: "Silver Plan",
      price: 89,
      color: "from-gray-400 to-gray-500",
      bgClass: "bg-gray-50/50",
      borderClass: "border-gray-300",
      textClass: "text-gray-600",
      features: ["Rain Coverage", "Temperature Extremes", "Pollution Coverage", "Strike Protection"],
      missing: ["Traffic Delays"]
    },
    {
      id: "gold",
      name: "Gold Plan",
      price: 118,
      color: "from-primary to-accent",
      bgClass: "bg-primary/5",
      borderClass: "border-primary/30",
      textClass: "text-primary",
      features: ["Rain Coverage", "Temperature Extremes", "Pollution Coverage", "Traffic Delays", "Strike Protection"],
      missing: [],
      popular: true
    }
  ];

  return (
    <MobileLayout>
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Insurance Plans</h1>
          <p className="text-gray-500 mt-2">Select the coverage that fits your daily routes.</p>
        </div>

        <div className="space-y-6 pb-6">
          {plans.map((plan, idx) => {
            const isActive = user.plan === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
                  isActive ? `border-primary shadow-xl shadow-primary/10 scale-[1.02]` : `border-gray-100 bg-white scale-100`
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 uppercase tracking-wider">
                    Current Plan
                  </div>
                )}
                
                {plan.popular && !isActive && (
                  <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className={`p-6 ${isActive ? plan.bgClass : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${plan.textClass}`}>{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-display font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                        <span className="text-sm text-gray-500 font-medium">/month</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${plan.color} text-white shadow-lg`}>
                      <Shield size={24} />
                    </div>
                  </div>

                  <div className="space-y-3 mt-6 mb-8">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{f}</span>
                      </div>
                    ))}
                    {plan.missing.map(m => (
                      <div key={m} className="flex items-center gap-3 opacity-40 grayscale">
                        <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                          <span className="w-2 h-0.5 bg-current rounded-full" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">{m}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant={isActive ? "outline" : "primary"}
                    className="w-full"
                    disabled={isActive || isPending}
                    onClick={() => handleSelectPlan(plan.id as any)}
                  >
                    {isActive ? "Currently Active" : `Select ${plan.name}`}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
