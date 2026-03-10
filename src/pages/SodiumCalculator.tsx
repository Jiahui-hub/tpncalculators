import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function SodiumCalculator() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"hypo" | "hyper">("hypo");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState(70);
  const [serumNa, setSerumNa] = useState(125);
  const [targetNa, setTargetNa] = useState(132);
  const [infusateNa, setInfusateNa] = useState(154);
  const [pints, setPints] = useState(2);
  const [hours, setHours] = useState(24);

  // Estimated Total Body Water
  const totalBodyWaterFactor = sex === "male" ? 0.6 : 0.5;
  const totalBodyWater = weight * totalBodyWaterFactor;

  // Adrogue-Madias equation
  const deltaNaPerL = (infusateNa - serumNa) / (totalBodyWater + 1);

  const rawChange = targetNa - serumNa;
  const maxCorrection = 12;
  const plannedChange = Math.min(Math.abs(rawChange), maxCorrection);

  // Volume required to achieve SAFE correction
  const volumeRequired = deltaNaPerL !== 0 ? plannedChange / Math.abs(deltaNaPerL) : 0;

  // Infusion rate over 24h
  const infusionRate = volumeRequired > 0 ? (volumeRequired * 1000) / 24 : 0;

  // Free Water Deficit (Hypernatremia only)
  const freeWaterDeficit = mode === "hyper" ? totalBodyWater * (serumNa / targetNa - 1) : 0;

  // Simulator Logic
  const simVolumeL = pints * 0.5;
  const simTotalCorrection = simVolumeL * deltaNaPerL;
  const simRate = hours > 0 ? (simVolumeL * 1000) / hours : 0;
  const simCorrectionPerHour = hours > 0 ? Math.abs(simTotalCorrection) / hours : 0;

  const isSimDangerous = Math.abs(simTotalCorrection) > 12 || simCorrectionPerHour > 0.5;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl">
        {/* Standardized Home Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md text-white font-semibold mb-8 transition-transform hover:scale-105"
        >
          <span className="w-4 h-4"><FiArrowLeft /></span>
          Back to Home
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          Sodium Management Calculator
        </h1>

        <div className="space-y-6">
          {/* Inputs - Simplified to 1 column vertical flow */}
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Clinical Scenario</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={mode}
                onChange={(e) => setMode(e.target.value as "hypo" | "hyper")}
              >
                <option value="hypo">Hyponatremia</option>
                <option value="hyper">Hypernatremia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sex</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={sex}
                onChange={(e) => setSex(e.target.value as "male" | "female")}
              >
                <option value="male">Male (0.6 × weight)</option>
                <option value="female">Female (0.5 × weight)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={weight === 0 ? "" : weight}
                placeholder="0"
                onChange={(e) => setWeight(e.target.value === "" ? 0 : Number(e.target.value))}
              />
              <p className="mt-1 text-[10px] text-gray-500 italic">
                * For obese patients, consider using Adjusted Body Weight (AdjBW) for more accurate TBW estimation.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Current Na⁺ (mmol/L)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={serumNa === 0 ? "" : serumNa}
                placeholder="0"
                onChange={(e) => setSerumNa(e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Target Na⁺ (mmol/L)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={targetNa === 0 ? "" : targetNa}
                placeholder="0"
                onChange={(e) => setTargetNa(e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Intravenous Fluid</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={infusateNa}
                onChange={(e) => setInfusateNa(+e.target.value)}
              >
                {mode === "hypo" && (
                  <>
                    <option value={154}>0.9% Sodium Chloride (154 mmol/L)</option>
                    <option value={513}>3% Hypertonic Saline (513 mmol/L)</option>
                  </>
                )}
                {mode === "hyper" && (
                  <>
                    <option value={0}>5% Dextrose in Water (0 mmol/L)</option>
                    <option value={38.5}>0.225% Sodium Chloride (38.5 mmol/L)</option>
                    <option value={77}>0.45% Sodium Chloride (77 mmol/L)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Results Section - Simplified to 1 column */}
          <div className="bg-slate-100 p-6 rounded-2xl space-y-4 shadow-inner border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-2">Target-Based Recommendation</h2>
            <div className="space-y-3">
              <p className="text-gray-700">Estimated Total Body Water: <b className="text-gray-900">{totalBodyWater.toFixed(1)} L</b></p>
              <p className="text-gray-700">Planned Na⁺ Correction (24h): <b className="text-gray-900">{plannedChange.toFixed(1)} mmol/L</b></p>
              <p className="text-gray-700">Predicted Na⁺ Change per 1 L: <b className="text-gray-900">{deltaNaPerL.toFixed(2)} mmol/L</b></p>
              <p className="text-gray-700">Suggested Infusion Rate: <b className="text-indigo-700 text-lg">{infusionRate > 0 ? infusionRate.toFixed(0) : 0} mL/hour</b></p>
              {mode === "hyper" && (
                <p className="text-gray-700">Estimated Free Water Deficit: <b className="text-gray-900">{freeWaterDeficit.toFixed(2)} L</b></p>
              )}
            </div>

            {/* Alerts */}
            <div className="pt-2">
              {mode === "hypo" && infusateNa === 154 && (
                <p className="text-orange-600 font-medium flex items-center gap-2">
                  <span>⚠</span> 0.9% saline may be insufficient to significantly raise sodium. Consider hypertonic saline if clinically indicated.
                </p>
              )}

              {Math.abs(rawChange) > maxCorrection && (
                <p className="text-red-600 font-semibold flex items-center gap-2">
                  <span>⚠</span> Target exceeds safe 24-hour correction limit. Correction automatically capped at {maxCorrection} mmol.
                </p>
              )}

              {Math.abs(rawChange) <= maxCorrection && rawChange !== 0 && (
                <p className="text-green-600 font-medium flex items-center gap-2">
                  <span>✓</span> Within recommended correction limits.
                </p>
              )}
            </div>
          </div>

          {/* Pint Simulator Section */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-indigo-900 border-b border-indigo-200 pb-2 flex items-center gap-2">
              <span>🧪</span> Pint Simulator (Manual Order)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Number of Pints (500mL)</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPints(p)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        pints === p 
                        ? "bg-indigo-600 text-white shadow-md scale-110" 
                        : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Infusion Duration (Hours)</label>
                <input
                  type="number"
                  value={hours === 0 ? "" : hours}
                  placeholder="0"
                  onChange={(e) => setHours(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
                  className="w-full border border-indigo-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
                />
              </div>
            </div>

            <div className={`p-4 rounded-xl border transition-colors ${isSimDangerous ? "bg-red-100 border-red-200" : "bg-white border-indigo-100"}`}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Total Na⁺ Change</p>
                  <p className={`text-2xl font-black ${isSimDangerous ? "text-red-700" : "text-indigo-900"}`}>
                    {Math.abs(simTotalCorrection).toFixed(1)} <span className="text-sm font-bold">mmol/L</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Infusion Rate</p>
                  <p className="text-2xl font-black text-indigo-900">
                    {simRate.toFixed(0)} <span className="text-sm font-bold">mL/hr</span>
                  </p>
                </div>
              </div>
              
              {isSimDangerous && (
                <div className="mt-3 pt-3 border-t border-red-200 text-red-800 text-xs font-bold flex items-start gap-2">
                  <span>⚠</span>
                  <span>
                    {Math.abs(simTotalCorrection) > 12 
                      ? "EXCEEDS 12 mmol/L LIMIT! Risk of osmotic demyelination or cerebral edema." 
                      : "CORRECTION RATE TOO FAST! (>0.5 mmol/L/hr). Consider increasing duration."}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Important Clinical Notes</h2>
            <ul className="list-disc ml-5 space-y-2 text-sm text-gray-600">
              <li>Do not exceed 10–12 mmol/L increase in 24 hours for hyponatremia (risk of ODS).</li>
              <li>Hypernatremia correction should generally not exceed 12 mmol/L per 24 hours.</li>
              <li>High-risk patients (e.g., malnutrition, alcoholism) require slower correction (≤6–8 mmol/L per day).</li>
              <li>For obese patients, using <b>Adjusted Body Weight (AdjBW)</b> is recommended to avoid overestimating Total Body Water (TBW).</li>
              <li>Monitor serum sodium every 4–6 hours during active correction.</li>
            </ul>
          </div>

          {/* Standardized References */}
          <div className="mt-8 text-xs text-slate-500 border-t pt-6">
            <h2 className="font-bold text-sm text-gray-700 mb-2">References</h2>
            <p className="mb-1">Adrogué HJ, Madias NE. Hyponatremia. New England Journal of Medicine. 2000.</p>
            <p>European Clinical Practice Guideline on Hyponatremia (2014).</p>
          </div>

          {/* Standardized Disclaimer */}
          <div className="mt-8 text-[10px] sm:text-xs text-gray-500 text-center">
            <p className="font-bold mb-1 uppercase tracking-wider">Disclaimer</p>
            <p>Use as a guide. Calculations are for reference only. Always verify and consult clinical judgment before clinical application.</p>
          </div>
        </div>
      </div>
    </div>
  );
}