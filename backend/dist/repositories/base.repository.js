"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async findById(id) {
        return await this.model.findById(id);
    }
    async findOne(filter) {
        return await this.model.findOne(filter);
    }
    async find(filter = {}) {
        return await this.model.find(filter);
    }
    async create(data) {
        return await this.model.create(data);
    }
    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id);
        return result !== null;
    }
    async countDocuments(filter = {}) {
        return await this.model.countDocuments(filter);
    }
}
exports.BaseRepository = BaseRepository;
