import { useAuth } from "@/lib/auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useGetUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/Button";
import { Loader2, UserCircle, MapPin, CreditCard, Shield, LogOut } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { deliveryId, logout } = useAuth();
  const { data: user, isLoading } = useGetUser(deliveryId || "", {
    query: { enabled: !!deliveryId }
  });

  if (isLoading || !user) {
    return <MobileLayout><Loader2 className="mx-auto mt-20 animate-spin text-primary w-8 h-8" /></MobileLayout>;
  }

  return (
    <MobileLayout>
      <div className="px-6 py-8">
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">Profile</h1>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <UserCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500 font-medium mt-1">ID: {user.deliveryId}</p>
          
          <div className="flex items-center gap-2 mt-4 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-100">
            <Shield size={16} /> Active Coverage
          </div>
        </div>

        <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 mb-8">
          <div className="p-4 flex items-center gap-4 border-b border-gray-50">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Registered Zone</p>
              <p className="font-bold text-gray-900">{user.zone} Zone</p>
            </div>
          </div>
          
          <div className="p-4 flex items-center gap-4 border-b border-gray-50">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">PAN Card</p>
              <p className="font-bold text-gray-900 uppercase">{user.panCard}</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Member Since</p>
              <p className="font-bold text-gray-900">{format(new Date(user.registeredAt), "MMMM d, yyyy")}</p>
            </div>
          </div>
        </div>

        <Button 
          variant="danger" 
          className="w-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 shadow-none"
          onClick={logout}
        >
          <LogOut size={18} className="mr-2" /> Sign Out
        </Button>
      </div>
    </MobileLayout>
  );
}
