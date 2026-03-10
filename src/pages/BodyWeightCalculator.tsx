import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const BodyWeightCalculator = () => {
  const navigate = useNavigate();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);

  let ibw = null;
  let adjbw = null;

  if (heightNum && gender) {
    // Calculate IBW
    if (gender === 'male') {
      ibw = 50 + 0.9 * (heightNum - 152);
    } else {
      ibw = 45.5 + 0.9 * (heightNum - 152);
    }

    if (weightNum) {
      // Calculate AdjBW
      adjbw = ibw + 0.4 * (weightNum - ibw);
    }
  }

  const bmi = (weightNum && heightNum) ? (weightNum / ((heightNum / 100) ** 2)).toFixed(2) : '';

  const getBmiCategory = (bmiValue: string) => {
    const val = parseFloat(bmiValue);
    if (isNaN(val)) return '';
    if (val < 18.5) return 'Underweight';
    if (val <= 22.9) return 'Normal';
    if (val <= 27.4) return 'Overweight';
    return 'Obese';
  };

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
          Body Weight Calculator
        </h1>

        <div className="space-y-6">
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label htmlFor="height" className="block text-sm font-semibold text-gray-700 mb-1">Height (cm):</label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
                min={50}
                max={250}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-semibold text-gray-700 mb-1">Actual Body Weight (kg):</label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                min={10}
                max={300}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-1">Gender:</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Results Section */}
          {(ibw !== null || bmi !== '') && (
            <div className="mt-6 bg-slate-100 p-6 rounded-2xl shadow-inner border border-slate-200 max-w-md mx-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-slate-300 pb-2">Results</h2>
              <div className="space-y-3">
                {ibw !== null && (
                  <>
                    <p className="text-gray-700">Ideal Body Weight (IBW): <b className="text-gray-900">{ibw.toFixed(2)} kg</b></p>
                    {adjbw !== null && (
                      <p className="text-gray-700">Adjusted Body Weight (AdjBW): <b className="text-gray-900">{adjbw.toFixed(2)} kg</b></p>
                    )}
                  </>
                )}
                {bmi !== '' && (
                  <p className="text-gray-700">BMI: <b className="text-indigo-700 text-lg">{bmi} ({getBmiCategory(bmi)})</b></p>
                )}
              </div>
              {bmi && (
                <div className="mt-4 text-xs text-gray-600 italic bg-white p-3 rounded-lg border border-gray-200">
                  <b>BMI Categories:</b> Underweight (&lt;18.5), Normal (18.5–22.9), Overweight (23–27.4), Obese (≥27.5)
                </div>
              )}
            </div>
          )}

          {/* Standardized References */}
          <div className="mt-8 text-xs text-slate-500 border-t pt-6">
            <h2 className="font-bold text-sm text-gray-700 mb-2">References</h2>
            <p className="mb-2"><b>BMI:</b> MEMS. (2024). MEMS quick reference guide: Management of obesity (Version May 2023).</p>
            <p className="mb-2"><b>IBW:</b> Devine, B. J. (1974). Gentamicin therapy. DICP, 8, 650–655.</p>
            <p className="mb-2"><b>AdjBW:</b> Bauer, L. A. (2001). Applied clinical pharmacokinetics (pp. 93–179). McGraw Hill, Medical Publishing Division.</p>
            <p>Winter, M. E. (2004). Basic pharmacokinetics. Lippincott Williams & Williams.</p>
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
};

export default BodyWeightCalculator;
