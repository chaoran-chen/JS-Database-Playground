goog.provide('jdp.proc.ChiStep');

goog.require('jdp.proc.Step');
goog.require('jdp.proc.CountAggregation');
goog.require('jdp.proc.SumAggregation');
goog.require('jdp.proc.AvgAggregation');
goog.require('jdp.ColumnDefinition');
goog.require('lf.Type');


/**
 * @implements {jdp.proc.Step}
 * @param {!jdp.proc.Step} childStep
 * @param {!Array<{alias: string, arithmetic: jdp.proc.arithmetic.Operator}>} aliasArithmeticPairs
 * @constructor
 */
jdp.proc.ChiStep = function (childStep, aliasArithmeticPairs) {
  /** @private {!jdp.proc.Step} */
  this.childStep_ = childStep;
  /** @private {!Array<{alias: string, arithmetic: jdp.proc.arithmetic.Operator}>} */
  this.aliasArithmeticPairs_ = aliasArithmeticPairs;
};

/**
 * @override
 * @param prefix
 */
jdp.proc.ChiStep.prototype.generateCode = function (prefix) {
  var code,
    declarations,
    columnDefinitions,
    f;
  var i,
    codeString = '',
    aap;
  f = this.childStep_.generateCode(prefix + 'p');
  declarations = f.declarations;
  code = f.code;
  columnDefinitions = f.columnDefinitions;
  for (i = 0; i < this.aliasArithmeticPairs_.length; i++) {
    aap = this.aliasArithmeticPairs_[i];
    codeString += aap.alias + ' = ' + aap.arithmetic.generateExpressionString() + ';';
    declarations.push(jdp.utils.codeGen.declaration(aap.alias));
    columnDefinitions.push(new jdp.ColumnDefinition(aap.alias, lf.Type.NUMBER));
  }
  Array.prototype.push.apply(f.innerBody, jdp.utils.codeGen.parse(codeString));
  return new jdp.proc.StepCodeFragment(code, f.innerBody, declarations, columnDefinitions);
};
