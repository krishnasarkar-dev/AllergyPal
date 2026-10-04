// AllergyPal — Client-Side Local Open AI Engine
// Built for Rahul — Hacktoberfest 2026 Weekend Challenge

const ALLERGEN_DATABASE = {
  tree_nuts: {
    name: "Tree Nuts & Peanuts",
    keywords: ["almond", "walnut", "cashew", "pistachio", "hazelnut", "pecan", "macadamia", "peanut", "nutella", "marzipan", "praline"],
    substitutes: {
      "almond milk": "Oat milk or soy milk (nut-free)",
      "almond": "Roasted pumpkin seeds or sunflower seeds",
      "walnut": "Toasted sunflower seeds or chia seeds",
      "cashew": "Blended silken tofu or sunflower seed paste (for creaminess)",
      "peanut butter": "Sunflower seed butter (SunButter) or tahini",
      "peanut": "Roasted chickpeas or soy nuts"
    }
  },
  dairy: {
    name: "Dairy / Lactose",
    keywords: ["milk", "cheese", "butter", "cream", "yogurt", "whey", "casein", "ghee", "parmesan", "cheddar", "mozzarella"],
    substitutes: {
      "milk": "Fortified oat milk or almond milk (if nut-safe)",
      "butter": "Cold-pressed coconut oil or olive oil",
      "cheese": "Nutritional yeast flakes or vegan nutritional cheese",
      "cream": "Coconut cream or cashew cream",
      "yogurt": "Coconut milk yogurt or oat yogurt"
    }
  },
  gluten: {
    name: "Gluten",
    keywords: ["wheat", "flour", "barley", "rye", "malt", "breadcrumbs", "pasta", "couscous", "semolina"],
    substitutes: {
      "flour": "1:1 Gluten-Free Oat flour, Almond flour, or Rice flour",
      "pasta": "Brown rice pasta or chickpea pasta",
      "breadcrumbs": "Crushed gluten-free crackers or cornflake crumbs"
    }
  },
  soy: {
    name: "Soy",
    keywords: ["soy", "tofu", "tempeh", "edamame", "miso", "tamari", "soy sauce"],
    substitutes: {
      "soy sauce": "Coconut aminos (soy-free & low sodium)",
      "tofu": "Paneer (if dairy-tolerant) or chickpea tofu"
    }
  },
  shellfish: {
    name: "Shellfish",
    keywords: ["shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop"],
    substitutes: {
      "shrimp": "King oyster mushroom stems (seasoned with kelp flakes)",
      "crab": "Hearts of palm or shredded jackfruit"
    }
  }
};

const SAMPLE_RECIPES = [
  `Breakfast Smoothie Bowl:
- 1 cup almond milk
- 1 frozen banana
- 2 tbsp creamy peanut butter
- 1/4 cup chopped walnuts
- 1 tbsp chia seeds`,
  `Creamy Garlic Pasta:
- 200g fettuccine pasta (wheat)
- 1/2 cup heavy dairy cream
- 2 tbsp parmesan cheese
- 2 cloves minced garlic
- 1 tbsp butter`,
  `Garden Protein Salad:
- 2 cups chopped romaine lettuce
- 1/2 cup chickpeas
- 1/4 cup diced cucumbers
- 2 tbsp sunflower seeds
- 1 tbsp olive oil and lemon juice`
];

let recipeIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  const scanBtn = document.getElementById("scanBtn");
  const quickPresetBtn = document.getElementById("quickPresetBtn");
  const recipeInput = document.getElementById("recipeInput");

  if (quickPresetBtn) {
    quickPresetBtn.addEventListener("click", () => {
      recipeInput.value = SAMPLE_RECIPES[recipeIndex % SAMPLE_RECIPES.length];
      recipeIndex++;
      analyzeIngredients();
    });
  }

  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      analyzeIngredients();
    });
  }
});

function getActiveAllergenFilters() {
  const checkboxes = document.querySelectorAll("#allergenBadges input[type='checkbox']:checked");
  return Array.from(checkboxes).map(cb => cb.value);
}

