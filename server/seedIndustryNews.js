import "dotenv/config";
import connectDB from "./config/db.js";
import IndustryNews from "./models/IndustryNews.js";

const seedIndustryNews = async () => {
  try {
    await connectDB();
    
    const sampleNews = [
      {
        title: "VR Training Becomes Mandatory in Manufacturing Sector",
        topic: "Industry",
        source: "Volga Infosys",
        description: "<h2>New Industry Standard</h2><p>Major manufacturing associations have announced that VR training will become a standard practice for safety protocols by 2025.</p><h2>Implications</h2><p>This shift is expected to drive massive adoption of immersive training technologies across the industrial sector.</p>",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38e71",
        publishedAt: new Date("2024-05-15"),
        url: "https://volgainfosys.com/news/vr-training-mandatory",
        order: 0
      },
      {
        title: "AR Adoption Surges in Retail: 2024 Trends Report",
        topic: "Trends",
        source: "Tech Insights",
        description: "<h2>Explosive Growth</h2><p>Retail AR usage has grown by 300% this year as more brands adopt virtual try-on and product visualization tools.</p><h2>What's Driving This?</h2><p>Improved smartphone capabilities and consumer demand for interactive shopping experiences are key factors.</p>",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
        publishedAt: new Date("2024-05-10"),
        url: "https://volgainfosys.com/news/ar-retail-trends-2024",
        order: 1
      }
    ];

    const existingNews = await IndustryNews.find();
    if (existingNews.length === 0) {
      await IndustryNews.insertMany(sampleNews);
      console.log("✅ Sample industry news added successfully!");
    } else {
      console.log("ℹ️ Industry news already exist!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding industry news:", error);
    process.exit(1);
  }
};

seedIndustryNews();
