import "dotenv/config";
import connectDB from "./config/db.js";
import IndustryNews from "./models/IndustryNews.js";

const updateNews = async () => {
  try {
    await connectDB();
    
    // Find the first news item and update it with rich HTML content
    const firstNews = await IndustryNews.findOne();
    if (firstNews) {
      firstNews.description = `
        <h2>AI-Powered Smart Glasses: The Next Frontier in XR</h2>
        <p>AI-powered smart glasses are becoming one of the fastest-growing areas in the XR industry. Companies are shifting focus from traditional VR headsets toward lightweight AR glasses that combine artificial intelligence, spatial computing, and real-world interaction.</p>
        
        <h3>Key Features of Next-Gen AR Glasses</h3>
        <ul>
          <li><strong>Advanced AI Integration</strong> - Real-time object recognition and contextual understanding</li>
          <li><strong>Spatial Computing</strong> - Seamless interaction between digital content and physical space</li>
          <li><strong>Lightweight Design</strong> - All-day comfort for enterprise and consumer use</li>
          <li><strong>Real-World Interaction</strong> - Natural gestures and voice commands</li>
        </ul>
        
        <h3>Industry Impact</h3>
        <p>Major technology companies are investing in next-generation wearable devices, pushing AR closer to mainstream adoption across multiple sectors:</p>
        
        <blockquote>
          "The convergence of AI and AR will transform how we work, learn, and interact with the world around us."
          <br>— Industry Expert
        </blockquote>
        
        <h4>Enterprise Applications</h4>
        <ol>
          <li>Healthcare - Medical training and patient education</li>
          <li>Manufacturing - Remote assistance and quality control</li>
          <li>Education - Immersive learning experiences</li>
          <li>Retail - Virtual try-on and product visualization</li>
        </ol>
        
        <p>The future of wearable AR looks incredibly promising, with innovations happening at an unprecedented pace.</p>
      `;
      
      await firstNews.save();
      console.log("✅ Updated news item with rich HTML content!");
    } else {
      console.log("⚠️ No news items found to update.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating news item:", error);
    process.exit(1);
  }
};

updateNews();
