import { Document, Model, FilterQuery, UpdateQuery } from 'mongoose';

export interface IBaseRepository<T extends Document> {
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  countDocuments(filter: FilterQuery<T>): Promise<number>;
}

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  async find(filter: FilterQuery<T> = {}): Promise<T[]> {
    return await this.model.find(filter);
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }
}