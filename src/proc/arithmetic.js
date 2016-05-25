goog.provide('jdp.proc.arithmetic.Operator');
goog.provide('jdp.proc.arithmetic.Type');

goog.require('jdp.utils.codeGen');

/**
 * @param {jdp.proc.arithmetic.Type} type
 * @param {jdp.ColumnDefinition | jdp.proc.arithmetic.Operator | number} valueLeft
 * @param {jdp.ColumnDefinition | jdp.proc.arithmetic.Operator | number} valueRight
 * @constructor
 */
jdp.proc.arithmetic.Operator = function (type, valueLeft, valueRight) {
  /** @private {jdp.proc.arithmetic.Type} */
  this.type_ = type;
  /** @private {jdp.ColumnDefinition | jdp.proc.arithmetic.Operator | jdp.proc.Constant} */
  this.valueLeft_ = valueLeft;
  /** @private {jdp.ColumnDefinition | jdp.proc.arithmetic.Operator | jdp.proc.Constant} */
  this.valueRight_ = valueRight;
};

/**
 * @returns {object} - An Expression object
 */
jdp.proc.arithmetic.Operator.prototype.generateCode = function () {
  return jdp.utils.codeGen.parse(this.generateExpressionString_())[0].expression;
};

jdp.proc.arithmetic.Operator.prototype.generateExpressionString_ = function () {
  var left, right;
  if (this.valueLeft_.getFullName) {
    left = this.valueLeft_.getFullName();
  } else if (this.valueLeft_.generateExpressionString_) {
    left = this.valueLeft_.generateExpressionString_();
  } else {
    left = this.valueLeft_;
  }
  if (this.valueRight_.getFullName) {
    right = this.valueRight_.getFullName();
  } else if (this.valueRight_.generateExpressionString_) {
    right = this.valueRight_.generateExpressionString_();
  } else {
    right = this.valueRight_;
  }
  return '(' + left + this.type_ + right + ')';
};

jdp.proc.arithmetic.Type = {
  ADDITION: '+',
  SUBTRACTION: '-',
  MULTIPLICATION: '*',
  DIVISION: '/'
};
