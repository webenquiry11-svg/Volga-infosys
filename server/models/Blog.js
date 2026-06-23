import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const blogSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  slug:         { type: String, unique: true },
  excerpt:      { type: String, required: true },
  content:      { type: String, default: '' },
  category:     { type: String, required: true },
  coverImage:   { type: String },
  image:        { type: String },
  author:       { type: String, default: 'Volga Infosys' },
  readTime:     { type: String, default: '5 min read' },
  status:       { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'published' 
  },
  featured:     { type: Boolean, default: false },
  order:        { type: Number, default: 0 },
  seoTitle:     { type: String },
  seoDescription: { type: String }
}, { timestamps: true });

// Pre-save hook to generate and update slug
blogSchema.pre('save', async function () {
  if (!this.isModified('title')) return;

  const baseSlug = slugify(this.title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await mongoose.models.Blog.findOne({ slug, _id: { $ne: this._id } });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
});

export default mongoose.model('Blog', blogSchema);
