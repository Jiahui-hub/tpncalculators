import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const tiles = [
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
      title: "TPN Assistant",
      description: "Osmolarity & Ca-PO4 Compatibility",
      route: "/calculators/tpn-assistant",
      icon: "💧",
    },
    {
      title: "Nutrition Goals (ESPEN/ASPEN)",
      description: "Calculate Kcal/Protein targets & EN Gap",
      route: "/calculators/nutrition-goals",
      icon: "🎯",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 md:p-10 font-sans">
      <h1 className="mb-2 text-4xl text-slate-900 font-black text-center tracking-tight">
        TPN Calculators
      </h1>
      <p className="text-slate-500 mb-10 text-center text-sm font-medium">Hospital Canselor Tuanku Muhriz (UKM)</p>

      {/* Container for tiles */}
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {tiles.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full flex flex-col items-center transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-indigo-200"
            onClick={() => navigate(item.route)}
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h2 className="mb-1 text-slate-900 text-lg font-bold">{item.title}</h2>
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
    </div>
  );
}