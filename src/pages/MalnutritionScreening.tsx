import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";

type ScreeningTool = "GLIM" | "NRS2002" | "MUST";

export default function MalnutritionScreening() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<ScreeningTool>("GLIM");

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 font-semibold mb-8 transition-all hover:bg-slate-50"
        >
          <FiArrowLeft /> Back to Home
        </button>

        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Malnutrition Screening</h1>
            <p className="text-slate-500 font-medium">Standardized assessment tools for inpatient care</p>
          </div>

          {/* Tool Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-10">
            {(["GLIM", "NRS2002", "MUST"] as ScreeningTool[]).map((tool) => (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${
                  activeTool === tool
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tool}
              </button>
            ))}
          </div>

          {activeTool === "GLIM" && <GLIMTool />}
          {activeTool === "NRS2002" && <NRS2002Tool />}
          {activeTool === "MUST" && <MUSTTool />}
        </div>
      </div>
    </div>
  );
}

function GLIMTool() {
  const [phenotypicCheck, setPhenotypicCheck] = useState({
    weightLoss: false,
    bmi: false,
    muscleMass: false,
  });

  const [etiologicCheck, setEtiologicCheck] = useState({
    reducedIntake: false,
    inflammation: false,
  });

  const [severityLevels, setSeverityLevels] = useState<{
    weightLoss: "moderate" | "severe";
    bmi: "moderate" | "severe";
    muscleMass: "moderate" | "severe";
  }>({
    weightLoss: "moderate",
    bmi: "moderate",
    muscleMass: "moderate",
  });

  const [age, setAge] = useState<number>(65);

  const phenotypicMet = phenotypicCheck.weightLoss || phenotypicCheck.bmi || phenotypicCheck.muscleMass;
  const etiologicMet = etiologicCheck.reducedIntake || etiologicCheck.inflammation;
  const isMalnourished = phenotypicMet && etiologicMet;

  const finalSeverity = useMemo(() => {
    if (!isMalnourished) return null;
    
    // Check if any checked phenotypic criteria are at severe level
    const weightSevere = phenotypicCheck.weightLoss && severityLevels.weightLoss === "severe";
    const bmiSevere = phenotypicCheck.bmi && severityLevels.bmi === "severe";
    const muscleSevere = phenotypicCheck.muscleMass && severityLevels.muscleMass === "severe";
    
    if (weightSevere || bmiSevere || muscleSevere) {
      return "Stage 2: Severe Malnutrition";
    }
    return "Stage 1: Moderate Malnutrition";
  }, [isMalnourished, phenotypicCheck, severityLevels]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Step 1: Diagnosis */}
      <section className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">1</div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Confirm Malnutrition</h2>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-xs font-black text-slate-400 uppercase">Age:</span>
            <input 
              type="number" 
              className="w-12 text-sm font-black text-indigo-600 outline-none"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex gap-4">
          <FiInfo className="text-indigo-600 shrink-0 mt-1" size={20} />
          <div className="text-sm text-indigo-900 leading-relaxed font-medium">
            Malnutrition is confirmed if at least <b>one phenotypic</b> and <b>one etiologic</b> criterion is checked.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-2">Phenotypic Criteria</h3>
            <div className="space-y-4">
              <CriteriaToggle 
                label="Unintentional Weight Loss" 
                description="> 5% within past 6 months OR > 10% beyond 6 months"
                active={phenotypicCheck.weightLoss} 
                onToggle={() => setPhenotypicCheck({...phenotypicCheck, weightLoss: !phenotypicCheck.weightLoss})} 
              />
              
              <CriteriaToggle 
                label="Low BMI" 
                description={`${age < 70 ? "< 20 (Asia: < 18.5)" : "< 22 (Asia: < 20)"} if age ${age < 70 ? "< 70" : "≥ 70"} yrs`}
                active={phenotypicCheck.bmi} 
                onToggle={() => setPhenotypicCheck({...phenotypicCheck, bmi: !phenotypicCheck.bmi})} 
              />

              <CriteriaToggle 
                label="Muscle Mass" 
                description="Reduced muscle mass based on valid body composition assessment (e.g. calf circumference, MUAC)"
                active={phenotypicCheck.muscleMass} 
                onToggle={() => setPhenotypicCheck({...phenotypicCheck, muscleMass: !phenotypicCheck.muscleMass})} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-2">Etiologic Criteria</h3>
            <div className="space-y-4">
              <CriteriaCard 
                active={etiologicCheck.reducedIntake}
                onToggle={() => setEtiologicCheck({...etiologicCheck, reducedIntake: !etiologicCheck.reducedIntake})}
                title="Reduced Food Intake"
                details="Ingestion ≤ 50% of needs from 1 to 2 weeks, Any reduction for > 2 weeks, or Any chronic GI condition impacting assimilation/absorption."
              />
              <CriteriaCard 
                active={etiologicCheck.inflammation}
                onToggle={() => setEtiologicCheck({...etiologicCheck, inflammation: !etiologicCheck.inflammation})}
                title="Disease Burden"
                details="Presence of acute disease/injury or chronic disease related inflammation."
              />
            </div>
          </div>
        </div>

        <div className={`p-8 rounded-3xl border text-center transition-all shadow-md ${
          isMalnourished ? "bg-red-50 border-red-200" : (phenotypicMet || etiologicMet) ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
        }`}>
          <div className="flex flex-col items-center justify-center gap-2">
            {isMalnourished ? (
              <>
                <FiAlertCircle className="text-red-600 mb-1" size={32} />
                <p className="text-2xl font-black text-red-600 uppercase">Malnutrition Confirmed</p>
                <p className="text-sm font-bold text-red-700/80">Proceed to Step 2 to determine severity.</p>
              </>
            ) : (
              <>
                {!(phenotypicMet || etiologicMet) ? (
                  <>
                    <FiCheckCircle className="text-emerald-600 mb-1" size={32} />
                    <p className="text-2xl font-black text-emerald-600 uppercase">No Risk Detected</p>
                  </>
                ) : (
                  <>
                    <FiInfo className="text-amber-600 mb-1" size={32} />
                    <p className="text-2xl font-black text-amber-600 uppercase">Suspicion of Malnutrition</p>
                    <p className="text-sm font-bold text-amber-700/80">
                      {!phenotypicMet ? "Requires at least 1 Phenotypic criterion." : "Requires at least 1 Etiologic criterion."}
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Step 2: Severity */}
      {isMalnourished && (
        <section className="space-y-6 pt-10 border-t-2 border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">2</div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Determine Severity</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {phenotypicCheck.weightLoss && (
              <PhenotypicSeveritySelector 
                title="Unintentional Weight Loss"
                value={severityLevels.weightLoss}
                onChange={(v) => setSeverityLevels({...severityLevels, weightLoss: v as any})}
                options={[
                  { label: "Moderate (Stage 1)", value: "moderate", details: "5-10% in 6 months; or 10-20% in more than 6 months" },
                  { label: "Severe (Stage 2)", value: "severe", details: ">10% in 6 months; or >20% in more than 6 months" },
                ]}
              />
            )}

            {phenotypicCheck.bmi && (
              <PhenotypicSeveritySelector 
                title="Low BMI (kg/m²)"
                value={severityLevels.bmi}
                onChange={(v) => setSeverityLevels({...severityLevels, bmi: v as any})}
                options={[
                  { label: "Moderate (Stage 1)", value: "moderate", details: age < 70 ? "< 20 if < 70 years" : "< 22 if ≥ 70 years" },
                  { label: "Severe (Stage 2)", value: "severe", details: age < 70 ? "< 18.5 if < 70 years" : "< 20 if ≥ 70 years" },
                ]}
              />
            )}

            {phenotypicCheck.muscleMass && (
              <PhenotypicSeveritySelector 
                title="Reduced Muscle Mass"
                value={severityLevels.muscleMass}
                onChange={(v) => setSeverityLevels({...severityLevels, muscleMass: v as any})}
                options={[
                  { label: "Moderate (Stage 1)", value: "moderate", details: "Mild-to-moderate deficit (per validated assessment)" },
                  { label: "Severe (Stage 2)", value: "severe", details: "Severe deficit (per validated assessment)" },
                ]}
              />
            )}
          </div>

          <div className="mt-10 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-2xl">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Final GLIM Assessment</h4>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className={`px-8 py-4 rounded-2xl font-black text-2xl uppercase tracking-tight shadow-lg ${
                finalSeverity?.includes("Severe") ? "bg-red-600 text-white" : "bg-orange-500 text-white"
              }`}>
                {finalSeverity}
              </div>
              <p className="text-slate-400 text-sm font-medium max-w-sm">
                Diagnosis completed. Patient requires appropriate nutritional intervention based on {finalSeverity?.toLowerCase()}.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function PhenotypicSeveritySelector({ title, value, onChange, options }: { 
  title: string; 
  value: string; 
  options: { label: string; value: string; details: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200">
      <p className="text-sm font-black text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-3 mb-3">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`p-4 rounded-xl border text-left transition-all ${
              value === opt.value
                ? "bg-indigo-600 border-indigo-700 text-white shadow-md ring-2 ring-indigo-100"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-black uppercase tracking-tight">{opt.label}</p>
              {value === opt.value && <FiCheckCircle size={16} />}
            </div>
            <p className={`text-xs font-medium leading-tight ${value === opt.value ? "opacity-90" : "text-slate-500"}`}>
              {opt.details}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function NRS2002Tool() {
  const [initial, setInitial] = useState({
    bmi: false,
    wtLoss: false,
    diet: false,
    severelyIll: false
  });

  const [scoreNutStatus, setScoreNutStatus] = useState(0);
  const [scoreDisease, setScoreDisease] = useState(0);
  const [age, setAge] = useState(65);

  const needsSecondLevel = Object.values(initial).some(Boolean);
  const totalScore = needsSecondLevel ? (scoreNutStatus + scoreDisease + (age >= 70 ? 1 : 0)) : 0;
  const isAtRisk = totalScore >= 3;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex gap-4">
        <FiInfo className="text-indigo-600 shrink-0 mt-1" size={20} />
        <div className="text-sm text-indigo-900 leading-relaxed">
          <p className="font-bold mb-1 uppercase">NRS 2002 Protocol:</p>
          <p>Initial screening followed by final assessment if any initial risk is found. Total Score ≥ 3 indicates risk.</p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-2">1. Initial Screening</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CriteriaToggle label="Is BMI < 20?" active={initial.bmi} onToggle={() => setInitial({...initial, bmi: !initial.bmi})} />
          <CriteriaToggle label="Weight loss in last 3 months?" active={initial.wtLoss} onToggle={() => setInitial({...initial, wtLoss: !initial.wtLoss})} />
          <CriteriaToggle label="Reduced dietary intake in last week?" active={initial.diet} onToggle={() => setInitial({...initial, diet: !initial.diet})} />
          <CriteriaToggle label="Severely ill? (e.g. ICU)" active={initial.severelyIll} onToggle={() => setInitial({...initial, severelyIll: !initial.severelyIll})} />
        </div>
      </div>

      {needsSecondLevel && (
        <div className="space-y-10 pt-6 border-t border-slate-100">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-2">2. Final Screening</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-500 uppercase px-2 mb-2">Impaired Nutritional Status</p>
                <ScoreOption 
                  label="Absent (Score 0)" 
                  active={scoreNutStatus === 0} 
                  onClick={() => setScoreNutStatus(0)} 
                  details="Normal status"
                />
                <ScoreOption 
                  label="Mild (Score 1)" 
                  active={scoreNutStatus === 1} 
                  onClick={() => setScoreNutStatus(1)} 
                  details="Wt loss >5% in 3 mths OR Food intake 50-75% in preceding week"
                />
                <ScoreOption 
                  label="Moderate (Score 2)" 
                  active={scoreNutStatus === 2} 
                  onClick={() => setScoreNutStatus(2)} 
                  details="Wt loss >5% in 2 mths OR BMI 18.5-20.5 + impaired condition OR Food intake 25-50% in preceding week"
                />
                <ScoreOption 
                  label="Severe (Score 3)" 
                  active={scoreNutStatus === 3} 
                  onClick={() => setScoreNutStatus(3)} 
                  details="Wt loss >5% in 1 mth (>15% in 3m) OR BMI <18.5 + impaired condition OR Food intake 0-25% in preceding week"
                />
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black text-slate-500 uppercase px-2 mb-2">Severity of Disease</p>
                <ScoreOption 
                  label="Absent (Score 0)" 
                  active={scoreDisease === 0} 
                  onClick={() => setScoreDisease(0)} 
                  details="Normal requirements"
                />
                <ScoreOption 
                  label="Mild (Score 1)" 
                  active={scoreDisease === 1} 
                  onClick={() => setScoreDisease(1)} 
                  details="Hip fracture, Chronic complications (Cirrhosis, COPD), Hemodialysis, Diabetes, Oncology"
                />
                <ScoreOption 
                  label="Moderate (Score 2)" 
                  active={scoreDisease === 2} 
                  onClick={() => setScoreDisease(2)} 
                  details="Major abdominal surgery, Stroke, Severe pneumonia, Hematologic malignancy"
                />
                <ScoreOption 
                  label="Severe (Score 3)" 
                  active={scoreDisease === 3} 
                  onClick={() => setScoreDisease(3)} 
                  details="Head injury, Bone marrow transplant, ICU patients (APACHE > 10)"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-600">Patient Age:</span>
              <input 
                type="number" 
                className="w-20 p-2 border border-slate-300 rounded-xl font-black text-center" 
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${age >= 70 ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500"}`}>
                {age >= 70 ? "+1 Point Added" : "No Age Correction"}
              </span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Final Age-Adjusted Score</p>
              <p className="text-5xl font-black text-indigo-600">{totalScore}</p>
            </div>
          </div>
        </div>
      )}

      <div className={`p-8 rounded-3xl border text-center transition-all shadow-lg ${
        isAtRisk ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
      }`}>
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Final Conclusion</h4>
        <div className="flex flex-col items-center justify-center gap-2">
          {isAtRisk ? (
            <>
              <FiAlertCircle className="text-red-600 mb-2" size={40} />
              <p className="text-3xl font-black text-red-600 uppercase">Nutritional Risk Present</p>
            </>
          ) : (
            <>
              <FiCheckCircle className="text-emerald-600 mb-2" size={40} />
              <p className="text-3xl font-black text-emerald-600 uppercase">No Nutritional Risk</p>
            </>
          )}
        </div>
        <p className={`mt-4 text-sm font-bold ${isAtRisk ? "text-red-700/70" : "text-emerald-700/70"}`}>
          {isAtRisk 
            ? "Initiate nutritional care plan and monitor weekly." 
            : !needsSecondLevel 
              ? "All initial screening answers 'No'. Rescreen weekly."
              : "Final score < 3. Rescreen weekly or per protocol."}
        </p>
      </div>
    </div>
  );
}

function MUSTTool() {
  const [bmiScore, setBmiScore] = useState(0);
  const [wtLossScore, setWtLossScore] = useState(0);
  const [acuteScore, setAcuteScore] = useState(0);

  const totalScore = bmiScore + wtLossScore + acuteScore;
  const risk = totalScore === 0 ? "LOW" : totalScore === 1 ? "MEDIUM" : "HIGH";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex gap-4">
        <FiInfo className="text-indigo-600 shrink-0 mt-1" size={20} />
        <div className="text-sm text-indigo-900 leading-relaxed">
          <p className="font-bold mb-1 uppercase tracking-tight">MUST (Malnutrition Universal Screening Tool):</p>
          <p>Score 0: Low Risk | Score 1: Medium Risk | Score ≥ 2: High Risk.</p>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <p className="text-sm font-black text-slate-500 uppercase px-2 mb-2">Step 1: BMI Score</p>
          <ScoreOption label="Score 0" active={bmiScore === 0} onClick={() => setBmiScore(0)} details="BMI > 20 (> 30 Obese)" />
          <ScoreOption label="Score 1" active={bmiScore === 1} onClick={() => setBmiScore(1)} details="BMI 18.5 - 20" />
          <ScoreOption label="Score 2" active={bmiScore === 2} onClick={() => setBmiScore(2)} details="BMI < 18.5" />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-black text-slate-500 uppercase px-2 mb-2">Step 2: Weight Loss</p>
          <ScoreOption label="Score 0" active={wtLossScore === 0} onClick={() => setWtLossScore(0)} details="weight loss < 5% in past 3-6 months" />
          <ScoreOption label="Score 1" active={wtLossScore === 1} onClick={() => setWtLossScore(1)} details="weight loss 5-10% in past 3-6 months" />
          <ScoreOption label="Score 2" active={wtLossScore === 2} onClick={() => setWtLossScore(2)} details="weight loss > 10% in 3-6 months" />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-black text-slate-500 uppercase px-2 mb-2">Step 3: Acute Effect</p>
          <ScoreOption label="Score 0" active={acuteScore === 0} onClick={() => setAcuteScore(0)} details="not acutely ill and has nutritional intake" />
          <ScoreOption label="Score 2" active={acuteScore === 2} onClick={() => setAcuteScore(2)} details="acutely ill and likely to be no nutritional intake for > 5 days" />
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl text-center shadow-inner">
        <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-4">Total MUST Score</p>
        <p className="text-7xl font-black mb-4">{totalScore}</p>
        <p className={`text-2xl font-black py-2 px-6 inline-block rounded-full ${
          risk === "HIGH" ? "bg-red-600" : risk === "MEDIUM" ? "bg-orange-500" : "bg-emerald-500"
        }`}>
          {risk} RISK
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-2">Management Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-5 rounded-2xl border ${risk === 'LOW' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 opacity-60'}`}>
            <p className="text-xs font-black text-emerald-600 mb-2 uppercase">0: Low Risk</p>
            <p className="text-xs font-bold text-slate-700 leading-relaxed mb-2">Routine Clinical Care</p>
            <ul className="text-xs text-slate-500 space-y-1 list-disc ml-3">
              <li>Repeat screening weekly (Hospital)</li>
              <li>Monthly (Care home)</li>
            </ul>
          </div>
          <div className={`p-5 rounded-2xl border ${risk === 'MEDIUM' ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100 opacity-60'}`}>
            <p className="text-xs font-black text-orange-600 mb-2 uppercase">1: Medium Risk</p>
            <p className="text-xs font-bold text-slate-700 leading-relaxed mb-2">Observe & Monitor</p>
            <ul className="text-xs text-slate-500 space-y-1 list-disc ml-3">
              <li>Document dietary intake for 3 days</li>
              <li>Improve nutritional intake</li>
              <li>Repeat screening after 2-3 months</li>
            </ul>
          </div>
          <div className={`p-5 rounded-2xl border ${risk === 'HIGH' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100 opacity-60'}`}>
            <p className="text-xs font-black text-red-600 mb-2 uppercase">2+: High Risk</p>
            <p className="text-xs font-bold text-slate-700 leading-relaxed mb-2">Active Treatment</p>
            <ul className="text-xs text-slate-500 space-y-1 list-disc ml-3">
              <li>Refer to Dietitian / Nutrition Support</li>
              <li>Set goals for increasing overall intake</li>
              <li>Monitor care plan weekly (Hospital)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function CriteriaCard({ active, onToggle, title, details }: { active: boolean; onToggle: () => void; title: string, details: string }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full p-6 rounded-3xl border text-left transition-all group ${
        active 
          ? "bg-indigo-600 border-indigo-700 text-white shadow-xl ring-2 ring-indigo-200" 
          : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-base font-black uppercase tracking-tight">{title}</span>
        {active ? <FiCheckCircle size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-slate-200" />}
      </div>
      <p className={`text-sm font-medium leading-relaxed ${active ? "opacity-90" : "text-slate-500"}`}>
        {details}
      </p>
    </button>
  );
}

function ScoreOption({ label, active, onClick, details }: { label: string; active: boolean; onClick: () => void; details: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-5 rounded-2xl border text-left flex items-center gap-5 transition-all ${
        active 
          ? "bg-white border-indigo-500 text-indigo-700 shadow-lg ring-2 ring-indigo-500" 
          : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-300"
      }`}
    >
      <div className={`w-6 h-6 rounded-full border-2 shrink-0 ${active ? "border-indigo-600 bg-indigo-600 shadow-inner" : "border-slate-200"}`} />
      <div className="flex-1">
        <p className="text-base font-black uppercase tracking-tight">{label}</p>
        <p className="text-sm font-bold opacity-75 mt-1 leading-snug">{details}</p>
      </div>
    </button>
  );
}

function CriteriaToggle({ label, description, active, onToggle }: { label: string; description?: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full p-5 rounded-3xl border text-left flex items-center justify-between transition-all ${
        active 
          ? "bg-indigo-600 border-indigo-700 text-white shadow-xl shadow-indigo-100 ring-2 ring-indigo-200" 
          : "bg-white border-slate-100 text-slate-700 hover:border-indigo-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex-1">
        <span className="text-sm font-black block">{label}</span>
        {description && (
          <span className={`text-[11px] font-medium leading-tight block mt-1 ${active ? "text-indigo-100" : "text-slate-500"}`}>
            {description}
          </span>
        )}
      </div>
      <div className="ml-4 shrink-0">
        {active ? <FiCheckCircle size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-slate-200" />}
      </div>
    </button>
  );
}

