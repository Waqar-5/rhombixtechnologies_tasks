/**
 * Chainable query builder wrapping a Mongoose Query object, giving every
 * "list" endpoint (blogs, users, comments, categories...) consistent
 * filtering, search, sorting, field selection, and pagination behavior
 * from a single shared implementation instead of reimplementing it per route.
 *
 * Usage:
 *   const features = new ApiFeatures(Blog.find(), req.query)
 *     .filter()
 *     .search(['title', 'excerpt'])
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *   const results = await features.query;
 *   const total = await features.countTotal(Blog);
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'q'];
    const queryObj = { ...this.queryString };
    excludedFields.forEach((field) => delete queryObj[field]);

    // Support gte/gt/lte/lt operators, e.g. ?views[gte]=100
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(fields = []) {
    const term = this.queryString.search || this.queryString.q;
    if (term && fields.length > 0) {
      // Uses the text index defined on the model (see Blog/User schemas)
      // when searching a single 'title/content' style combo; fall back to
      // regex OR-search across explicit fields for more targeted searches.
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      this.query = this.query.find({
        $or: fields.map((field) => ({ [field]: regex })),
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(this.queryString.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }

  /**
   * Runs a separate count query (ignoring pagination) against the same
   * filter/search conditions, needed to compute total pages for the client.
   */
  async countTotal(Model) {
    const countQuery = this.query.model.find(this.query.getFilter());
    const total = await Model.countDocuments(countQuery.getFilter());
    const { page = 1, limit = 10 } = this.pagination || {};
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = ApiFeatures;
