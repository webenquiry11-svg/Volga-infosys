import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    company: {
      type: String
    },
    country: {
      type: String
    },
    serviceInterested: {
      type: String
    },
    message: {
      type: String,
      required: true
    },
    budget: {
      type: String
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new"
    },
    tags: {
      type: [String],
      default: []
    },
    followUpDate: {
      type: Date
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  {
    timestamps: true
  }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;