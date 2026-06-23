import "dotenv/config";
import connectDB from "./config/db.js";
import AutoResponse from "./models/AutoResponse.js";

const create = async () => {
  try {
    await connectDB();

    const existing = await AutoResponse.findOne({
      responseType: "simple",
      enabled: true,
      respondToContactForm: true
    });

    if (existing) {
      console.log("Auto-response already exists:", existing._id);
      process.exit(0);
    }

    const doc = await AutoResponse.create({
      responseType: "simple",
      subject: "Thank you for contacting VOLGA",
      message: "<p>We received your message and will reply soon.</p>",
      respondToContactForm: true,
      respondToAllEmails: false,
      respondOnlyOnce: true,
      delaySeconds: 0,
      enabled: true
    });

    console.log("Created auto-response:", doc._id);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

create();
