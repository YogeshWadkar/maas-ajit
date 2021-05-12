module.exports = function(Model, options) {
  Model.defineProperty("createdon", { type: Date, default: "$now" });
  Model.defineProperty("modifiedon", { type: Date, default: "$now" });
};
