goog.provide('jdp.pred.Comparison');
goog.provide('jdp.pred.comparison.Type');


/**
 * @implements {jdp.pred.Predicate}
 * @param {!jdp.pred.comparison.Type} type
 * @param {object} left - Expression
 * @param {object} right - Expression
 * @constructor
 */
jdp.pred.Comparison = function (type, left, right) {
  this.type_ = type;
  this.left_ = left;
  this.right_ = right;
};

/**
 * @override
 * @returns {object} - Expression
 */
jdp.pred.Comparison.prototype.generateCode = function () {
  return {
    "type": "BinaryExpression",
    "operator": this.type_,
    "left": this.left_,
    "right": this.right_
  };
};


/**
 * @type {!jdp.pred.comparison.Type}
 */
jdp.pred.comparison.Type = {
  EQ: '===',
  GTE: '>=',
  GT: '>',
  LTE: '<=',
  LT: '<',
  NEQ: '!=='
};