// Lightweight query builder for filtering, sorting, field selection and pagination
// Usage: new ApiFeatures(Model.find(baseFilter), req.query).filter().sort().paginate()
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search(fields = []) {
    if (this.queryString.q && fields.length) {
      const regex = new RegExp(this.queryString.q.trim(), 'i');
      this.query = this.query.find({
        $or: fields.map((field) => ({ [field]: regex }))
      });
    }
    return this;
  }

  filter(allowedFilters = {}) {
    const filters = {};
    Object.entries(allowedFilters).forEach(([key, queryParam]) => {
      const value = this.queryString[queryParam];
      if (value !== undefined && value !== '' && value !== 'all') {
        filters[key] = Array.isArray(value) ? { $in: value } : value;
      }
    });

    // Salary range
    if (this.queryString.salaryMin || this.queryString.salaryMax) {
      filters['salary.min'] = {};
      if (this.queryString.salaryMin) filters['salary.min'].$gte = Number(this.queryString.salaryMin);
    }

    this.query = this.query.find(filters);
    return this;
  }

  sort(defaultSort = '-createdAt') {
    const sortMap = {
      newest: '-createdAt',
      oldest: 'createdAt',
      'salary-high': '-salary.max',
      'salary-low': 'salary.min',
      relevant: '-isFeatured -createdAt'
    };
    const sortBy = sortMap[this.queryString.sort] || defaultSort;
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate(defaultLimit = 12) {
    const page = Math.max(1, Number(this.queryString.page) || 1);
    const limit = Math.min(50, Number(this.queryString.limit) || defaultLimit);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

module.exports = ApiFeatures;
