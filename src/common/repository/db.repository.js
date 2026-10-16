
// Create
export const create = async ({ model, data = [], options = {} } = {}) => {

    return await model.create(data, options);

}

// CreateOne
export const createOne = async ({ model, data, options = {} } = {}) => {

    const [doc] = await model.create([data], options) || [];
    return doc;

}

// InsertOne
export const insertone = async ({ model, data, options = {} } = {}) => {
    return await model.insertOne(data, options);
};

// InsertMany
export const insertMany = async ({ model, data, options = {} } = {}) => {
    return await model.insertMany(data, options);
};

// Find
export const find = async ({ model, filter = {}, options = {}, select = '' } = {}) => {
    const doc = model.find(filter, options).select(select);
    if (options.populate) {
        doc.populate(options.populate)
    }

    if (options.skip) {
        doc.skip(options.skip)
    }
    if (options.limit) {
        doc.skip(options.limit)
    }

    if (options.lean) {
        doc.lean(options.lean)
    }

    return await doc.exec()
};

// FindOne
export const findOne = async ({ model, filter = {}, options = {}, select = '' } = {}) => {
    const doc = model.findOne(filter, options).select(select);
    if (options.populate) {
        doc.populate(options.populate)
    }

    if (options.lean) {
        doc.lean(options.lean)
    }
    return await doc.exec();
};

// FindById
export const findById = async ({ model, id, options = {} } = {}) => {
    let doc = model.findById(id);
    if (options.select) {
        doc.select(options.select)
    }
    if (options.populate) {
        doc.populate(options.populate)
    }

    if (options.lean) {
        doc.lean(options.lean)
    }
    return await doc.exec()
};

// UpdateOne
export const updateOne = async ({
    model,
    update = {},
    filter = {},
    options = {}
} = {}) => {
    return await model.updateOne(
        filter,
        {
            ...update,
            $inc: { ...update.$inc, __v: 1 }
        },
        {
            new: true,
            runValidators: true,
            ...options
        }
    );
};

// UpdateMany
export const updateMany = async ({
    model,
    update = {},
    filter = {},
    options = {}
} = {}) => {
    return await model.updateMany(
        filter,
        {
            ...update,
            $inc: { ...update.$inc, __v: 1 }
        },
        {
            new: true,
            runValidators: true,
            ...options
        }
    );
};

// FindOneAndUpdate
export const findOneAndUpdate = async ({
    model,
    update = {},
    filter = {},
    options = {}
} = {}) => {
    return await model.findOneAndUpdate(
        filter,
        {
            ...update,
            $inc: { ...update.$inc, __v: 1 }
        },
        {
            new: true,
            runValidators: true,
            ...options
        }
    );
};

// FindByIdAndUpdate
export const findByIdAndUpdate = async ({
    model,
    id,
    update = {},
    options = {}
} = {}) => {
    return await model.findByIdAndUpdate(
        id,
        {
            ...update,
            $inc: { ...update.$inc, __v: 1 }
        },
        {
            new: true,
            runValidators: true,
            ...options
        }
    );
};

// UpdateOne - Increment
export const updateone = async ({
    model,
    filter = {},
    update = {},
    options = {}
} = {}) => {
    return await model.updateOne(
        filter,
        {
            $inc: { ...update, __v: 1 }
        },
        options
    );
};

// UpdateMany - Increment
export const incrementMany = async ({
    model,
    filter = {},
    update = {},
    options = {}
} = {}) => {
    return await model.updateMany(
        filter,
        {
            $inc: { ...update, __v: 1 }
        },
        options
    );
};

// FindOneAndUpdate - Increment
export const findOneAndIncrement = async ({
    model,
    filter = {},
    update = {},
    options = {}
} = {}) => {
    return await model.findOneAndUpdate(
        filter,
        {
            $inc: { ...update, __v: 1 }
        },
        {
            new: true,
            ...options
        }
    );
};

// FindByIdAndUpdate - Increment
export const findByIdAndIncrement = async ({
    model,
    id,
    update = {},
    options = {}
} = {}) => {
    return await model.findByIdAndUpdate(
        id,
        {
            $inc: { ...update, __v: 1 }
        },
        {
            new: true,
            ...options
        }
    );
};

// DeleteOne
export const deleteOne = async ({ model, filter = {}, options = {} } = {}) => {
    return await model.deleteOne(filter, options);
};

// DeleteMany
export const deleteMany = async ({ model, filter = {}, options = {} } = {}) => {
    return await model.deleteMany(filter, options);
};

// FindOneAndDelete
export const findOneAndDelete = async ({ model, filter = {}, options = {} } = {}) => {
    return await model.findOneAndDelete(filter, options);
};

// FindByIdAndDelete
export const findByIdAndDelete = async ({ model, id, options = {} } = {}) => {
    return await model.findByIdAndDelete(id, options);
};

// CountDocuments
export const countDocuments = async ({ model, filter = {}, options = {} } = {}) => {
    return await model.countDocuments(filter, options);
};

// Exists
export const exists = async ({ model, filter = {} } = {}) => {
    return await model.exists(filter);
};

// Aggregate
export const aggregate = async ({ model, pipeline = [], options = {} } = {}) => {
    return await model.aggregate(pipeline, options);
};

// Populate
export const populate = async ({ model, docs, populateOptions, options = {} } = {}) => {
    return await model.populate(docs, populateOptions, options);
};

//Distinct  (Data without repeate)
export const distinct = async ({
    model,
    field,
    filter = {},
    options = {}
} = {}) => {
    return await model.distinct(field, filter, options);
};