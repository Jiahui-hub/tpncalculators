import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

interface Bag {
  name: string;
  volume: number; // mL
  osmolarity: number; // mOsm/L
  baseCa: number; // mmol total in bag
  basePO4: number; // mmol total in bag
  isCentral: boolean;
  aaGrams: number;
  glucoseGrams: number;
  lipidGrams: number;
}

const CONVENIENCE_BAGS: Bag[] = [
  { name: "SMOFKabiven Central (1477 mL)", volume: 1477, osmolarity: 1500, baseCa: 3.8, basePO4: 19, isCentral: true, aaGrams: 49.3, glucoseGrams: 187, lipidGrams: 56 },
  { name: "SMOFKabiven Central (986 mL)", volume: 986, osmolarity: 1500, baseCa: 2.5, basePO4: 12, isCentral: true, aaGrams: 32.9, glucoseGrams: 125, lipidGrams: 38 },
  { name: "SMOFKabiven EF (986 mL)", volume: 986, osmolarity: 1300, baseCa: 0, basePO4: 2.8, isCentral: true, aaGrams: 32.9, glucoseGrams: 125, lipidGrams: 38 },
  { name: "Nutriflex Omega Special (625 mL)", volume: 625, osmolarity: 1540, baseCa: 2.65, basePO4: 10, isCentral: true, aaGrams: 35.9, glucoseGrams: 90, lipidGrams: 25 },
  { name: "Periolimel N4E (1500 mL)", volume: 1500, osmolarity: 760, baseCa: 3.0, basePO4: 12.7, isCentral: false, aaGrams: 33, glucoseGrams: 112.5, lipidGrams: 45 },
  { name: "Manual Compounded Bag", volume: 1000, osmolarity: 0, baseCa: 0, basePO4: 0, isCentral: true, aaGrams: 0, glucoseGrams: 0, lipidGrams: 0 },
];

