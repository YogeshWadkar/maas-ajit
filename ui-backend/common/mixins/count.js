module.exports = function(Model, options) {
  Model.afterRemote("find", async function event(ctx, recs, next) {
    if (Array.isArray(recs)) {
      var filter = ctx.args.filter;

      var count = recs.length;
      if (filter && filter.where) {
        count = await Model.count(filter["where"]);
      } else {
        count = await Model.count();
      }

      ctx.result = {
        count: count,
        data: recs
      };
    }

    next();
  });
};
