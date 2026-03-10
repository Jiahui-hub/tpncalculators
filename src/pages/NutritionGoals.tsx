import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiTarget, FiActivity, FiAlertCircle, FiCheckCircle, FiInfo, FiPlus, FiTrash2 } from "react-icons/fi";

interface ClinicalState {
  label: string;
  kcalRange: [number, number];
  proteinRange: [number, number];
  description: string;
}

const CLINICAL_STATES: Record<string, ClinicalState> = {
  stable: {
    label: "Stable / Non-Critical",
    kcalRange: [20, 25],
    proteinRange: [0.8, 1.0],
    description: "Standard maintenance for stable patients."
  },
  postOp: {
    label: "Post-Operative (Major)",
    kcalRange: [25, 30],
    proteinRange: [1.2, 1.5],
    description: "Increased needs for wound healing and recovery."
  },
  sepsis: {
    label: "Sepsis / Critical Care",
    kcalRange: [20, 25], // ESPEN suggests starting low in early phase
    proteinRange: [1.2, 2.0],
    description: "High protein requirement to counter catabolism."
  },
  trauma: {
    label: "Major Trauma / TBI",
    kcalRange: [30, 35],
    proteinRange: [1.5, 2.0],
    description: "Hypermetabolic state requiring high energy and protein."
  },
  burns: {
    label: "Severe Burns (>20% BSA)",
    kcalRange: [35, 40],
    proteinRange: [2.0, 2.5],
    description: "Extreme hypermetabolism and protein loss."
  }
};

interface ENProduct {
  id: string;
  name: string;
  type: "solution" | "powder";
  kcalPerUnit: number;
  proteinPerUnit: number;
  unitLabel: string;
  defaultAmount: number;
}

const EN_PRODUCTS: ENProduct[] = [
  // Solutions
  { id: "novasource", name: "Novasource", type: "solution", kcalPerUnit: 2.0, proteinPerUnit: 0.091, unitLabel: "mL", defaultAmount: 200 },
  { id: "vital", name: "Abbott Vital", type: "solution", kcalPerUnit: 1.5, proteinPerUnit: 0.0675, unitLabel: "mL", defaultAmount: 200 },
  { id: "nepro", name: "Nepro", type: "solution", kcalPerUnit: 1.8227, proteinPerUnit: 0.081, unitLabel: "mL", defaultAmount: 220 },
  { id: "resource_fruit", name: "Resource Fruit", type: "solution", kcalPerUnit: 1.5, proteinPerUnit: 0.04, unitLabel: "mL", defaultAmount: 200 },
  { id: "glucerna", name: "Glucerna", type: "solution", kcalPerUnit: 0.962, proteinPerUnit: 0.0428, unitLabel: "mL", defaultAmount: 220 },
  { id: "diben", name: "DIBEN", type: "solution", kcalPerUnit: 1.5, proteinPerUnit: 0.075, unitLabel: "mL", defaultAmount: 200 },
  { id: "boost_isocal", name: "Boost Isocal", type: "solution", kcalPerUnit: 1.0, proteinPerUnit: 0.045, unitLabel: "mL", defaultAmount: 200 },
  // Powders
  { id: "glucobalance", name: "Glucobalance", type: "powder", kcalPerUnit: 251/8, proteinPerUnit: 12.5/8, unitLabel: "Scoops", defaultAmount: 8 },
  { id: "myotein", name: "Myotein", type: "powder", kcalPerUnit: 26, proteinPerUnit: 5, unitLabel: "Scoops", defaultAmount: 1 },
  { id: "nutren_optimum", name: "Nutren Optimum", type: "powder", kcalPerUnit: 251/7, proteinPerUnit: 10.2/7, unitLabel: "Scoops", defaultAmount: 7 },
  { id: "ensure", name: "Ensure", type: "powder", kcalPerUnit: 262/6, proteinPerUnit: 10.5/6, unitLabel: "Scoops", defaultAmount: 6 },
  { id: "nutren_fibre", name: "Nutren Fibre", type: "powder", kcalPerUnit: 255/7, proteinPerUnit: 10/7, unitLabel: "Scoops", defaultAmount: 7 },
  { id: "optimax_lite", name: "Optimax Lite", type: "powder", kcalPerUnit: 256/6, proteinPerUnit: 12/6, unitLabel: "Scoops", defaultAmount: 6 },
];

