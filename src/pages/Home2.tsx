import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiLogOut } from "react-icons/fi";

export default function Home() {
  const navigate = useNavigate();
  const [accessLevel, setAccessLevel] = useState<string | null>(localStorage.getItem("tpn_app_access"));
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const allTiles = [
    {
      title: "IBW & AdjBW Calculator",
      description: "Calculate Ideal Body Weight & Adjusted Body Weight",
      route: "/calculators/ibw-adjbw",
      icon: "🧍‍♂️",
    },
    {
      title: "Potassium Calculator",
      description: "Estimate potassium deficit safely",
      route: "/calculators/potassium",
      icon: "🧪",
    },
    {
      title: "Sodium Calculator",
      description: "Correct sodium safely",
      route: "/calculators/sodium",
      icon: "🧂",
    },
    {
      title: "Magnesium Calculator",
      description: "Check magnesium safely",
      route: "/calculators/magnesium",
      icon: "⚗️",
    },
    {
      title: "Malnutrition Screening",
      description: "GLIM, NRS 2002 & MUST tools",
      route: "/calculators/malnutrition-screening",
      icon: "📋",
    },
    {
      title: "TPN Assistant",
      description: "Osmolarity & Ca-PO4 Compatibility",
      route: "/calculators/tpn-assistant",
      icon: "💧",
      premiumOnly: true,
    },
    {
      title: "Nutrition Goals (ESPEN/ASPEN)",
      description: "Calculate Kcal/Protein targets & EN Gap",
      route: "/calculators/nutrition-goals",
      icon: "🎯",
    },
  ];

  const tiles = allTiles.filter(tile => {
    if (tile.premiumOnly && accessLevel !== "full") {
      return false;
    }
    return true;
  });

  const handleTileClick = (route: string) => {
    navigate(route);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "4869") {
      setAccessLevel("standard");
      localStorage.setItem("tpn_app_access", "standard");
      localStorage.setItem("pharmacistMode", "true");
      setError("");
      setPasscode("");
    } else if (passcode === "8899") {
      setAccessLevel("full");
      localStorage.setItem("tpn_app_access", "full");
      localStorage.setItem("pharmacistMode", "true");
      setError("");
      setPasscode("");
    } else {
      setError("Incorrect passcode. Access denied.");
      setPasscode("");
    }
  };

  const handleLock = () => {
    localStorage.removeItem("tpn_app_access");
    localStorage.removeItem("pharmacistMode");
    sessionStorage.removeItem("tpn_authorized");
    setAccessLevel(null);
  };

  if (!accessLevel) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-950 text-indigo-400 border border-indigo-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <FiLock size={32} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">HCTM TPN Calculators</h2>
            <p className="text-slate-400 text-sm mt-2">
              Please enter your clinical passcode to unlock.
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
                Clinical Passcode
              </label>
              <input 
                type="password"
                autoFocus
                className={`w-full p-4 text-center text-2xl font-black tracking-[1em] border rounded-2xl outline-none transition-all ${
                  error 
                    ? "border-rose-500/50 bg-rose-950/20 text-rose-400" 
                    : "border-slate-800 bg-slate-950 focus:border-indigo-500/50 text-white"
                }`}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError("");
                }}
                maxLength={4}
                placeholder="****"
              />
              {error && (
                <p className="text-xs text-rose-400 font-bold text-center mt-2 animate-pulse">
                  {error}
                </p>
              )}
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
              disabled={passcode.length < 4}
            >
              Verify Clinical Role
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/60">
            <p className="text-[10px] text-slate-500">
              Hospital Canselor Tuanku Muhriz (UKM)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 md:p-10 font-sans relative">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <button 
          onClick={handleLock}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-600 text-xs font-bold transition-all shadow-sm active:scale-95"
          title="Lock Portal"
        >
          <FiLogOut size={14} />
          Lock App
        </button>
      </div>

      <h1 className="mb-2 text-4xl text-slate-900 font-black text-center tracking-tight">
        TPN Calculators
      </h1>
      <p className="text-slate-500 mb-2 text-center text-sm font-medium">Hospital Canselor Tuanku Muhriz (UKM)</p>
      <p className="text-indigo-600 mb-10 text-center text-[10px] font-bold uppercase tracking-widest">
        For HCTM staff use only ({accessLevel === "full" ? "Full Access" : "Standard Access"})
      </p>

      {/* Container for tiles */}
      <div className="flex flex-col items-center gap-4 w-full max-w-lg flex-1">
        {tiles.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 w-full flex flex-col items-center transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-md"
            onClick={() => handleTileClick(item.route)}
          >
            <div className="relative w-full flex justify-center items-center">
              <div className="text-3xl mb-3">{item.icon}</div>
            </div>
            <h2 className="mb-1 text-slate-900 text-lg font-bold text-center">{item.title}</h2>
            <p className="m-0 text-slate-500 text-center text-xs font-medium">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-12 max-w-md p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Clinical Disclaimer</p>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          Calculations are for reference only. Always verify with hospital protocols and consult senior clinical judgment before implementation.
        </p>
      </div>

      {/* Footer credits */}
      <div className="mt-8 text-center">
        <p className="text-[11px] text-slate-400 font-semibold tracking-wide">
          Developed by Lim Jia Hui (RPh. 27382)
        </p>
      </div>
    </div>
  );
}
