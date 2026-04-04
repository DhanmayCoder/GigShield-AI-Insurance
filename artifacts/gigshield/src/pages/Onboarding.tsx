import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCreateUser } from "@workspace/api-client-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, UserCircle, CreditCard, MapPin, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function Onboarding() {
  const { login } = useAuth();
  const { mutate: createUser, isPending } = useCreateUser();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    panCard: "",
    deliveryId: "",
    zone: "North",
    plan: "bronze" as "bronze" | "silver" | "gold",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.panCard || !formData.deliveryId) {
      setError("Please fill in all required fields.");
      return;
    }

    createUser(
      { data: formData },
      {
        onSuccess: (data) => {
          login(data.deliveryId);
        },
        onError: (err: any) => {
          setError(err.message || "Failed to create profile. Delivery ID might already be in use.");
        },
      }
    );
  };

  return (
    <MobileLayout hideNav>
      <div className="min-h-full flex flex-col">

        {/* Bold blue hero header */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-6 pt-14 pb-12 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-xl"
          >
            <ShieldCheck size={40} className="text-blue-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl font-display font-bold text-white tracking-tight"
          >
            GigShield AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-blue-100 mt-2 text-center text-sm px-6"
          >
            Protecting your earnings against weather, traffic & strikes
          </motion.p>
        </div>

        {/* Form card — overlaps the header slightly */}
        <div className="flex-1 px-5 -mt-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-xl shadow-black/10 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create your profile</h2>

            {error && (
              <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <UserCircle size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    placeholder="Rahul Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">PAN Card Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <CreditCard size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all uppercase outline-none"
                    placeholder="ABCDE1234F"
                    value={formData.panCard}
                    onChange={(e) => setFormData({ ...formData, panCard: e.target.value.toUpperCase() })}
                  />
                </div>
                <p className="text-[11px] text-gray-500 ml-1">Required for fraud prevention & claims</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Delivery ID (Swiggy/Zomato)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Truck size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    placeholder="SW-98765432"
                    value={formData.deliveryId}
                    onChange={(e) => setFormData({ ...formData, deliveryId: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Working Zone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <MapPin size={20} />
                  </div>
                  <select
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all appearance-none outline-none"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  >
                    <option value="North">North Zone</option>
                    <option value="South">South Zone</option>
                    <option value="East">East Zone</option>
                    <option value="West">West Zone</option>
                    <option value="Central">Central Zone</option>
                  </select>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold text-base rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isPending ? "Setting up..." : "Complete Setup"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

      </div>
    </MobileLayout>
  );
}
