goog.provide('jdp.pred.Not');
goog.provide('jdp.pred.not.Type');


/**
 * @implements {jdp.pred.Predicate}
 * @param {!jdp.pred.Predicate} predicate
 * @constructor
 */
jdp.pred.Not = function (predicate) {
  this.predicate_ = predicate;
};

/**
 * @override
 * @returns {object} - Expression
 */
jdp.pred.Not.prototype.generateCode = function () {
  return {
    "type": "UnaryExpression",
    "operator": "!",
    "argument": this.predicate_.generateCode(),
    "prefix": true
  };
};