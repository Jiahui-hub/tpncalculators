import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2, FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";

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
  kcal: number;
}

const CONVENIENCE_BAGS: Bag[] = [
  { name: "SMOFKabiven Central (1477 mL)", volume: 1477, osmolarity: 1500, baseCa: 3.7, basePO4: 15, isCentral: true, aaGrams: 75, glucoseGrams: 187, lipidGrams: 56, kcal: 1600 },
  { name: "SMOFKabiven Central (986 mL)", volume: 986, osmolarity: 1500, baseCa: 2.5, basePO4: 10, isCentral: true, aaGrams: 50, glucoseGrams: 125, lipidGrams: 38, kcal: 1100 },
  { name: "SMOFKabiven EF (986 mL)", volume: 986, osmolarity: 1500, baseCa: 0, basePO4: 0, isCentral: true, aaGrams: 50, glucoseGrams: 125, lipidGrams: 38, kcal: 1100 },
  { name: "Nutriflex Omega Special (625 mL)", volume: 625, osmolarity: 1540, baseCa: 1.4, basePO4: 7.5, isCentral: true, aaGrams: 36, glucoseGrams: 90, lipidGrams: 25, kcal: 740 },
  { name: "Periolimel N4E (1500 mL)", volume: 1500, osmolarity: 760, baseCa: 3.0, basePO4: 12.7, isCentral: false, aaGrams: 38, glucoseGrams: 112.5, lipidGrams: 45, kcal: 1050 },
  { name: "Manual Compounded Bag", volume: 1000, osmolarity: 0, baseCa: 0, basePO4: 0, isCentral: true, aaGrams: 0, glucoseGrams: 0, lipidGrams: 0, kcal: 0 },
];