interface SelectedProduct {
  id: string;
  productId: string;
  amount: number | "";
  frequency: number | "";
}

export default function NutritionGoals() {
  const navigate = useNavigate();
  const [weight, setWeight] = useState<number | "">(70);
  const [stateKey, setStateKey] = useState("stable");
  
  // Enteral Feeding (EN) Inputs
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const addProduct = () => {
    const firstProduct = EN_PRODUCTS[0];
    setSelectedProducts([...selectedProducts, { 
      id: Math.random().toString(36).substr(2, 9),
      productId: firstProduct.id, 
      amount: firstProduct.defaultAmount, 
      frequency: 1 
    }]);
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, updates: Partial<SelectedProduct>) => {
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        // If product changed, reset amount to default
        if (updates.productId && updates.productId !== p.productId) {
          const newProduct = EN_PRODUCTS.find(prod => prod.id === updates.productId);
          if (newProduct) {
            updated.amount = newProduct.defaultAmount;
          }
        }
        return updated;
      }
      return p;
    }));
  };

  const currentState = CLINICAL_STATES[stateKey];
  const w = Number(weight) || 0;

  const goals = useMemo(() => {
    return {
      kcalMin: w * currentState.kcalRange[0],
      kcalMax: w * currentState.kcalRange[1],
      proteinMin: w * currentState.proteinRange[0],
      proteinMax: w * currentState.proteinRange[1]
    };
  }, [w, currentState]);

  const currentEnIntake = useMemo(() => {
    let totalKcal = 0;
    let totalProtein = 0;

    selectedProducts.forEach(sp => {
      const product = EN_PRODUCTS.find(p => p.id === sp.productId);
      if (product) {
        const amount = Number(sp.amount) || 0;
        const freq = Number(sp.frequency) || 0;
        totalKcal += product.kcalPerUnit * amount * freq;
        totalProtein += product.proteinPerUnit * amount * freq;
      }
    });

    return {
      kcal: totalKcal,
      protein: totalProtein
    };
  }, [selectedProducts]);

  const gap = useMemo(() => {
    return {
      kcal: Math.max(0, goals.kcalMax - currentEnIntake.kcal),
      protein: Math.max(0, goals.proteinMax - currentEnIntake.protein)
    };
  }, [goals, currentEnIntake]);

  const isOverfeeding = currentEnIntake.kcal > goals.kcalMax * 1.1; // 10% buffer

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 font-semibold mb-8 transition-all hover:bg-slate-50"
        >
          <FiArrowLeft /> Back to Home
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <FiTarget size={20} />
                </div>
                <h1 className="text-xl font-bold">Nutrition Goal Setting</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Patient Weight (kg)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-lg"
                    value={weight}
                    placeholder="e.g. 70"
                    onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                  <p className="text-[10px] text-slate-400 mt-2 italic">Use Adjusted Body Weight for obese patients.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Clinical State</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold"
                    value={stateKey}
                    onChange={(e) => setStateKey(e.target.value)}
                  >
                    {Object.entries(CLINICAL_STATES).map(([key, state]) => (
                      <option key={key} value={key}>{state.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-3">
                <div className="text-emerald-600 shrink-0 mt-0.5">
                  <FiInfo />
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  <b>{currentState.label}:</b> {currentState.description} Target: {currentState.kcalRange[0]}-{currentState.kcalRange[1]} kcal/kg and {currentState.proteinRange[0]}-{currentState.proteinRange[1]} g/kg protein.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FiActivity size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Enteral Feeding (EN) Intake</h2>
                </div>
                <button 
                  onClick={addProduct}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <FiPlus /> Add Product
                </button>
              </div>

              <div className="space-y-4">
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-sm text-slate-400">No EN products added. Click "Add Product" to begin.</p>
                  </div>
                ) : (
                  selectedProducts.map((sp) => {
                    const product = EN_PRODUCTS.find(p => p.id === sp.productId);
                    return (
                      <div key={sp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                        <button 
                          onClick={() => removeProduct(sp.id)}
                          className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 size={12} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Product</label>
                            <select 
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                              value={sp.productId}
                              onChange={(e) => updateProduct(sp.id, { productId: e.target.value })}
                            >
                              <optgroup label="Solutions">
                                {EN_PRODUCTS.filter(p => p.type === "solution").map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Powders">
                                {EN_PRODUCTS.filter(p => p.type === "powder").map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              {product?.unitLabel === "mL" ? "Volume (mL)" : "Scoops"}
                            </label>
                            <input 
                              type="number"
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                              value={sp.amount === 0 ? "" : sp.amount}
                              placeholder="0"
                              onChange={(e) => updateProduct(sp.id, { amount: e.target.value === "" ? "" : Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              {product?.type === "solution" ? "Cycles / Day" : "Times / Day"}
                            </label>
                            <input 
                              type="number"
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                              value={sp.frequency === 0 ? "" : sp.frequency}
                              placeholder="1"
                              onChange={(e) => updateProduct(sp.id, { frequency: e.target.value === "" ? "" : Number(e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-6 flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-center flex-1 border-r border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total EN Kcal</p>
                  <p className="text-lg font-black text-blue-600">{currentEnIntake.kcal.toFixed(0)}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{(currentEnIntake.kcal / (w || 1)).toFixed(1)} kcal/kg</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total EN Protein</p>
                  <p className="text-lg font-black text-blue-600">{currentEnIntake.protein.toFixed(1)} g</p>
                  <p className="text-[10px] text-slate-400 font-bold">{(currentEnIntake.protein / (w || 1)).toFixed(2)} g/kg</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6">Nutrition Targets</h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs font-bold uppercase opacity-70">Energy Goal</p>
                      <p className="text-[10px] opacity-50 font-bold">{(goals.kcalMin / (w || 1)).toFixed(0)}-{(goals.kcalMax / (w || 1)).toFixed(0)} kcal/kg</p>
                    </div>
                    <p className="text-2xl font-black">{goals.kcalMin.toFixed(0)}-{goals.kcalMax.toFixed(0)} <span className="text-xs font-normal opacity-50">kcal</span></p>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-500" 
                      style={{ width: `${Math.min(100, (currentEnIntake.kcal / goals.kcalMax) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs font-bold uppercase opacity-70">Protein Goal</p>
                      <p className="text-[10px] opacity-50 font-bold">{(goals.proteinMin / (w || 1)).toFixed(1)}-{(goals.proteinMax / (w || 1)).toFixed(1)} g/kg</p>
                    </div>
                    <p className="text-2xl font-black">{goals.proteinMin.toFixed(1)}-{goals.proteinMax.toFixed(1)} <span className="text-xs font-normal opacity-50">g</span></p>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 transition-all duration-500" 
                      style={{ width: `${Math.min(100, (currentEnIntake.protein / goals.proteinMax) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs font-bold uppercase opacity-50 mb-4">PN Requirement (The Gap)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Kcal Gap</p>
                      <p className="text-xl font-black text-emerald-400">{gap.kcal.toFixed(0)}</p>
                      <p className="text-[10px] opacity-40 font-bold">{(gap.kcal / (w || 1)).toFixed(1)} kcal/kg</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Protein Gap</p>
                      <p className="text-xl font-black text-blue-400">{gap.protein.toFixed(1)}g</p>
                      <p className="text-[10px] opacity-40 font-bold">{(gap.protein / (w || 1)).toFixed(2)} g/kg</p>
                    </div>
                  </div>
                </div>

                {isOverfeeding && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex gap-3">
                    <div className="text-red-400 shrink-0 mt-0.5">
                      <FiAlertCircle size={18} />
                    </div>
                    <p className="text-xs text-red-100 leading-relaxed">
                      <b>OVERFEEDING ALERT:</b> Current intake exceeds the calculated goal. Consider reducing EN or PN volume to avoid metabolic complications.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">Why use this?</h4>
              <ul className="text-xs text-slate-600 space-y-3">
                <li className="flex gap-2">
                  <div className="text-emerald-500 shrink-0 mt-0.5">
                    <FiCheckCircle />
                  </div>
                  <span><b>Evidence-Based:</b> Follows ESPEN/ASPEN guidelines for critical and non-critical care.</span>
                </li>
                <li className="flex gap-2">
                  <div className="text-emerald-500 shrink-0 mt-0.5">
                    <FiCheckCircle />
                  </div>
                  <span><b>Prevent Overfeeding:</b> 50 kcal/kg is often excessive and can lead to refeeding syndrome or liver stress.</span>
                </li>
                <li className="flex gap-2">
                  <div className="text-emerald-500 shrink-0 mt-0.5">
                    <FiCheckCircle />
                  </div>
                  <span><b>Gap Analysis:</b> Automatically subtracts EN intake to show exactly what PN needs to provide.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