export default function TPNAssistant() {
  const navigate = useNavigate();
  const [selectedBagIndex, setSelectedBagIndex] = useState(0);
  const [addedNa, setAddedNa] = useState(0);
  const [addedK, setAddedK] = useState(0);
  const [addedMg, setAddedMg] = useState(0);
  const [addedCa, setAddedCa] = useState(0);
  const [addedPO4, setAddedPO4] = useState(0);
  
  // Standard Additives
  const [hasAddaven, setHasAddaven] = useState(false);
  const [hasVitamins, setHasVitamins] = useState(false); // Soluvit + Vitalipid
  const [glutamineVolume, setGlutamineVolume] = useState(0); // Dipeptiven mL
  const [infusionHours, setInfusionHours] = useState(24);

  // Manual Bag Inputs
  const [manualDextroseVol, setManualDextroseVol] = useState(0);
  const [manualAAVol, setManualAAVol] = useState(0);
  const [manualLipidVol, setManualLipidVol] = useState(0);
  const [manualWaterVol, setManualWaterVol] = useState(0);

  const currentBag = CONVENIENCE_BAGS[selectedBagIndex];
  const isManual = currentBag.name === "Manual Compounded Bag";

  const additiveVolume = (hasAddaven ? 10 : 0) + (hasVitamins ? 10 : 0) + glutamineVolume;
  const totalVolume = (isManual 
    ? (manualDextroseVol + manualAAVol + manualLipidVol + manualWaterVol) 
    : currentBag.volume) + additiveVolume;
  
  // Calculations
  const finalOsmolarity = useMemo(() => {
    let baseOsmTotal = 0;
    if (isManual) {
      // Dextrose 50%: 2.525 mOsm/mL
      // Aminoven 10%: 1.0 mOsm/mL
      // SMOFlipid 20%: 0.38 mOsm/mL
      baseOsmTotal = (manualDextroseVol * 2.525) + (manualAAVol * 1.0) + (manualLipidVol * 0.38);
    } else {
      baseOsmTotal = currentBag.osmolarity * (currentBag.volume / 1000);
    }
    
    // Additive Osmolarity Contributions:
    // Na (2), K (2), Mg (1), Ca (1), PO4 (1)
    // Addaven: ~31 mOsm per 10mL
    // Vitamins: ~10 mOsm total
    // Glutamine (Dipeptiven 20%): ~921 mOsm/L -> 0.921 mOsm/mL
    const additiveOsmTotal = 
      (addedNa * 2 + addedK * 2 + addedMg + addedCa + addedPO4) +
      (hasAddaven ? 31 : 0) +
      (hasVitamins ? 10 : 0) +
      (glutamineVolume * 0.921);

    return (baseOsmTotal + additiveOsmTotal) / (totalVolume / 1000);
  }, [isManual, currentBag, addedNa, addedK, addedMg, addedCa, addedPO4, totalVolume, manualDextroseVol, manualAAVol, manualLipidVol, manualWaterVol, hasAddaven, hasVitamins, glutamineVolume]);

  const totalCa = currentBag.baseCa + addedCa;
  const totalPO4 = currentBag.basePO4 + addedPO4;

  const isNutriflex = currentBag.name.includes("Nutriflex");
  const caConc = totalCa / (totalVolume / 1000);
  const po4Conc = totalPO4 / (totalVolume / 1000);

  const nutriflexAlerts = useMemo(() => {
    if (!isNutriflex) return [];
    const alerts = [];

    // Specific manufacturer limits from photo for Nutriflex Omega Special
    const limits = currentBag.volume === 625 
      ? { naK: 68, ca: 1.4, mg: 3.4, po4: 18.8 }
      : currentBag.volume === 1250 
        ? { naK: 136, ca: 2.7, mg: 6.7, po4: 37.5 }
        : null;

    if (limits) {
      if ((addedNa + addedK) > limits.naK) {
        alerts.push({
          level: 1,
          title: "MAX Na + K ADDITION EXCEEDED",
          details: `Total Na+K added: ${addedNa + addedK} mmol. Manufacturer Limit: ${limits.naK} mmol.`,
          action: "Reduce Sodium or Potassium top-up."
        });
      }
      if (addedCa > limits.ca) {
        alerts.push({
          level: 2,
          title: "MAX CALCIUM ADDITION EXCEEDED",
          details: `Calcium added: ${addedCa} mmol. Manufacturer Limit: ${limits.ca} mmol.`,
          action: "Reduce Calcium top-up to maintain stability."
        });
      }
      if (addedMg > limits.mg) {
        alerts.push({
          level: 1,
          title: "MAX MAGNESIUM ADDITION EXCEEDED",
          details: `Magnesium added: ${addedMg} mmol. Manufacturer Limit: ${limits.mg} mmol.`,
          action: "Reduce Magnesium top-up."
        });
      }
      if (addedPO4 > limits.po4) {
        alerts.push({
          level: 2,
          title: "MAX PHOSPHATE ADDITION EXCEEDED",
          details: `Phosphate added: ${addedPO4} mmol. Manufacturer Limit: ${limits.po4} mmol.`,
          action: "Reduce Phosphate top-up."
        });
      }
    }

    // Secondary concentration-based safety checks
    if (po4Conc > 20 && !limits) {
      alerts.push({
        level: 1,
        title: "WARNING: PHOSPHATE STABILITY",
        details: `Concentration: ${po4Conc.toFixed(1)} mmol/L. Limit: 20 mmol/L.`,
        action: "Reduce Phosphate."
      });
    }

    return alerts;
  }, [isNutriflex, currentBag.volume, addedNa, addedK, addedMg, addedCa, addedPO4, po4Conc]);

  // NPC:N Calculations
  const macronutrients = useMemo(() => {
    const glucose = isManual ? (manualDextroseVol * 0.5) : currentBag.glucoseGrams;
    const aa = (isManual ? (manualAAVol * 0.1) : currentBag.aaGrams) + (glutamineVolume * 0.2); // Dipeptiven is 20%
    const lipid = isManual ? (manualLipidVol * 0.2) : currentBag.lipidGrams;
    
    const npc = (glucose * 4) + (lipid * 9);
    const nitrogen = aa / 6.25;
    const ratio = nitrogen > 0 ? npc / nitrogen : 0;

    return { glucose, aa, lipid, npc, nitrogen, ratio };
  }, [isManual, currentBag, manualDextroseVol, manualAAVol, manualLipidVol, glutamineVolume]);
  
  // Ca-PO4 Solubility Check (Simplified clinical rule: Ca + PO4 < 30-45 mmol/L depending on AA concentration)
  // We'll use a conservative 30 mmol/L threshold for warning
  const caConcentration = totalCa / (totalVolume / 1000);
  const po4Concentration = totalPO4 / (totalVolume / 1000);
  const sumConcentration = caConcentration + po4Concentration;
  const isPrecipitationRisk = sumConcentration > 30;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md text-white font-semibold mb-8 transition-transform hover:scale-105"
        >
          <FiArrowLeft /> Back to Home
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">TPN Assistant</h1>
        <p className="text-center text-gray-500 mb-8">Osmolarity & Compatibility Check</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Configuration */}
          <div className="space-y-6">
            <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">1. Select Base Bag</h2>
              <select 
                className="w-full p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedBagIndex}
                onChange={(e) => setSelectedBagIndex(Number(e.target.value))}
              >
                {CONVENIENCE_BAGS.map((bag, i) => (
                  <option key={i} value={i}>{bag.name}</option>
                ))}
              </select>

              {isManual && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 shadow-inner">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Manual Bag Components (Volumes)</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Dextrose 50% (mL)</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                        value={manualDextroseVol === 0 ? "" : manualDextroseVol}
                        placeholder="0"
                        onChange={(e) => setManualDextroseVol(e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Aminoven 10% (mL)</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                        value={manualAAVol === 0 ? "" : manualAAVol}
                        placeholder="0"
                        onChange={(e) => setManualAAVol(e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">SMOFlipid 20% (mL)</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                        value={manualLipidVol === 0 ? "" : manualLipidVol}
                        placeholder="0"
                        onChange={(e) => setManualLipidVol(e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Sterile Water (mL)</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                        value={manualWaterVol === 0 ? "" : manualWaterVol}
                        placeholder="0"
                        onChange={(e) => setManualWaterVol(e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Base Volume</span>
                    <span className="text-sm font-black text-indigo-600">{manualDextroseVol + manualAAVol + manualLipidVol + manualWaterVol} mL</span>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">2. Additives (Top-ups)</h2>
              <div className="space-y-4">
                <AdditiveInput label="Sodium (mmol)" value={addedNa} onChange={setAddedNa} color="blue" />
                <AdditiveInput label="Potassium (mmol)" value={addedK} onChange={setAddedK} color="indigo" />
                <AdditiveInput label="Magnesium (mmol)" value={addedMg} onChange={setAddedMg} color="purple" />
                <AdditiveInput label="Calcium (mmol)" value={addedCa} onChange={setAddedCa} color="emerald" />
                <AdditiveInput label="Phosphate (mmol)" value={addedPO4} onChange={setAddedPO4} color="amber" />
              </div>
              <button 
                onClick={() => {
                  setAddedNa(0); setAddedK(0); setAddedMg(0); setAddedCa(0); setAddedPO4(0);
                  setHasAddaven(false); setHasVitamins(false); setGlutamineVolume(0);
                }}
                className="mt-6 w-full py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded border border-red-200 flex items-center justify-center gap-2"
              >
                <FiTrash2 /> Reset Additives
              </button>
            </section>

            <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">3. Other Additives</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                  <input type="checkbox" checked={hasAddaven} onChange={(e) => setHasAddaven(e.target.checked)} className="w-4 h-4 text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700">Addaven (Trace Elements)</p>
                    <p className="text-[10px] text-slate-500">10 mL ampoule (+31 mOsm)</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                  <input type="checkbox" checked={hasVitamins} onChange={(e) => setHasVitamins(e.target.checked)} className="w-4 h-4 text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700">Soluvit + Vitalipid (Vitamins)</p>
                    <p className="text-[10px] text-slate-500">10 mL total (+10 mOsm)</p>
                  </div>
                </label>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Dipeptiven (Glutamine)</p>
                      <p className="text-[10px] text-slate-500">100 mL bottle (+92 mOsm)</p>
                    </div>
                    <button 
                      onClick={() => setGlutamineVolume(glutamineVolume === 100 ? 0 : 100)}
                      className={`px-4 py-2 rounded-lg border font-bold transition-all ${
                        glutamineVolume === 100 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                          : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-500"
                      }`}
                    >
                      {glutamineVolume === 100 ? "Included" : "Add 100mL"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg space-y-6">
              <div>
                <p className="text-xs uppercase font-bold opacity-70 mb-1">Final Osmolarity</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black">{Math.round(finalOsmolarity)}</h3>
                  <span className="text-sm font-medium opacity-70">mOsm/L</span>
                </div>
                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${finalOsmolarity > 900 ? "bg-red-500/20 text-red-200" : "bg-emerald-500/20 text-emerald-200"}`}>
                  {finalOsmolarity > 900 ? <FiAlertTriangle /> : <FiCheckCircle />}
                  {finalOsmolarity > 900 ? "CENTRAL LINE ONLY" : "PERIPHERAL SAFE"}
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div>
                <p className="text-xs uppercase font-bold opacity-70 mb-3">Compatibility Check</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Ca + PO₄</span>
                    <span className={`font-bold ${isPrecipitationRisk ? "text-red-300" : "text-emerald-300"}`}>
                      {sumConcentration.toFixed(1)} mmol/L
                    </span>
                  </div>

                  {isNutriflex && nutriflexAlerts.length > 0 && (
                    <div className="space-y-3">
                      {nutriflexAlerts.map((alert, idx) => (
                        <div key={idx} className="bg-red-500/30 p-3 rounded-lg border border-red-400/50 text-[10px] leading-relaxed space-y-1">
                          <p className="font-black text-red-200 flex items-center gap-1">
                            <FiAlertTriangle /> {alert.title}
                          </p>
                          <p className="opacity-90">{alert.details}</p>
                          <p className="font-bold text-white mt-1 underline">Action: {alert.action}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isNutriflex && isPrecipitationRisk ? (
                    <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30 flex gap-3 text-xs leading-relaxed">
                      <div className="shrink-0 text-red-300 text-lg">
                        <FiAlertTriangle />
                      </div>
                      <p><b>PRECIPITATION RISK!</b> The combined concentration of Calcium and Phosphate exceeds safe limits (30 mmol/L). Risk of crystal formation.</p>
                    </div>
                  ) : !isNutriflex ? (
                    <div className="bg-emerald-500/20 p-3 rounded-lg border border-emerald-500/30 flex gap-3 text-xs leading-relaxed">
                      <div className="shrink-0 text-emerald-300 text-lg">
                        <FiCheckCircle />
                      </div>
                      <p>Calcium and Phosphate concentrations are within standard safe compatibility limits.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-500">Compounding Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Volume:</span>
                  <span className="font-bold">{totalVolume} mL</span>
                </div>
                {isManual && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Glucose (D50):</span>
                      <span className="font-bold">{(manualDextroseVol * 0.5).toFixed(1)} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amino Acids (10%):</span>
                      <span className="font-bold">{(manualAAVol * 0.1).toFixed(1)} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lipids (20%):</span>
                      <span className="font-bold">{(manualLipidVol * 0.2).toFixed(1)} g</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Calcium:</span>
                  <span className="font-bold">{totalCa.toFixed(1)} mmol</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Phosphate:</span>
                  <span className="font-bold">{totalPO4.toFixed(1)} mmol</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-slate-500">NPC:N Ratio</h3>
                <span className="text-lg font-black text-indigo-600">{macronutrients.ratio.toFixed(0)}:1</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Non-Protein Kcal:</span>
                  <span className="font-bold text-slate-700">{macronutrients.npc.toFixed(0)} kcal</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Nitrogen:</span>
                  <span className="font-bold text-slate-700">{macronutrients.nitrogen.toFixed(1)} g</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Clinical Target Guide</p>
                  <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-center">
                    <div className={`p-1.5 rounded ${macronutrients.ratio >= 80 && macronutrients.ratio < 100 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                      80-100:1
                      <br/>Severe Stress
                    </div>
                    <div className={`p-1.5 rounded ${macronutrients.ratio >= 100 && macronutrients.ratio < 130 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                      100-130:1
                      <br/>Mod. Stress
                    </div>
                    <div className={`p-1.5 rounded ${macronutrients.ratio >= 130 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                      150:1
                      <br/>Stable
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-slate-500">Flow Rate</h3>
                <span className="text-lg font-black text-indigo-600">{(totalVolume / infusionHours).toFixed(1)} mL/hr</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Infusion Duration:</span>
                  <div className="flex gap-1">
                    {[24, 16, 12].map((h) => (
                      <button
                        key={h}
                        onClick={() => setInfusionHours(h)}
                        className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                          infusionHours === h 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                    <div className="relative flex items-center">
                      <input 
                        type="number"
                        className="w-10 p-1 text-[10px] font-bold border rounded outline-none focus:ring-1 focus:ring-indigo-500"
                        value={infusionHours}
                        onChange={(e) => setInfusionHours(Math.max(1, Number(e.target.value)))}
                      />
                      <span className="absolute right-1 text-[8px] font-bold text-slate-400 pointer-events-none">h</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Based on a total volume of {totalVolume} mL.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h4 className="text-sm font-bold text-slate-800 mb-3">Sterile Unit Notes</h4>
          <ul className="text-xs text-slate-600 space-y-2 list-disc ml-4">
            <li><b>Osmolarity:</b> Peripheral lines are generally limited to &lt;900 mOsm/L. Central lines can handle &gt;900 mOsm/L.</li>
            <li><b>Compatibility:</b> Ca-PO₄ solubility is complex and depends on pH, temperature, and Amino Acid concentration. This tool uses a conservative 30 mmol/L sum threshold for most bags, with specific manufacturer limits for Nutriflex.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AdditiveInput({ label, value, onChange, color }: { label: string, value: number, onChange: (v: number) => void, color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-600 focus:ring-blue-500",
    indigo: "text-indigo-600 focus:ring-indigo-500",
    purple: "text-purple-600 focus:ring-purple-500",
    emerald: "text-emerald-600 focus:ring-emerald-500",
    amber: "text-amber-600 focus:ring-amber-500",
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-xs font-bold text-slate-600 uppercase flex-1">{label}</label>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 hover:bg-slate-100"
        >
          -
        </button>
        <input 
          type="number" 
          className={`w-16 text-center p-1 border rounded font-bold outline-none transition-all focus:ring-2 ${colors[color]}`}
          value={value === 0 ? "" : value}
          placeholder="0"
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
        <button 
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 hover:bg-slate-100"
        >
          +
        </button>
      </div>
    </div>
  );
}