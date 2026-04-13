
import mongoose, { Document, Model, UpdateQuery } from "mongoose";

type QueryFilter<T extends Document> = Parameters<
  typeof mongoose.sanitizeFilter<T>
>[0];
 

export interface IBaseRepository<T extends Document> {
  findById(id: string): Promise<T | null>;
  findOne(filter: QueryFilter<T>): Promise<T | null>;
  find(filter: QueryFilter<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  countDocuments(filter: QueryFilter<T>): Promise<number>;
}



export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private model: Model<T>) { }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findOne(filter: QueryFilter<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  async find(filter: QueryFilter<T> = {}): Promise<T[]> {
    return await this.model.find(filter);
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }

  async countDocuments(filter: QueryFilter<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }
}
