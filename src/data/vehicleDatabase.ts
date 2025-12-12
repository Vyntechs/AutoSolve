// Vehicle database with years, makes, models, and engines
// This is a comprehensive database for automotive diagnostics

export interface VehicleEngine {
  name: string;
  displacement: string;
  fuelType: string;
}

export interface VehicleModel {
  name: string;
  engines: VehicleEngine[];
}

export interface VehicleMake {
  name: string;
  models: Record<string, VehicleModel>;
}

// Generate years from 1980 to current year
export const getYears = (): string[] => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear; year >= 1980; year--) {
    years.push(year.toString());
  }
  return years;
};

// Major automotive manufacturers and their popular models
export const vehicleDatabase: Record<string, VehicleMake> = {
  "Ford": {
    name: "Ford",
    models: {
      "F-150": {
        name: "F-150",
        engines: [
          { name: "3.3L V6", displacement: "3.3L", fuelType: "Gas" },
          { name: "2.7L EcoBoost V6", displacement: "2.7L", fuelType: "Gas" },
          { name: "3.5L EcoBoost V6", displacement: "3.5L", fuelType: "Gas" },
          { name: "5.0L V8", displacement: "5.0L", fuelType: "Gas" },
          { name: "3.0L Power Stroke Diesel", displacement: "3.0L", fuelType: "Diesel" },
        ],
      },
      "Mustang": {
        name: "Mustang",
        engines: [
          { name: "2.3L EcoBoost I4", displacement: "2.3L", fuelType: "Gas" },
          { name: "5.0L Coyote V8", displacement: "5.0L", fuelType: "Gas" },
          { name: "5.2L Predator V8", displacement: "5.2L", fuelType: "Gas" },
        ],
      },
      "Explorer": {
        name: "Explorer",
        engines: [
          { name: "2.3L EcoBoost I4", displacement: "2.3L", fuelType: "Gas" },
          { name: "3.0L EcoBoost V6", displacement: "3.0L", fuelType: "Gas" },
          { name: "3.3L Hybrid V6", displacement: "3.3L", fuelType: "Hybrid" },
        ],
      },
      "Escape": {
        name: "Escape",
        engines: [
          { name: "1.5L EcoBoost I3", displacement: "1.5L", fuelType: "Gas" },
          { name: "2.0L EcoBoost I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "2.5L Hybrid I4", displacement: "2.5L", fuelType: "Hybrid" },
        ],
      },
    },
  },
  "Chevrolet": {
    name: "Chevrolet",
    models: {
      "Silverado 1500": {
        name: "Silverado 1500",
        engines: [
          { name: "2.7L Turbo I4", displacement: "2.7L", fuelType: "Gas" },
          { name: "5.3L V8", displacement: "5.3L", fuelType: "Gas" },
          { name: "6.2L V8", displacement: "6.2L", fuelType: "Gas" },
          { name: "3.0L Duramax Diesel", displacement: "3.0L", fuelType: "Diesel" },
        ],
      },
      "Camaro": {
        name: "Camaro",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "3.6L V6", displacement: "3.6L", fuelType: "Gas" },
          { name: "6.2L LT1 V8", displacement: "6.2L", fuelType: "Gas" },
        ],
      },
      "Equinox": {
        name: "Equinox",
        engines: [
          { name: "1.5L Turbo I4", displacement: "1.5L", fuelType: "Gas" },
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
        ],
      },
      "Tahoe": {
        name: "Tahoe",
        engines: [
          { name: "5.3L V8", displacement: "5.3L", fuelType: "Gas" },
          { name: "6.2L V8", displacement: "6.2L", fuelType: "Gas" },
          { name: "3.0L Duramax Diesel", displacement: "3.0L", fuelType: "Diesel" },
        ],
      },
    },
  },
  "Toyota": {
    name: "Toyota",
    models: {
      "Camry": {
        name: "Camry",
        engines: [
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "3.5L V6", displacement: "3.5L", fuelType: "Gas" },
          { name: "2.5L Hybrid I4", displacement: "2.5L", fuelType: "Hybrid" },
        ],
      },
      "Corolla": {
        name: "Corolla",
        engines: [
          { name: "1.8L I4", displacement: "1.8L", fuelType: "Gas" },
          { name: "2.0L I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "1.8L Hybrid I4", displacement: "1.8L", fuelType: "Hybrid" },
        ],
      },
      "RAV4": {
        name: "RAV4",
        engines: [
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "2.5L Hybrid I4", displacement: "2.5L", fuelType: "Hybrid" },
          { name: "2.5L Prime PHEV", displacement: "2.5L", fuelType: "PHEV" },
        ],
      },
      "Tacoma": {
        name: "Tacoma",
        engines: [
          { name: "2.7L I4", displacement: "2.7L", fuelType: "Gas" },
          { name: "3.5L V6", displacement: "3.5L", fuelType: "Gas" },
        ],
      },
      "Tundra": {
        name: "Tundra",
        engines: [
          { name: "3.5L Twin-Turbo V6", displacement: "3.5L", fuelType: "Gas" },
          { name: "3.5L Hybrid V6", displacement: "3.5L", fuelType: "Hybrid" },
        ],
      },
    },
  },
  "Honda": {
    name: "Honda",
    models: {
      "Accord": {
        name: "Accord",
        engines: [
          { name: "1.5L Turbo I4", displacement: "1.5L", fuelType: "Gas" },
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "2.0L Hybrid I4", displacement: "2.0L", fuelType: "Hybrid" },
        ],
      },
      "Civic": {
        name: "Civic",
        engines: [
          { name: "2.0L I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "1.5L Turbo I4", displacement: "1.5L", fuelType: "Gas" },
          { name: "2.0L Turbo I4 Type R", displacement: "2.0L", fuelType: "Gas" },
        ],
      },
      "CR-V": {
        name: "CR-V",
        engines: [
          { name: "1.5L Turbo I4", displacement: "1.5L", fuelType: "Gas" },
          { name: "2.0L Hybrid I4", displacement: "2.0L", fuelType: "Hybrid" },
        ],
      },
      "Pilot": {
        name: "Pilot",
        engines: [
          { name: "3.5L V6", displacement: "3.5L", fuelType: "Gas" },
        ],
      },
    },
  },
  "Nissan": {
    name: "Nissan",
    models: {
      "Altima": {
        name: "Altima",
        engines: [
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "2.0L Turbo VC I4", displacement: "2.0L", fuelType: "Gas" },
        ],
      },
      "Sentra": {
        name: "Sentra",
        engines: [
          { name: "2.0L I4", displacement: "2.0L", fuelType: "Gas" },
        ],
      },
      "Rogue": {
        name: "Rogue",
        engines: [
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
        ],
      },
      "Frontier": {
        name: "Frontier",
        engines: [
          { name: "3.8L V6", displacement: "3.8L", fuelType: "Gas" },
        ],
      },
    },
  },
  "Ram": {
    name: "Ram",
    models: {
      "1500": {
        name: "1500",
        engines: [
          { name: "3.6L V6", displacement: "3.6L", fuelType: "Gas" },
          { name: "5.7L HEMI V8", displacement: "5.7L", fuelType: "Gas" },
          { name: "3.0L EcoDiesel V6", displacement: "3.0L", fuelType: "Diesel" },
        ],
      },
      "2500": {
        name: "2500",
        engines: [
          { name: "6.4L HEMI V8", displacement: "6.4L", fuelType: "Gas" },
          { name: "6.7L Cummins Diesel", displacement: "6.7L", fuelType: "Diesel" },
        ],
      },
    },
  },
  "Jeep": {
    name: "Jeep",
    models: {
      "Wrangler": {
        name: "Wrangler",
        engines: [
          { name: "3.6L V6", displacement: "3.6L", fuelType: "Gas" },
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "3.0L EcoDiesel V6", displacement: "3.0L", fuelType: "Diesel" },
          { name: "2.0L Turbo Hybrid I4", displacement: "2.0L", fuelType: "PHEV" },
        ],
      },
      "Grand Cherokee": {
        name: "Grand Cherokee",
        engines: [
          { name: "3.6L V6", displacement: "3.6L", fuelType: "Gas" },
          { name: "5.7L V8", displacement: "5.7L", fuelType: "Gas" },
          { name: "6.4L V8", displacement: "6.4L", fuelType: "Gas" },
          { name: "3.0L Turbo I6", displacement: "3.0L", fuelType: "Gas" },
        ],
      },
      "Cherokee": {
        name: "Cherokee",
        engines: [
          { name: "2.4L I4", displacement: "2.4L", fuelType: "Gas" },
          { name: "3.2L V6", displacement: "3.2L", fuelType: "Gas" },
        ],
      },
    },
  },
  "GMC": {
    name: "GMC",
    models: {
      "Sierra 1500": {
        name: "Sierra 1500",
        engines: [
          { name: "2.7L Turbo I4", displacement: "2.7L", fuelType: "Gas" },
          { name: "5.3L V8", displacement: "5.3L", fuelType: "Gas" },
          { name: "6.2L V8", displacement: "6.2L", fuelType: "Gas" },
          { name: "3.0L Duramax Diesel", displacement: "3.0L", fuelType: "Diesel" },
        ],
      },
      "Yukon": {
        name: "Yukon",
        engines: [
          { name: "5.3L V8", displacement: "5.3L", fuelType: "Gas" },
          { name: "6.2L V8", displacement: "6.2L", fuelType: "Gas" },
        ],
      },
    },
  },
  "Dodge": {
    name: "Dodge",
    models: {
      "Charger": {
        name: "Charger",
        engines: [
          { name: "3.6L V6", displacement: "3.6L", fuelType: "Gas" },
          { name: "5.7L HEMI V8", displacement: "5.7L", fuelType: "Gas" },
          { name: "6.4L HEMI V8", displacement: "6.4L", fuelType: "Gas" },
          { name: "6.2L Supercharged V8", displacement: "6.2L", fuelType: "Gas" },
        ],
      },
      "Challenger": {
        name: "Challenger",
        engines: [
          { name: "3.6L V6", displacement: "3.6L", fuelType: "Gas" },
          { name: "5.7L HEMI V8", displacement: "5.7L", fuelType: "Gas" },
          { name: "6.4L HEMI V8", displacement: "6.4L", fuelType: "Gas" },
          { name: "6.2L Supercharged V8", displacement: "6.2L", fuelType: "Gas" },
        ],
      },
      "Durango": {
        name: "Durango",
        engines: [
          { name: "3.6L V6", displacement: "3.6L", fuelType: "Gas" },
          { name: "5.7L HEMI V8", displacement: "5.7L", fuelType: "Gas" },
          { name: "6.4L HEMI V8", displacement: "6.4L", fuelType: "Gas" },
        ],
      },
    },
  },
  "BMW": {
    name: "BMW",
    models: {
      "3 Series": {
        name: "3 Series",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "3.0L Turbo I6", displacement: "3.0L", fuelType: "Gas" },
        ],
      },
      "5 Series": {
        name: "5 Series",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "3.0L Turbo I6", displacement: "3.0L", fuelType: "Gas" },
          { name: "4.4L Twin-Turbo V8", displacement: "4.4L", fuelType: "Gas" },
        ],
      },
      "X5": {
        name: "X5",
        engines: [
          { name: "3.0L Turbo I6", displacement: "3.0L", fuelType: "Gas" },
          { name: "4.4L Twin-Turbo V8", displacement: "4.4L", fuelType: "Gas" },
          { name: "3.0L Turbo Diesel I6", displacement: "3.0L", fuelType: "Diesel" },
        ],
      },
    },
  },
  "Mercedes-Benz": {
    name: "Mercedes-Benz",
    models: {
      "C-Class": {
        name: "C-Class",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "3.0L Turbo I6", displacement: "3.0L", fuelType: "Gas" },
        ],
      },
      "E-Class": {
        name: "E-Class",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "3.0L Turbo I6", displacement: "3.0L", fuelType: "Gas" },
        ],
      },
      "GLE": {
        name: "GLE",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "3.0L Turbo I6", displacement: "3.0L", fuelType: "Gas" },
          { name: "4.0L Twin-Turbo V8", displacement: "4.0L", fuelType: "Gas" },
        ],
      },
    },
  },
  "Audi": {
    name: "Audi",
    models: {
      "A4": {
        name: "A4",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
        ],
      },
      "A6": {
        name: "A6",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "3.0L Turbo V6", displacement: "3.0L", fuelType: "Gas" },
        ],
      },
      "Q5": {
        name: "Q5",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
        ],
      },
    },
  },
  "Volkswagen": {
    name: "Volkswagen",
    models: {
      "Jetta": {
        name: "Jetta",
        engines: [
          { name: "1.4L Turbo I4", displacement: "1.4L", fuelType: "Gas" },
          { name: "1.5L Turbo I4", displacement: "1.5L", fuelType: "Gas" },
        ],
      },
      "Tiguan": {
        name: "Tiguan",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
        ],
      },
      "Atlas": {
        name: "Atlas",
        engines: [
          { name: "2.0L Turbo I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "3.6L V6", displacement: "3.6L", fuelType: "Gas" },
        ],
      },
    },
  },
  "Mazda": {
    name: "Mazda",
    models: {
      "Mazda3": {
        name: "Mazda3",
        engines: [
          { name: "2.0L I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "2.5L Turbo I4", displacement: "2.5L", fuelType: "Gas" },
        ],
      },
      "CX-5": {
        name: "CX-5",
        engines: [
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "2.5L Turbo I4", displacement: "2.5L", fuelType: "Gas" },
        ],
      },
      "CX-9": {
        name: "CX-9",
        engines: [
          { name: "2.5L Turbo I4", displacement: "2.5L", fuelType: "Gas" },
        ],
      },
    },
  },
  "Subaru": {
    name: "Subaru",
    models: {
      "Outback": {
        name: "Outback",
        engines: [
          { name: "2.5L H4", displacement: "2.5L", fuelType: "Gas" },
          { name: "2.4L Turbo H4", displacement: "2.4L", fuelType: "Gas" },
        ],
      },
      "Forester": {
        name: "Forester",
        engines: [
          { name: "2.5L H4", displacement: "2.5L", fuelType: "Gas" },
        ],
      },
      "Impreza": {
        name: "Impreza",
        engines: [
          { name: "2.0L H4", displacement: "2.0L", fuelType: "Gas" },
          { name: "2.5L H4", displacement: "2.5L", fuelType: "Gas" },
        ],
      },
      "WRX": {
        name: "WRX",
        engines: [
          { name: "2.4L Turbo H4", displacement: "2.4L", fuelType: "Gas" },
        ],
      },
    },
  },
  "Hyundai": {
    name: "Hyundai",
    models: {
      "Elantra": {
        name: "Elantra",
        engines: [
          { name: "2.0L I4", displacement: "2.0L", fuelType: "Gas" },
          { name: "1.6L Turbo I4", displacement: "1.6L", fuelType: "Gas" },
        ],
      },
      "Sonata": {
        name: "Sonata",
        engines: [
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "1.6L Turbo I4", displacement: "1.6L", fuelType: "Gas" },
        ],
      },
      "Tucson": {
        name: "Tucson",
        engines: [
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "1.6L Turbo I4", displacement: "1.6L", fuelType: "Gas" },
          { name: "1.6L Turbo Hybrid I4", displacement: "1.6L", fuelType: "Hybrid" },
        ],
      },
      "Santa Fe": {
        name: "Santa Fe",
        engines: [
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "2.5L Turbo I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "1.6L Turbo Hybrid I4", displacement: "1.6L", fuelType: "Hybrid" },
        ],
      },
    },
  },
  "Kia": {
    name: "Kia",
    models: {
      "Forte": {
        name: "Forte",
        engines: [
          { name: "2.0L I4", displacement: "2.0L", fuelType: "Gas" },
        ],
      },
      "Optima": {
        name: "Optima",
        engines: [
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "1.6L Turbo I4", displacement: "1.6L", fuelType: "Gas" },
        ],
      },
      "Sorento": {
        name: "Sorento",
        engines: [
          { name: "2.5L I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "2.5L Turbo I4", displacement: "2.5L", fuelType: "Gas" },
          { name: "1.6L Turbo Hybrid I4", displacement: "1.6L", fuelType: "Hybrid" },
        ],
      },
      "Telluride": {
        name: "Telluride",
        engines: [
          { name: "3.8L V6", displacement: "3.8L", fuelType: "Gas" },
        ],
      },
    },
  },
  "Tesla": {
    name: "Tesla",
    models: {
      "Model 3": {
        name: "Model 3",
        engines: [
          { name: "Single Motor", displacement: "N/A", fuelType: "Electric" },
          { name: "Dual Motor AWD", displacement: "N/A", fuelType: "Electric" },
          { name: "Performance", displacement: "N/A", fuelType: "Electric" },
        ],
      },
      "Model Y": {
        name: "Model Y",
        engines: [
          { name: "Single Motor RWD", displacement: "N/A", fuelType: "Electric" },
          { name: "Dual Motor AWD", displacement: "N/A", fuelType: "Electric" },
          { name: "Performance", displacement: "N/A", fuelType: "Electric" },
        ],
      },
      "Model S": {
        name: "Model S",
        engines: [
          { name: "Dual Motor AWD", displacement: "N/A", fuelType: "Electric" },
          { name: "Plaid", displacement: "N/A", fuelType: "Electric" },
        ],
      },
      "Model X": {
        name: "Model X",
        engines: [
          { name: "Dual Motor AWD", displacement: "N/A", fuelType: "Electric" },
          { name: "Plaid", displacement: "N/A", fuelType: "Electric" },
        ],
      },
    },
  },
};

// Helper functions
export const getMakes = (): string[] => {
  return Object.keys(vehicleDatabase).sort();
};

export const getModels = (make: string): string[] => {
  if (!make || !vehicleDatabase[make]) return [];
  return Object.keys(vehicleDatabase[make].models).sort();
};

export const getEngines = (make: string, model: string): VehicleEngine[] => {
  if (!make || !model || !vehicleDatabase[make]?.models[model]) return [];
  return vehicleDatabase[make].models[model].engines;
};
