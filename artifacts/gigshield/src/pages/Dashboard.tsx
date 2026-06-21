import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { RiskGauge } from "@/components/RiskGauge";
import { Button } from "@/components/ui/Button";
import { 
  useGetUser, 
  useGetEnvironmentData, 
  useCalculateRiskScore,
  useSubmitClaim
} from "@workspace/api-client-react";
import { CloudRain, ThermometerSun, Wind, Car, AlertOctagon, ShieldAlert, Loader2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { deliveryId } = useAuth();
  
  // Data fetching
  const { data: user, isLoading: loadingUser } = useGetUser(deliveryId || "", {
    query: { enabled: !!deliveryId }
  });
  
  const { data: envData, isFetching: loadingEnv } = useGetEnvironmentData({
    query: { refetchInterval: 5000 } // Refetch every 5 seconds
  });

  const { mutate: calculateScore, data: scoreResult, isPending: calculating } = useCalculateRiskScore();
  const { mutate: submitClaim, isPending: claiming } = useSubmitClaim();

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimStep, setClaimStep] = useState<"idle" | "verifying" | "result">("idle");
  const [claimResult, setClaimResult] = useState<any>(null);

  // Auto-calculate score when envData or plan changes
  useEffect(() => {
    if (user?.plan && envData) {
      calculateScore({
        data: {
          plan: user.plan as any,
          deliveryId: user.deliveryId,
          environmentData: envData
        }
      });
    }
  }, [user?.plan, envData, calculateScore]);

  const handleManualRefresh = () => {
    if (user?.plan && envData) {
      calculateScore({
        data: {
          plan: user.plan as any,
          deliveryId: user.deliveryId,
          environmentData: envData
        }
      });
    }
  };

  const handleFileClaim = () => {
    setClaimModalOpen(true);
    setClaimStep("verifying");
    
    // Simulate GPS verification delay
    setTimeout(() => {
      if (!user || !scoreResult) return;
      
      submitClaim({
        data: {
          deliveryId: user.deliveryId,
          plan: user.plan as any,
          riskScore: scoreResult.score,
          currentLatitude: 12.9716, // Mock location
          currentLongitude: 77.5946
        }
      }, {
        onSuccess: (res) => {
          setClaimResult(res);
          setClaimStep("result");
        },
        onError: () => {
          setClaimResult({ success: false, reason: "Failed to process claim network error." });
          setClaimStep("result");
        }
      });
    }, 2000);
  };

  if (loadingUser || !user) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  const currentScore = scoreResult?.score || 0;
  const isEligible = user.isEligibleForClaim;
  const canClaim = isEligible && currentScore >= 40;

  return (
    <MobileLayout>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-sm font-medium text-gray-500">Welcome back,</p>
            <h1 className="text-2xl font-display font-bold text-gray-900">{user.name}</h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Plan</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold capitalize">
              {user.plan}
            </span>
          </div>
        </div>

        {/* Main Gauge Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/5 border border-gray-100 relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 p-4">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              loadingEnv || calculating ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${loadingEnv || calculating ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
              {loadingEnv || calculating ? 'Updating...' : 'Live'}
            </div>
          </div>
          
          <RiskGauge score={currentScore} />

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 font-medium mb-1">Expected Payout Tier</p>
            <div className="inline-block px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 font-bold text-gray-800">
              {scoreResult?.payoutDescription || "No Payout Expected"}
            </div>
          </div>
        </div>

        {/* Environmental Factors */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-gray-900">Live Environment</h2>
            <button 
              onClick={handleManualRefresh}
              disabled={calculating || loadingEnv}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Refresh Data
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <EnvBar icon={CloudRain} label="Rain Intensity" value={envData?.rain || 0} color="bg-blue-500" />
            <EnvBar icon={ThermometerSun} label="Temperature" value={envData?.temp || 0} color="bg-orange-500" />
            <EnvBar icon={Wind} label="Pollution (AQI)" value={envData?.pollution || 0} color="bg-gray-500" />
            <EnvBar icon={Car} label="Traffic Congestion" value={envData?.traffic || 0} color="bg-red-500" />
            <EnvBar icon={AlertOctagon} label="Strike Probability" value={envData?.strike || 0} color="bg-purple-500" />
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center">
          {!isEligible && (
            <div className="flex items-start gap-3 mb-4 p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100 w-full">
              <ShieldAlert className="shrink-0 mt-0.5" size={20} />
              <p className="text-sm font-medium">Account must be active for 3 weeks before filing claims. Standard cooling period applies.</p>
            </div>
          )}
          
          <Button 
            size="xl" 
            className="w-full text-lg shadow-xl"
            disabled={!canClaim}
            onClick={handleFileClaim}
          >
            File a Claim Now
          </Button>
          {!canClaim && isEligible && (
            <p className="text-xs text-gray-500 mt-3 font-medium text-center">
              Risk score must be above 40 to file a claim.
            </p>
          )}
        </div>
      </div>

      {/* Claim Modal Overlay */}
      <AnimatePresence>
        {claimModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pb-safe bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white w-full sm:max-w-sm rounded-[2rem] p-6 shadow-2xl"
            >
              {claimStep === "verifying" && (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative z-10 text-primary">
                      <MapPin size={32} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Verifying Location</h3>
                  <p className="text-gray-500 text-sm">Checking if you are currently in your registered {user.zone} zone...</p>
                </div>
              )}

              {claimStep === "result" && claimResult && (
                <div className="flex flex-col items-center py-4 text-center">
                  {claimResult.success ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Claim Approved!</h3>
                      <div className="text-4xl font-display font-bold text-green-500 mb-4">
                        {formatCurrency(claimResult.payoutAmount || 0)}
                      </div>
                      <p className="text-gray-600 mb-6">{claimResult.reason}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertOctagon size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Claim Rejected</h3>
                      <p className="text-gray-600 mb-6">{claimResult.reason || claimResult.rejectionReason}</p>
                    </>
                  )}
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      setClaimModalOpen(false);
                      // In a real app, we'd invalidate queries here to refresh wallet/history
                    }}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </MobileLayout>
  );
}

function EnvBar({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${color.replace('bg-', 'bg-').replace('500', '50')} ${color.replace('bg-', 'text-').replace('50', '600')}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="text-xs font-bold text-gray-900">{Math.round(value)}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

// Need CheckCircle for the modal since it wasn't imported from lucide
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinelinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
