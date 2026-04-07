import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiUnlock, FiX } from "react-icons/fi";

export default function Home() {
  const navigate = useNavigate();
  const [isPharmacistMode, setIsPharmacistMode] = useState(localStorage.getItem("pharmacistMode") === "true");
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [error, setError] = useState("");

  const tiles = [
    {
      title: "IBW & AdjBW Calculator",
      description: "Calculate Ideal Body Weight & Adjusted Body Weight",
      route: "/calculators/ibw-adjbw",
      icon: "🧍‍♂️",
      protected: false,
    },
    {
      title: "Potassium Calculator",
      description: "Estimate potassium deficit safely",
      route: "/calculators/potassium",
      icon: "🧪",
      protected: false,
    },
    {
      title: "Sodium Calculator",
      description: "Correct sodium safely",
      route: "/calculators/sodium",
      icon: "🧂",
      protected: false,
    },
    {
      title: "Magnesium Calculator",
      description: "Check magnesium safely",
      route: "/calculators/magnesium",
      icon: "⚗️",
      protected: false,
    },
    {
      title: "TPN Assistant",
      description: "Osmolarity & Ca-PO4 Compatibility",
      route: "/calculators/tpn-assistant",
      icon: "💧",
      protected: true,
    },
    {
      title: "Nutrition Goals (ESPEN/ASPEN)",
      description: "Calculate Kcal/Protein targets & EN Gap",
      route: "/calculators/nutrition-goals",
      icon: "🎯",
      protected: true,
    },
  ];

  const handleTileClick = (item: typeof tiles[0]) => {
    if (item.protected && !isPharmacistMode) {
      setPendingRoute(item.route);
      setShowPasscodeModal(true);
    } else {
      navigate(item.route);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "4869") {
      setIsPharmacistMode(true);
      localStorage.setItem("pharmacistMode", "true");
      setShowPasscodeModal(false);
      setPasscode("");
      setError("");
      if (pendingRoute) {
        navigate(pendingRoute);
        setPendingRoute(null);
      }
    } else {
      setError("Incorrect passcode. Access denied.");
      setPasscode("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 md:p-10 font-sans">
      <h1 className="mb-2 text-4xl text-slate-900 font-black text-center tracking-tight">
        TPN Calculators
      </h1>
      <p className="text-slate-500 mb-2 text-center text-sm font-medium">Hospital Canselor Tuanku Muhriz (UKM)</p>
      <p className="text-indigo-600 mb-10 text-center text-[10px] font-bold uppercase tracking-widest">For HCTM staff use only</p>

      {/* Container for tiles */}
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {tiles.map((item, index) => (
          <div
            key={index}
            className={`bg-white p-6 rounded-2xl shadow-sm border w-full flex flex-col items-center transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-md ${
              item.protected && !isPharmacistMode ? "border-slate-200 opacity-90" : "border-slate-200 hover:border-indigo-200"
            }`}
            onClick={() => handleTileClick(item)}
          >
            <div className="relative w-full flex justify-center items-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              {item.protected && (
                <div className={`absolute top-0 right-0 p-1.5 rounded-full ${isPharmacistMode ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  {isPharmacistMode ? <FiUnlock size={14} /> : <FiLock size={14} />}
                </div>
              )}
            </div>
            <h2 className="mb-1 text-slate-900 text-lg font-bold">{item.title}</h2>
            <p className="m-0 text-slate-500 text-center text-xs font-medium">{item.description}</p>
            {item.protected && !isPharmacistMode && (
              <span className="mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pharmacist Mode Required</span>
            )}
          </div>
        ))}
      </div>

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => { setShowPasscodeModal(false); setError(""); setPasscode(""); }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FiX size={20} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiLock size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Pharmacist Mode</h3>
              <p className="text-sm text-slate-500 mt-1">Enter passcode to unlock clinical tools</p>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <input 
                  type="password"
                  autoFocus
                  className={`w-full p-4 bg-slate-50 border rounded-2xl text-center text-2xl tracking-[1em] font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    error ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••"
                  maxLength={4}
                />
                {error && <p className="text-center text-xs font-bold text-red-500 mt-3">{error}</p>}
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                Unlock Access
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-12 max-w-md p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Clinical Disclaimer</p>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          Calculations are for reference only. Always verify with hospital protocols and consult senior clinical judgment before implementation.
        </p>
      </div>
    </div>
  );
}