export default function TPNAssistant() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    // Check if previously authorized in this session
    if (sessionStorage.getItem("tpn_authorized") === "true") {
      setIsAuthorized(true);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a secure hash check. 
    // Using a standard clinical tool code here as requested for restriction.
    if (pin === "8899") { // Specific PIN for TPN access
      setIsAuthorized(true);
      sessionStorage.setItem("tpn_authorized", "true");
      setPinError(false);
    } else {
      setPinError(true);
      setPin("");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("pharmacistMode") !== "true") {
      navigate("/");
    }
  }, [navigate]);

  const [selectedBagIndex, setSelectedBagIndex] = useState(0);
  const [prescribedBagVolume, setPrescribedBagVolume] = useState(1477);
  const [patientWeight, setPatientWeight] = useState(70);
  const [patientHeight, setPatientHeight] = useState(170);
  const [patientSex, setPatientSex] = useState<"male" | "female">("male");
  const [patientAge, setPatientAge] = useState(60);

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

  // Sync prescribed volume when bag changes
  useEffect(() => {
    if (!isManual) {
      setPrescribedBagVolume(currentBag.volume);
    }
  }, [selectedBagIndex, isManual, currentBag.volume]);

  // Derived Metrics
  const bmi = useMemo(() => {
    if (patientHeight <= 0) return 0;
    return patientWeight / Math.pow(patientHeight / 100, 2);
  }, [patientWeight, patientHeight]);

  const ibw = useMemo(() => {
    if (patientHeight <= 0) return 0;
    const heightInches = patientHeight / 2.54;
    const base = patientSex === "male" ? 50 : 45.5;
    const calculated = base + 2.3 * (heightInches - 60);
    return Math.max(calculated, 0);
  }, [patientHeight, patientSex]);

  const ajbw = useMemo(() => {
    if (ibw <= 0 || patientWeight <= ibw) return patientWeight;
    return ibw + 0.4 * (patientWeight - ibw);
  }, [patientWeight, ibw]);

  const isObese = bmi >= 30;
  const effectiveWeight = isObese ? ajbw : patientWeight;

  const intrinsicNa = useMemo(() => {
    if (!isManual) return 0;
    return (manualAAVol * 5.3) / 1000;
  }, [isManual, manualAAVol]);


  // Electrolyte volumes based on user input concentrations
  const electrolyteVolume = useMemo(() => {
    return (
      (addedNa / 3.4) +              // Sodium 20% (3.4 mmol per 1 mL)
      (addedK * (10 / 13.41)) +     // Potassium 13.41 mmol per 10mL
      (addedMg * (5 / 10)) +        // Magnesium 10 mmol per 5mL
      (addedCa * (10 / 2.1)) +       // Calcium 2.1 mmol per 10mL
      (addedPO4 * (10 / 10))         // Phosphate 10 mmol per 10mL
    );
  }, [addedNa, addedK, addedMg, addedCa, addedPO4]);

  const scalingFactor = isManual ? 1 : prescribedBagVolume / currentBag.volume;

  const additiveVolume = (hasAddaven ? 10 : 0) + (hasVitamins ? 10 : 0) + glutamineVolume + electrolyteVolume;
  const totalVolume = (isManual 
    ? (manualDextroseVol + manualAAVol + manualLipidVol + manualWaterVol) 
    : prescribedBagVolume) + additiveVolume;
  
  // Calculations
  const finalOsmolarity = useMemo(() => {
    let baseOsmTotal = 0;
    if (isManual) {
      baseOsmTotal = (manualDextroseVol * 2.525) + (manualAAVol * 1.5) + (manualLipidVol * 0.38);
    } else {
      // Use the actual osmoles from the full bag scaled to partial volume
      baseOsmTotal = (currentBag.osmolarity * (currentBag.volume / 1000)) * scalingFactor;
    }
    
    const additiveOsmTotal = 
      (addedNa * 2 + addedK * 2 + addedMg + addedCa + addedPO4) +
      (hasAddaven ? 31 : 0) +
      (hasVitamins ? 10 : 0) +
      (glutamineVolume * 0.921);

    return (baseOsmTotal + additiveOsmTotal) / (totalVolume / 1000);
  }, [isManual, currentBag, addedNa, addedK, addedMg, addedCa, addedPO4, totalVolume, manualDextroseVol, manualAAVol, manualLipidVol, manualWaterVol, hasAddaven, hasVitamins, glutamineVolume, scalingFactor]);

  const totalCa = (currentBag.baseCa * scalingFactor) + addedCa;
  const totalPO4 = (currentBag.basePO4 * scalingFactor) + addedPO4;

  const isNutriflex = currentBag.name.includes("Nutriflex");
  const caConcentration = totalCa / (totalVolume / 1000);
  const po4Concentration = totalPO4 / (totalVolume / 1000);
  const sumConcentration = caConcentration + po4Concentration;

  const nutriflexAlerts = useMemo(() => {
    if (!isNutriflex) return [];
    const alerts = [];

    const limits = currentBag.volume === 625 
      ? { naK: 68, ca: 1.4, mg: 3.4, po4: 18.8 }
      : currentBag.volume === 1250 
        ? { naK: 136, ca: 2.7, mg: 6.7, po4: 37.5 }
        : null;

    if (limits) {
      const isExceeded = 
        (addedNa + addedK) > limits.naK || 
        addedCa > limits.ca || 
        addedMg > limits.mg || 
        addedPO4 > limits.po4;

      if (isExceeded) {
        alerts.push({
          level: 1, 
          title: "Manufacturer Limit Exceeded",
          details: "One or more electrolyte additions exceed manufacturer-validated stability limits.",
          action: "Acceptable for same-day use (<24h) per clinical practice."
        });
      }
    }

    return alerts;
  }, [isNutriflex, currentBag.volume, addedNa, addedK, addedMg, addedCa, addedPO4]);

  const macronutrients = useMemo(() => {
    let glucose = 0;
    let aa = (glutamineVolume * 0.2); // Dipeptiven adds protein
    let lipid = 0;
    let totalKcal = (glutamineVolume * 0.2 * 4); // Dipeptiven kcal from protein

    if (isManual) {
      glucose = manualDextroseVol * 0.5;
      aa += (manualAAVol * 0.15);
      lipid = manualLipidVol * 0.2;
      totalKcal += (glucose * 4) + (manualAAVol * 0.15 * 4) + (lipid * 9);
    } else {
      glucose = currentBag.glucoseGrams * scalingFactor;
      aa += currentBag.aaGrams * scalingFactor;
      lipid = currentBag.lipidGrams * scalingFactor;
      totalKcal += currentBag.kcal * scalingFactor;
    }
    
    const npc = totalKcal - (aa * 4);
    const nitrogen = aa / 6.25;
    const ratio = nitrogen > 0 ? npc / nitrogen : 0;

    return { glucose, aa, lipid, npc, nitrogen, ratio, kcal: totalKcal };
  }, [isManual, currentBag, manualDextroseVol, manualAAVol, manualLipidVol, glutamineVolume, scalingFactor]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Restricted Access</h2>
            <p className="text-slate-500 text-sm mt-2">The TPN Assistant is a restricted clinical tool. Please enter the Pharmacist PIN to proceed.</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pharmacist PINCODE</label>
              <input 
                type="password"
                autoFocus
                className={`w-full p-4 text-center text-2xl font-black tracking-[1em] border-2 rounded-2xl outline-none transition-all ${
                  pinError ? "border-rose-300 bg-rose-50 text-rose-600" : "border-slate-100 bg-slate-50 focus:border-indigo-500 text-slate-800"
                }`}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError(false);
                }}
                maxLength={4}
                placeholder="****"
              />
              {pinError && <p className="text-xs text-rose-500 font-bold text-center mt-2">Incorrect PIN. Access Denied.</p>}
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
              disabled={pin.length < 4}
            >
              Verify Identity
            </button>
            <button 
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Cancel & Return Home
            </button>
          </form>
        </div>
      </div>
    );
  }

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
        <p className="text-center text-gray-500 mb-8 font-medium">Clinical Compounding & Practical Monitoring</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">1. Patient Metrics</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Sex</label>
                    <div className="flex gap-2">
                      {(["male", "female"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setPatientSex(s)}
                          className={`flex-1 py-2 text-xs font-bold rounded capitalize transition-all ${
                            patientSex === s 
                              ? "bg-indigo-600 text-white shadow-sm" 
                              : "bg-white text-slate-400 border border-slate-200 hover:border-indigo-200"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Age (yr)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                      value={patientAge === 0 ? "" : patientAge}
                      onChange={(e) => setPatientAge(e.target.value === "" ? 0 : Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Weight (kg)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                      value={patientWeight === 0 ? "" : patientWeight}
                      onChange={(e) => setPatientWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Height (cm)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                      value={patientHeight === 0 ? "" : patientHeight}
                      onChange={(e) => setPatientHeight(e.target.value === "" ? 0 : Number(e.target.value))}
                    />
                  </div>
                </div>

                {patientWeight > 0 && patientHeight > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-400 uppercase">BMI</p>
                      <p className={`font-black text-xs ${isObese ? "text-rose-600" : "text-slate-700"}`}>
                        {bmi.toFixed(1)}
                      </p>
                    </div>
                    <div className="space-y-0.5 border-x border-slate-50">
                      <p className="font-bold text-slate-400 uppercase">IBW</p>
                      <p className="font-black text-xs text-slate-700">
                        {ibw.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-400 uppercase">AjBW</p>
                      <p className={`font-black text-xs ${isObese ? "text-indigo-600" : "text-slate-700"}`}>
                        {ajbw.toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                )}
                
                {isObese && (
                  <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded border border-indigo-100 text-[10px] text-indigo-700 font-medium">
                    <FiAlertTriangle className="shrink-0" />
                    <span>Obese (BMI ≥ 30). Using Adjusted Body Weight ({ajbw.toFixed(1)}kg) for calculations.</span>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">2. Select Base Bag</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Convenience Bag Type</label>
                  <select 
                    className="w-full p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    value={selectedBagIndex}
                    onChange={(e) => setSelectedBagIndex(Number(e.target.value))}
                  >
                    {CONVENIENCE_BAGS.map((bag, i) => (
                      <option key={i} value={i}>{bag.name}</option>
                    ))}
                  </select>
                </div>

                {!isManual && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-black text-indigo-900 uppercase">Volume to Infuse (mL)</label>
                      <span className="text-[10px] font-bold text-indigo-400">BAG MAX: {currentBag.volume} mL</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range"
                        min={100}
                        max={currentBag.volume}
                        step={10}
                        className="flex-1 accent-indigo-600 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                        value={prescribedBagVolume}
                        onChange={(e) => setPrescribedBagVolume(Number(e.target.value))}
                      />
                      <input 
                        type="number"
                        className="w-24 p-2 bg-white border border-indigo-200 rounded-lg text-center font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={prescribedBagVolume}
                        max={currentBag.volume}
                        onChange={(e) => setPrescribedBagVolume(Math.min(currentBag.volume, Number(e.target.value)))}
                      />
                    </div>
                    <p className="text-[10px] text-indigo-400 mt-2 italic px-1">
                      * Nutrients will be scaled proportionally to {((prescribedBagVolume / currentBag.volume) * 100).toFixed(0)}% of full bag contents.
                    </p>
                  </div>
                )}
              </div>

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
                      <div className="flex items-center gap-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Aminoplasmal 15% (mL)</label>
                        <div className="group relative">
                          <FiInfo className="text-indigo-400 cursor-help" size={12} />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Contains 150g AA and 5.3 mmol Sodium per 1000 mL.
                          </div>
                        </div>
                      </div>
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
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">3. Additives (Top-ups)</h2>
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
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">4. Other Additives</h2>
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
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-700">Dipeptiven (Glutamine)</p>
                        <p className="text-[10px] text-slate-500 tracking-tight">20g/100mL bottle (+92 mOsm)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setGlutamineVolume(Math.max(0, glutamineVolume - 50))}
                          className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >-</button>
                        <input 
                          type="number"
                          className="w-16 text-center p-1 border rounded font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          value={glutamineVolume === 0 ? "" : glutamineVolume}
                          placeholder="0"
                          onChange={(e) => setGlutamineVolume(e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                        <button 
                          onClick={() => setGlutamineVolume(glutamineVolume + 50)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >+</button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setGlutamineVolume(100)}
                        className={`flex-1 py-1 px-2 rounded text-[10px] font-black transition-all ${
                          glutamineVolume === 100 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        100 mL (1 Bottle)
                      </button>
                      <button 
                        onClick={() => setGlutamineVolume(200)}
                        className={`flex-1 py-1 px-2 rounded text-[10px] font-black transition-all ${
                          glutamineVolume === 200 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        200 mL (2 Bottles)
                      </button>
                      <button 
                        onClick={() => setGlutamineVolume(0)}
                        className={`py-1 px-3 rounded text-[10px] font-black transition-all ${
                          glutamineVolume === 0 
                            ? "bg-rose-600 text-white shadow-sm" 
                            : "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        }`}
                      >
                        None
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-6">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest text-center">Nutritional Delivery (Per Kg)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Total Energy</p>
                  <p className="text-2xl font-black text-indigo-900">
                    {effectiveWeight > 0 ? (macronutrients.kcal / effectiveWeight).toFixed(1) : "0"}
                    <span className="text-xs ml-1">kcal/kg</span>
                  </p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Protein</p>
                  <p className="text-2xl font-black text-emerald-900">
                    {effectiveWeight > 0 ? (macronutrients.aa / effectiveWeight).toFixed(1) : "0"}
                    <span className="text-xs ml-1">g/kg</span>
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                  <p className="text-[10px] font-bold text-amber-400 uppercase mb-1">Carbs</p>
                  <p className="text-2xl font-black text-amber-900">
                    {effectiveWeight > 0 ? (macronutrients.glucose / effectiveWeight).toFixed(1) : "0"}
                    <span className="text-xs ml-1">g/kg</span>
                  </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
                  <p className="text-[10px] font-bold text-rose-400 uppercase mb-1">Fat</p>
                  <p className="text-2xl font-black text-rose-900">
                    {effectiveWeight > 0 ? (macronutrients.lipid / effectiveWeight).toFixed(1) : "0"}
                    <span className="text-xs ml-1">g/kg</span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-inner space-y-6">
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-70 mb-3">Safety & Stability</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold opacity-60">OSMOLARITY</span>
                        <span className="text-xl font-black">{Math.round(finalOsmolarity)} <span className="text-[10px] font-medium opacity-50">mOsm/L</span></span>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold ${finalOsmolarity > 900 ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
                        {finalOsmolarity > 900 ? <FiAlertTriangle /> : <FiCheckCircle />}
                        {finalOsmolarity > 900 ? "CENTRAL" : "PERIPHERAL"}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-4">
                      {isNutriflex ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Total Ca + PO₄</span>
                            <span className={`font-bold ${nutriflexAlerts.length > 0 ? "text-red-300" : "text-emerald-300"}`}>
                              {sumConcentration.toFixed(1)} mmol/L
                            </span>
                          </div>

                          {nutriflexAlerts.length > 0 ? (
                            <div className="space-y-3">
                              {nutriflexAlerts.map((alert, idx) => (
                                <div key={idx} className="p-3 rounded-lg border border-amber-400/50 bg-amber-500/20 text-[10px] leading-relaxed space-y-1">
                                  <p className="font-black flex items-center gap-1 text-amber-200">
                                    <FiAlertTriangle /> {alert.title}
                                  </p>
                                  <p className="opacity-90">{alert.details}</p>
                                  <p className="font-bold text-white mt-1 underline">Action: {alert.action}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-emerald-500/20 p-3 rounded-lg border border-emerald-500/30 flex gap-3 text-xs leading-relaxed">
                              <div className="shrink-0 text-emerald-300 text-lg">
                                <FiCheckCircle />
                              </div>
                              <p>Nutriflex additive concentrations are within manufacturer limits.</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="bg-emerald-500/20 p-3 rounded-lg border border-emerald-500/30 flex gap-3 text-xs leading-relaxed">
                          <div className="shrink-0 text-emerald-300 text-lg">
                            <FiCheckCircle />
                          </div>
                          <p>Organic phosphate (Glycophos) used is generally compatible.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Clinical Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                  <span className="text-indigo-600 font-bold">Total Fluid Intake:</span>
                  <span className="font-black text-indigo-700">{totalVolume.toFixed(1)} mL</span>
                </div>
                <div className="flex justify-between px-2">
                  <span className="text-slate-500">Fluid per weight:</span>
                  <span className="font-bold">{effectiveWeight > 0 ? (totalVolume / effectiveWeight).toFixed(1) : "0"} mL/kg</span>
                </div>
                <div className="flex justify-between px-2 pt-1 border-t border-slate-50 mt-1">
                  <span className="text-indigo-600 font-bold text-[11px]">Total Sodium:</span>
                  <span className="font-black text-indigo-700">{(addedNa + intrinsicNa).toFixed(1)} mmol</span>
                </div>
                {intrinsicNa > 0 && (
                  <div className="flex justify-between px-2 text-[10px] text-slate-400 italic">
                    <span>(Incl. {intrinsicNa.toFixed(1)} mmol from AA)</span>
                  </div>
                )}
                <div className="flex justify-between px-2 mt-1">
                  <span className="text-slate-500">Total Calcium:</span>
                  <span className="font-bold">{totalCa.toFixed(1)} mmol</span>
                </div>
                <div className="flex justify-between px-2">
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
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-slate-500">Flow Rate</h3>
                <span className="text-lg font-black text-indigo-600">{(totalVolume / infusionHours).toFixed(1)} mL/hr</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
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
                  <input 
                    type="number"
                    className="w-10 p-1 text-[10px] font-bold border rounded outline-none focus:ring-1 focus:ring-indigo-500"
                    value={infusionHours}
                    onChange={(e) => setInfusionHours(Math.max(1, Number(e.target.value)))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h4 className="text-sm font-bold text-slate-800 mb-3">Clinical Practice Notes</h4>
          <ul className="text-xs text-slate-600 space-y-3 list-disc ml-4">
            <li><b>Stability vs. Safety:</b> Manufacturer limits (e.g., 1.4 mmol Ca for Nutriflex 625mL) are conservative to guarantee 7-9 days of shelf life. In clinical practice, higher additions are common for same-day use (&lt;24h) provided proper mixing and monitoring occur.</li>
            <li><b>Precipitation Risk:</b> The risk of Ca-PO₄ precipitation increases with higher temperatures, higher pH, and lower amino acid concentrations.</li>
            <li><b>Mixing Order:</b> Always add Phosphate first, mix the bag thoroughly, and add Calcium last to minimize local high concentrations that trigger precipitation.</li>
            <li><b>Osmolarity:</b> Peripheral lines are generally limited to &lt;900 mOsm/L. Central lines can handle &gt;900 mOsm/L.</li>
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
