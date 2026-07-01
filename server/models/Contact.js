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
      enum: ["new", "contacted", "proposal", "closed"],
      default: "new"
    },
    tags: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      default: ""
    },
    followUpDate: {
      type: Date
    },
    source: {
      type: String,
      default: "contact-form"
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