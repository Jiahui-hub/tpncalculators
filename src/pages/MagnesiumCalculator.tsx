import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function MagnesiumCalculator() {
  const navigate = useNavigate();

  const [weight, setWeight] = useState("");
  const [currentMg, setCurrentMg] = useState("");
  const [targetMg, setTargetMg] = useState("0.9");

  const deficit =
    weight && currentMg && targetMg
      ? (Number(targetMg) - Number(currentMg)) * Number(weight) * 0.2
      : 0;

  const mmolPerGram = 4;
  const gramsRequired = deficit > 0 ? deficit / mmolPerGram : 0;
  const volumeML = deficit > 0 ? gramsRequired / 0.493 : 0; // 49.3% = 493mg/mL

  const suggestedAmpoules = Math.ceil(volumeML / 5);
  let suggestedDoseText: ReactNode = null;

  if (deficit > 0) {
    if (deficit <= 10) {
      suggestedDoseText = (
        <div className="text-left space-y-2">
          <p>• <b>IM:</b> Can be given undiluted (max 5mL per injection site).</p>
          <p>• <b>IV:</b> Dilute in 100mL NS and infuse over 30–60 minutes.</p>
        </div>
      );
    } else {
      const minDiluent = Math.ceil((volumeML / 5) * 7.5);
      const minHours = deficit / 8; // 8 mmol = 2g
      suggestedDoseText = (
        <div className="text-left space-y-2">
          <p>• <b>IV Infusion:</b> Dilute in 250mL NS (min. {minDiluent}mL diluent required).</p>
          <p>• Infuse over {Math.max(2, Math.ceil(minHours))}–{Math.max(3, Math.ceil(minHours) + 1)} hours (Max 2g/hr).</p>
          <p className="text-[10px] opacity-80 italic mt-1">Note: Maintain ratio of 7.5mL diluent per 5mL ampoule.</p>
        </div>
      );
    }
  }

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
          Magnesium Deficit Calculator
        </h1>

        <div className="space-y-8">
          {/* Formula Section */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
            <h2 className="text-lg font-bold text-indigo-900 mb-2">Formula used:</h2>
            <p className="text-indigo-800">
              <b>Mg deficit (mmol)</b> = (Target Mg − Measured Mg) × Weight (kg) × 0.2
            </p>
            <p className="text-xs text-indigo-600 mt-2 italic">Note: 1 mmol/L = 1 mEq/L</p>
          </div>

          {/* Inputs - Simplified to 1 column vertical flow */}
          <div className="space-y-4 max-w-md mx-auto">
            <Input label="Body weight (kg)" value={weight} setValue={setWeight} />
            <Input label="Measured magnesium (mmol/L)" value={currentMg} setValue={setCurrentMg} />
            <Input label="Target magnesium (mmol/L)" value={targetMg} setValue={setTargetMg} />
          </div>

          {/* Result Card */}
          {deficit > 0 && (
            <div className="p-8 rounded-2xl border border-green-200 bg-green-50 shadow-inner text-center space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-green-700 font-bold mb-1">Total Deficit</p>
                <h2 className="text-4xl font-black text-green-900">
                  {deficit.toFixed(1)} <span className="text-xl font-bold">mmol</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-green-200/50">
                <div>
                  <p className="text-[10px] uppercase text-green-600 font-bold">Grams Required</p>
                  <p className="text-xl font-bold text-green-800">{gramsRequired.toFixed(2)} g</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-green-600 font-bold">Volume (49.3%)</p>
                  <p className="text-xl font-bold text-green-800">{volumeML.toFixed(1)} mL</p>
                </div>
              </div>

              <div className="space-y-3 text-green-800">
                <p className="text-lg font-bold">Approx. {suggestedAmpoules} ampoule(s)</p>
                <p className="text-xs opacity-75">(5 mL per ampoule)</p>
                <div className="bg-white/50 p-4 rounded-xl text-sm font-medium border border-green-200">
                  <p className="text-xs uppercase tracking-tighter opacity-70 mb-2 border-b border-green-200/50 pb-1">Administration Guide</p>
                  {suggestedDoseText}
                </div>
              </div>
            </div>
          )}

          {/* Info Sections - Simplified to 1 column vertical flow */}
          <div className="space-y-6">
            <SectionCard title="Dose" content={
              <div className="space-y-3 text-sm">
                <p className="font-bold text-gray-700">Mild hypomagnesaemia:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>IM: 1g (4 mmol) every 6 hours for 4 doses, or 250 mg/kg may be given within a period of 4 hours if necessary.</li>
                </ul>
                <p className="font-bold text-gray-700 mt-2">Severe hypomagnesaemia:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>IM: 0.25 g/kg over 4 hours.</li>
                  <li>IV infusion: 5g added in 1L of NS/D5 over 3–4 hours.</li>
                </ul>
                <p className="font-bold text-gray-700 mt-2">Total Daily Dose:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>30–40 g per 24 hours.</li>
                </ul>
              </div>
            } />
            <SectionCard title="Administration" content={
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Fast correction: 1 amp in 100 mL NS/D5% over 1 hour.</li>
                <li>IV dose: Each 5mL amp should be diluted by adding at least 7.5 mL of diluent.</li>
                <li>Max rate: 2g/hr to avoid hypotension.</li>
                <li>IM: Use diluted or undiluted. If to be diluted, add 1 amp to 5mL of diluent.</li>
              </ul>
            } />
            <SectionCard title="Notes" content={
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>MgSO₄ 1 g = 4 mmol Mg²⁺</li>
                <li>Each 5 mL contains 10 mmol MgSO₄.</li>
                <li>1 mL = 493 mg MgSO₄ (2 mmol = 4 mEq Mg)</li>
                <li>Mg²⁺ may be lower in significant hypoalbuminemia.</li>
              </ul>
            } />
          </div>

          {/* Standardized References */}
          <div className="mt-8 text-xs text-slate-500 border-t pt-6">
            <h2 className="font-bold text-sm text-gray-700 mb-2">References</h2>
            <p>Chan, P. D., & Winkle, C. R. (2015). Current clinical strategies: Internal medicine (2015 ed.). Current Clinical Strategies Publishing.</p>
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

function Input({ label, value, setValue }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1 text-gray-700">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        placeholder="—"
      />
    </div>
  );
}

function SectionCard({ title, content }: { title: string; content: ReactNode }) {
  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-md font-bold mb-3 text-gray-800 uppercase tracking-wide">{title}</h3>
      <div className="text-gray-600">{content}</div>
    </div>
  );
}