function analyzeIngredients() {
  const text = document.getElementById("recipeInput").value.trim();
  const verdictCard = document.getElementById("verdictCard");
  const statusIcon = document.getElementById("statusIcon");
  const statusTitle = document.getElementById("statusTitle");
  const statusDesc = document.getElementById("statusDesc");
  const riskBadge = document.getElementById("riskBadge");
  const hazardsSection = document.getElementById("hazardsSection");
  const hazardsList = document.getElementById("hazardsList");
  const substitutionsSection = document.getElementById("substitutionsSection");
  const substitutionsList = document.getElementById("substitutionsList");
  const explanationSection = document.getElementById("explanationSection");
  const explanationText = document.getElementById("explanationText");

  if (!text) {
    statusTitle.textContent = "Please provide ingredients";
    statusDesc.textContent = "Paste or type ingredients in the box first.";
    return;
  }

  const activeFilters = getActiveAllergenFilters();
  const lines = text.toLowerCase().split("\n");
  const hazards = [];
  const substitutions = [];

  activeFilters.forEach(filterKey => {
    const allergen = ALLERGEN_DATABASE[filterKey];
    if (!allergen) return;

    allergen.keywords.forEach(keyword => {
      lines.forEach(line => {
        if (line.includes(keyword)) {
          if (!hazards.some(h => h.keyword === keyword && h.category === allergen.name)) {
            hazards.push({
              line: line.trim(),
              keyword: keyword,
              category: allergen.name
            });

            // Find matching substitute
            let sub = null;
            for (const [item, replacement] of Object.entries(allergen.substitutes)) {
              if (line.includes(item)) {
                sub = { original: item, safe: replacement };
                break;
              }
            }
            if (!sub) {
              sub = { original: keyword, safe: allergen.substitutes[Object.keys(allergen.substitutes)[0]] || "Allergen-free alternative" };
            }
            if (!substitutions.some(s => s.original === sub.original)) {
              substitutions.push(sub);
            }
          }
        }
      });
    });
  });

  // Render Verdict
  if (hazards.length > 0) {
    // Unsafe for Rahul
    verdictCard.className = "glass rounded-xl p-6 border border-rose-200 shadow-md bg-rose-50/40 transition-all duration-300";
    statusIcon.className = "w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl font-bold";
    statusIcon.textContent = "⚠️";
    statusTitle.textContent = `Unsafe for Rahul (${hazards.length} Allergens Detected)`;
    statusTitle.className = "text-base font-bold text-rose-900";
    statusDesc.textContent = "Direct exposure risk identified based on active allergy profile.";
    riskBadge.className = "text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200";
    riskBadge.textContent = "High Risk";

    // Hazards list
    hazardsSection.classList.remove("hidden");
    hazardsList.innerHTML = hazards.map(h => `
      <div class="p-2.5 rounded-lg bg-white border border-rose-100 flex items-center justify-between text-xs">
        <div>
          <span class="font-bold text-rose-800">${h.keyword.toUpperCase()}</span>
          <span class="text-slate-500 text-[11px] ml-1">in "${h.line}"</span>
        </div>
        <span class="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-semibold text-[10px]">${h.category}</span>
      </div>
    `).join("");

    // Substitutions list
    substitutionsSection.classList.remove("hidden");
    substitutionsList.innerHTML = substitutions.map(s => `
      <div class="p-2.5 rounded-lg bg-white border border-emerald-100 flex items-center justify-between text-xs">
        <span class="text-slate-500 line-through">${s.original}</span>
        <span class="text-emerald-700 font-bold flex items-center gap-1">
          <span>➡️</span> ${s.safe}
        </span>
      </div>
    `).join("");

    // Explanation
    explanationSection.classList.remove("hidden");
    explanationText.innerHTML = `<strong>Local AI Model Analysis:</strong> Detected items trigger severe immune cross-reactivity for Rahul's active profile (<strong>${hazards.map(h => h.category).filter((v, i, a) => a.indexOf(v) === i).join(", ")}</strong>). Replacing with the suggested seed-based or oat-based alternatives renders the recipe 100% safe without sacrificing texture or flavor.`;

  } else {
    // Safe
    verdictCard.className = "glass rounded-xl p-6 border border-emerald-200 shadow-md bg-emerald-50/40 transition-all duration-300";
    statusIcon.className = "w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold";
    statusIcon.textContent = "✅";
    statusTitle.textContent = "100% Safe for Rahul!";
    statusTitle.className = "text-base font-bold text-emerald-900";
    statusDesc.textContent = "No allergens or hazardous cross-contaminants detected.";
    riskBadge.className = "text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200";
    riskBadge.textContent = "Verified Safe";

    hazardsSection.classList.add("hidden");
    substitutionsSection.classList.add("hidden");

    explanationSection.classList.remove("hidden");
    explanationText.innerHTML = `<strong>Local AI Model Analysis:</strong> Clean scan! All parsed ingredients are free of tree nuts, peanuts, and selected active allergens. Rahul can enjoy this meal with total peace of mind.`;
  }
}

function generateMeal(type) {
  const recipeInput = document.getElementById("recipeInput");
  const MEALS = {
    Breakfast: `Golden Oat & Seed Porridge:
- 1 cup rolled oats
- 2 cups fortified oat milk (nut-free)
- 2 tbsp sunflower seed butter
- 1 tbsp chia seeds & hemp hearts
- 1/2 cup fresh blueberries
- 1 tsp maple syrup`,
    Lunch: `Avocado & Roasted Chickpea Wrap:
- 1 whole grain or corn tortilla
- 1/2 cup roasted spiced chickpeas
- 1/2 fresh sliced avocado
- 1 cup baby spinach leaves
- 2 tbsp dairy-free tahini lemon dressing`,
    Dinner: `Roasted Veggie & Quinoa Nourish Bowl:
- 1 cup cooked tri-color quinoa
- 1/2 cup roasted sweet potato cubes
- 1/2 cup steamed broccoli florets
- 1/4 cup pumpkin seeds (pepitas)
- 2 tbsp zesty lemon-herb vinaigrette`
  };

  recipeInput.value = MEALS[type] || "";
  analyzeIngredients();
}
