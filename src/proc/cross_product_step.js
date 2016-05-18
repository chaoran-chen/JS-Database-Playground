goog.provide('jdp.proc.CrossProductStep');

goog.require('jdp.proc.Step');
goog.require('jdp.ColumnDefinition');


/**
 * @implements {jdp.proc.Step}
 * @param {!jdp.proc.Step} childStepLeft
 * @param {!jdp.proc.Step} childStepRight
 * @constructor
 */
jdp.proc.CrossProductStep = function (childStepLeft, childStepRight) {
  this.childStepLeft_ = childStepLeft;
  this.childStepRight_ = childStepRight;
};


/**
 * @override
 * @param prefix
 */
jdp.proc.CrossProductStep.prototype.generateCode = function (prefix) {
  var code,
    declarations,
    innerBody,
    columnDefinitions,
    fragmentLeft,
    fragmentRight;
  fragmentLeft = this.childStepLeft_.generateCode(prefix + 'l');
  fragmentRight = this.childStepRight_.generateCode(prefix + 'r');
  code = fragmentLeft.code;
  Array.prototype.push.apply(fragmentLeft.innerBody, fragmentRight.code);
  innerBody = fragmentRight.innerBody;
  declarations = fragmentLeft.declarations.concat(fragmentRight.declarations);
  columnDefinitions = fragmentLeft.columnDefinitions.concat(fragmentRight.columnDefinitions);
  return new jdp.proc.StepCodeFragment(code, innerBody, declarations, columnDefinitions);
};