goog.provide('jdp.pred.Connection');
goog.provide('jdp.pred.connection.Type');


/**
 * @implements {jdp.pred.Predicate}
 * @param {!jdp.pred.connection.Type} type
 * @param {!jdp.pred.Predicate} left
 * @param {!jdp.pred.Predicate} right
 * @constructor
 */
jdp.pred.Connection = function (type, left, right) {
  this.type_ = type;
  this.predicate_ = left;
  this.right_ = right;
};

/**
 * @override
 * @returns {object} - Expression
 */
jdp.pred.Connection.prototype.generateCode = function () {
  return {
    "type": "LogicalExpression",
    "operator": this.type_,
    "left": this.predicate_.generateCode(),
    "right": this.right_.generateCode()
  };
};


/**
 * @type {!jdp.pred.connection.Type}
 */
jdp.pred.connection.Type = {
  AND: '&&',
  OR: '||'
};