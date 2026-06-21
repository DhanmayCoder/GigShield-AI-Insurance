import { useAuth } from "@/lib/auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useGetClaims } from "@workspace/api-client-react";
import { Loader2, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Claims() {
  const { deliveryId } = useAuth();
  const { data: history, isLoading } = useGetClaims(deliveryId || "", {
    query: { enabled: !!deliveryId }
  });

  if (isLoading || !history) {
    return <MobileLayout><Loader2 className="mx-auto mt-20 animate-spin text-primary w-8 h-8" /></MobileLayout>;
  }

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected': return <XCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-orange-600" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return "bg-green-50 border-green-200 text-green-700";
      case 'rejected': return "bg-red-50 border-red-200 text-red-700";
      default: return "bg-orange-50 border-orange-200 text-orange-700";
    }
  };

  return (
    <MobileLayout>
      <div className="px-6 py-8">
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Claims History</h1>
        
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mb-8 flex justify-between items-center">
          <span className="text-sm font-semibold text-primary">Total Paid Out</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(history.totalPaid)}</span>
        </div>

        {history.claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No claims yet</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-[250px]">
              When you file a claim for weather or traffic delays, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.claims.map((claim) => (
              <div key={claim.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ID: {claim.claimId}</span>
                    <h4 className="font-bold text-gray-900 mt-1 capitalize">{claim.plan} Plan Claim</h4>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold capitalize", getStatusClass(claim.status))}>
                    {getStatusIcon(claim.status)}
                    {claim.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <span className="text-xs text-gray-500 font-medium block mb-1">Risk Score</span>
                    <span className="font-bold text-gray-900">{claim.riskScore}/100</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <span className="text-xs text-gray-500 font-medium block mb-1">Payout</span>
                    <span className="font-bold text-gray-900">{formatCurrency(claim.payoutAmount)}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400 font-medium text-right">
                  Filed on {format(new Date(claim.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
