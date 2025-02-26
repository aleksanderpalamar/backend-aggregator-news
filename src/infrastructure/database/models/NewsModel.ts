import mongoose, { Schema, Document } from "mongoose";
import { News } from "../../../domain/entities/News";

export interface NewsDocument extends Document, Omit<News, "id"> {
  _id: string;
  toEntity(): News;
}

const NewsSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  resume: { type: String, required: true },
  datePublished: { type: Date, required: true },
  source: { type: String, required: true },
  author: { type: String, default: "Unknown" },
  categories: [{ type: String }],
  urlImages: { type: String },
  urlOriginal: { type: String, required: true, unique: true },
},{
  timestamps: true,  
  // Indexes to optimize frequent searches
  indexes: [
    { categories: 1 },
    { datePublished: -1 },
    { title: "text", content: "text", resume: "text" },
  ]
});

NewsSchema.methods.toEntity = function(): News {
  return {
    id: this._id.toString(),
    title: this.title,
    content: this.content,
    resume: this.resume,
    datePublished: this.datePublished,
    source: this.source,
    author: this.author,
    categories: this.categories,
    urlImages: this.urlImages,
    urlOriginal: this.urlOriginal,
  };
};

export const NewsModel = mongoose.model<NewsDocument>("News", NewsSchema);