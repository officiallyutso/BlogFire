const { db } = require('../config/firebase');

exports.firestore = {
  docToJson: (doc) => {
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data()
    };
  },

  queryToJson: (querySnapshot) => {
    const results = [];
    querySnapshot.forEach(doc => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return results;
  },

  paginateQuery: async (query, page = 1, limit = 10) => {
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;
    
    const snapshot = await query
      .limit(limitNumber)
      .offset((pageNumber - 1) * limitNumber)
      .get();
    
    return {
      data: exports.firestore.queryToJson(snapshot),
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    };
  }
};

exports.formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};