/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home2";
import BodyWeightCalculator from "./pages/BodyWeightCalculator";
import PotassiumCalculator from "./pages/PotassiumCalculator";
import SodiumCalculator from "./pages/SodiumCalculator";
import MagnesiumCalculator from "./pages/MagnesiumCalculator";
import TPNAssistant from "./pages/TPNAssistant";
import NutritionGoals from "./pages/NutritionGoals";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculators/ibw-adjbw" element={<BodyWeightCalculator />} />
        <Route path="/calculators/potassium" element={<PotassiumCalculator />} />
        <Route path="/calculators/sodium" element={<SodiumCalculator />} />
        <Route path="/calculators/magnesium" element={<MagnesiumCalculator />} />
        <Route path="/calculators/tpn-assistant" element={<TPNAssistant />} />
        <Route path="/calculators/nutrition-goals" element={<NutritionGoals />} />
      </Routes>
    </Router>
  );
}
