import { storage } from "./storage";

async function seedColdStorages() {
    console.log("Seeding cold storages...");
    await storage.clearColdStorages();

    const storages = [
        // Punjab
        { name: "Ludhiana Cold Chain Hub", state: "Punjab", district: "Ludhiana", address: "G.T. Road, Near Sahnewal Airport, Ludhiana", capacity: "12,000 MT", temperatureRange: "-22°C to 10°C", price: "₹2.20 - ₹3.50/kg", phone: "+91 98140-55501", status: "Available", rating: "4.8" },
        { name: "Bathinda Potato Mega Storage", state: "Punjab", district: "Bathinda", address: "Goniana Road, Opp. ITI, Bathinda", capacity: "15,000 MT", temperatureRange: "2°C to 4°C", price: "₹1.80/kg monthly", phone: "+91 98760-44402", status: "Limited", rating: "4.5" },

        // Maharashtra
        { name: "Nashik Grapes Cold Storage", state: "Maharashtra", district: "Nashik", address: "MIDC Ambad, Near Wine Park, Nashik", capacity: "8,000 MT", temperatureRange: "0°C to 2°C", price: "₹4.00/kg (Grape Specialist)", phone: "+91 94222-33303", status: "Available", rating: "4.9" },
        { name: "Vashi Multi-Product Cold Warehouse", state: "Maharashtra", district: "Mumbai", address: "Sector 19, Vashi APMC, Navi Mumbai", capacity: "25,000 MT", temperatureRange: "-18°C to 8°C", price: "₹3.50/kg", phone: "+91 22-27891011", status: "Full", rating: "4.7" },
        { name: "Pune Agro-Frost Logistics", state: "Maharashtra", district: "Pune", address: "Hadapsar Industrial Estate, Pune", capacity: "10,000 MT", temperatureRange: "2°C to 6°C", price: "₹3.20/kg", phone: "+91 98500-11105", status: "Available", rating: "4.6" },

        // Uttar Pradesh
        { name: "Agra Royal Cold Storage", state: "Uttar Pradesh", district: "Agra", address: "Shamsabad Road, Agra", capacity: "20,000 MT", temperatureRange: "2°C to 4°C", price: "₹1.50/kg (Potato Bulk)", phone: "+91 562-2233445", status: "Available", rating: "4.4" },
        { name: "Hapur Central Cold Chain", state: "Uttar Pradesh", district: "Hapur", address: "Near Railway Crossing, Hapur Bypass", capacity: "18,000 MT", temperatureRange: "0°C to 5°C", price: "₹2.00/kg", phone: "+91 99170-88806", status: "Available", rating: "4.3" },

        // Gujarat
        { name: "Gujarat Coastal Cold Storage", state: "Gujarat", district: "Surat", address: "Hazira Port Road, Surat", capacity: "14,000 MT", temperatureRange: "-25°C to 5°C", price: "₹3.80/kg (Seafood & Veg)", phone: "+91 261-2700800", status: "Available", rating: "4.8" },
        { name: "Ahmedabad Urban Cold Link", state: "Gujarat", district: "Ahmedabad", address: "Sarkhej-Gandhinagar Highway, Ahmedabad", capacity: "9,000 MT", temperatureRange: "2°C to 10°C", price: "₹3.40/kg", phone: "+91 79-26800900", status: "Limited", rating: "4.6" },

        // Haryana
        { name: "Sonipat Mega Food Park Storage", state: "Haryana", district: "Sonipat", address: "HSIIDC Rai Industrial Area, Phase-I, Sonipat", capacity: "30,000 MT", temperatureRange: "-30°C to 10°C", price: "₹4.50/kg (Frozen Goods)", phone: "+91 130-2367000", status: "Available", rating: "5.0" },
        { name: "Karnal Rice-Chiller Center", state: "Haryana", district: "Karnal", address: "G.T. Road, Opp. NDRI, Karnal", capacity: "10,000 MT", temperatureRange: "15°C to 18°C (Humidity Controlled)", price: "₹1.20/kg (Grain Care)", phone: "+91 98960-22207", status: "Available", rating: "4.5" },

        // Andhra Pradesh & Telangana
        { name: "Guntur Chili Cold Storage", state: "Andhra Pradesh", district: "Guntur", address: "Chili Market Yard, Guntur", capacity: "22,000 MT", temperatureRange: "4°C to 6°C", price: "₹2.50/kg (Chili Specialized)", phone: "+91 863-2211999", status: "Available", rating: "4.7" },
        { name: "Hyderabad Fresh Grid", state: "Telangana", district: "Rangareddy", address: "ORR Exit 12, Near Shamshabad, Hyderabad", capacity: "11,000 MT", temperatureRange: "2°C to 8°C", price: "₹3.60/kg", phone: "+91 90000-12345", status: "Available", rating: "4.8" },
        { name: "Gadwal Seed Bank Storage", state: "Telangana", district: "Gadwal", address: "Raichur Road, Near APMC, Gadwal", capacity: "5,000 MT", temperatureRange: "10°C to 15°C", price: "₹2.80/kg", phone: "+91 91212-34567", status: "Available", rating: "4.6" },

        // West Bengal
        { name: "Hooghly Potato Grid", state: "West Bengal", district: "Hooghly", address: "Tarkeshwar Road, Hooghly", capacity: "16,000 MT", temperatureRange: "2°C to 4°C", price: "₹1.40/kg", phone: "+91 33-26554433", status: "Full", rating: "4.2" },
        { name: "Siliguri Himalaya Link", state: "West Bengal", district: "Darjeeling", address: "Fulbari Bypass, Siliguri", capacity: "7,000 MT", temperatureRange: "0°C to 5°C", price: "₹3.00/kg", phone: "+91 353-2550111", status: "Available", rating: "4.7" },

        // Karnataka
        { name: "Bangalore Metro Cold Hub", state: "Karnataka", district: "Bangalore", address: "Yeshwanthpur Industrial Area, Bangalore", capacity: "13,000 MT", temperatureRange: "2°C to 8°C", price: "₹3.80/kg", phone: "+91 80-23456789", status: "Limited", rating: "4.8" },
        { name: "Mysore Agro-Chill", state: "Karnataka", district: "Mysore", address: "Hunsur Road, Mysore", capacity: "6,000 MT", temperatureRange: "4°C to 10°C", price: "₹2.90/kg", phone: "+91 821-2511222", status: "Available", rating: "4.5" },

        // Tamil Nadu
        { name: "Chennai Port Storage", state: "Tamil Nadu", district: "Chennai", address: "Ennore Port Road, Chennai", capacity: "20,000 MT", temperatureRange: "-20°C to 4°C", price: "₹4.20/kg", phone: "+91 44-25223344", status: "Available", rating: "4.9" },
        { name: "Coimbatore Textile & Agro Cold", state: "Tamil Nadu", district: "Coimbatore", address: "Pollachi Road, Coimbatore", capacity: "9,000 MT", temperatureRange: "2°C to 6°C", price: "₹3.30/kg", phone: "+91 422-2677889", status: "Available", rating: "4.6" },

        // Madhya Pradesh
        { name: "Indore Malwa Cold Storage", state: "Madhya Pradesh", district: "Indore", address: "Sanwer Road Industrial Area, Indore", capacity: "15,000 MT", temperatureRange: "2°C to 5°C", price: "₹1.90/kg", phone: "+91 731-2556677", status: "Available", rating: "4.4" },
    ];

    for (const s of storages) {
        await storage.createColdStorage(s as any);
    }

    console.log(`Successfully seeded ${storages.length} cold storages.`);
}

export default seedColdStorages;
