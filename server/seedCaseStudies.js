import "dotenv/config";
import connectDB from "./config/db.js";
import CaseStudy from "./models/CaseStudy.js";

const seedCaseStudies = async () => {
  try {
    await connectDB();
    
    const sampleCaseStudies = [
      {
        title: "Manufacturer Cuts Training Time by 60% with VR",
        industry: "Manufacturing",
        year: "2024",
        description: "<h2>Challenge</h2><p>Our client faced significant training costs and safety concerns with traditional on-site training for heavy machinery.</p><h2>Solution</h2><p>We developed a VR training simulator that replicated real-world scenarios in a safe, virtual environment.</p><h2>Results</h2><p>Training time reduced by 60%, safety incidents dropped by 80%, and overall training costs decreased by 45%.</p>",
        image: "https://images.unsplash.com/photo-1565043589261-1a8f92a0b0a",
        metrics: [
          { value: "60%", label: "Training Time Reduction" },
          { value: "80%", label: "Safety Incident Drop" },
          { value: "45%", label: "Cost Reduction" }
        ],
        author: "Volga Infosys",
        order: 0
      },
      {
        title: "Retail Giant Boosts Sales with AR Configurator",
        industry: "Retail",
        year: "2024",
        description: "<h2>Challenge</h2><p>A leading furniture retailer struggled with high return rates as customers couldn't visualize products in their homes.</p><h2>Solution</h2><p>Built an AR product configurator app that let customers place true-to-scale 3D models in their space.</p><h2>Results</h2><p>Return rates reduced by 35%, sales increased by 50%, and customer satisfaction improved dramatically.</p>",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
        metrics: [
          { value: "35%", label: "Return Rate Reduction" },
          { value: "50%", label: "Sales Increase" }
        ],
        author: "Volga Infosys",
        order: 1
      }
    ];

    const existingCaseStudies = await CaseStudy.find();
    if (existingCaseStudies.length === 0) {
      await CaseStudy.insertMany(sampleCaseStudies);
      console.log("✅ Sample case studies added successfully!");
    } else {
      console.log("ℹ️ Case studies already exist!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding case studies:", error);
    process.exit(1);
  }
};

seedCaseStudies();
