import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function BodyWeightCalculator() {
  const navigate = useNavigate();
  const [sex, setSex] = useState<"male" | "female">("male");
  const [height, setHeight] = useState(170); // cm
  const [weight, setWeight] = useState(70); // kg

  // IBW (Devine Formula - Metric)
  const heightOver152 = Math.max(0, height - 152.4);
  const ibw = sex === "male" 
    ? 50 + (0.91 * heightOver152) 
    : 45.5 + (0.91 * heightOver152);

  // BMI
  const bmi = weight / ((height / 100) ** 2);

  // BMI Category (Malaysia guideline)
  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: "Underweight", color: "text-blue-600" };
    if (bmiValue < 23.0) return { label: "Normal", color: "text-green-600" };
    if (bmiValue < 27.5) return { label: "Overweight", color: "text-orange-600" };
    return { label: "Obese", color: "text-red-600" };
  };

  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md text-white font-semibold mb-8 transition-transform hover:scale-105"
        >
          <FiArrowLeft /> Back to Home
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          IBW & AdjBW Calculator
        </h1>

        <div className="space-y-6">
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sex</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={sex}
                onChange={(e) => setSex(e.target.value as "male" | "female")}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={height === 0 ? "" : height}
                placeholder="0"
                onChange={(e) => setHeight(e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Actual Weight (kg)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={weight === 0 ? "" : weight}
                placeholder="0"
                onChange={(e) => setWeight(e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </div>
          </div>

          <div className="bg-slate-100 p-6 rounded-2xl space-y-4 shadow-inner border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-2 text-center">Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl text-center border border-slate-200">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Ideal Body Weight (IBW)</p>
                <p className="text-2xl font-black text-indigo-900">{ibw.toFixed(1)} <span className="text-sm">kg</span></p>
              </div>
              <div className="bg-white p-4 rounded-xl text-center border border-slate-200">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">BMI</p>
                <p className="text-2xl font-black text-indigo-900">{bmi.toFixed(1)} <span className="text-sm">kg/m²</span></p>
                <p className={`text-[10px] font-bold mt-1 ${bmiCategory.color}`}>{bmiCategory.label}</p>
              </div>
            </div>

            {/* Adjusted Body Weight */}
            {(() => {
              const isObese = weight > (ibw * 1.2);
              const adjbw = ibw + 0.4 * (weight - ibw);
              return (
                <div className={`p-4 rounded-xl border transition-colors ${isObese ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200"}`}>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Adjusted Body Weight (AdjBW)</p>
                    <p className={`text-3xl font-black ${isObese ? "text-indigo-700" : "text-gray-400"}`}>
                      {adjbw.toFixed(1)} <span className="text-sm">kg</span>
                    </p>
                    {isObese ? (
                      <p className="mt-2 text-[10px] text-indigo-600 font-bold">
                        * Recommended for clinical calculations (Actual Weight &gt; 120% of IBW)
                      </p>
                    ) : (
                      <p className="mt-2 text-[10px] text-gray-400 italic">
                        * Not typically required (Actual Weight ≤ 120% of IBW)
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Clinical Formulas & References</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-bold mb-1">Formulas:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li><b>IBW:</b> Male: 50kg + 0.9 * (Height - 152.4cm); Female: 45.5kg + 0.91kg/cm * (Height - 152.4cm)</li>
                  <li><b>AdjBW:</b> IBW + 0.4 × (Actual Weight - IBW)</li>
                  <li><b>BMI (Malaysia):</b> Underweight (&lt;18.5), Normal (18.5–22.9), Overweight (23–27.4), Obese (≥27.5)</li>
                </ul>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <p className="font-bold mb-1">References:</p>
                <ul className="list-disc ml-5 space-y-1 text-[10px]">
                  <li>BMI: MEMS. (2024). MEMS quick reference guide: Management of obesity (Version May 2023).</li>
                  <li>IBW: Devine, B. J. (1974). Gentamicin therapy. DICP, 8, 650–655.</li>
                  <li>AdjBW: Bauer, L. A. (2001). Applied clinical pharmacokinetics (pp. 93–179). McGraw Hill, Medical Publishing Division.</li>
                  <li>Winter, M. E. (2004). Basic pharmacokinetics. Lippincott Williams & Williams.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 text-[10px] sm:text-xs text-gray-500 text-center">
            <p className="font-bold mb-1 uppercase tracking-wider">Disclaimer</p>
            <p>Use as a guide. Calculations are for reference only. Always verify and consult clinical judgment before clinical application.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
