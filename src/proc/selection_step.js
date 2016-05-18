goog.provide('jdp.proc.SelectionStep');

goog.require('jdp.proc.Step');
goog.require('jdp.ColumnDefinition');


/**
 * @implements {jdp.proc.Step}
 * @param {!jdp.proc.Step} childStep
 * @param {jdp.pred.Predicate} predicate
 * @constructor
 */
jdp.proc.SelectionStep = function (childStep, predicate) {
  /** @private {!jdp.proc.Step} */
  this.childStep_ = childStep;

  /** @private{jdp.pred.Predicate} */
  this.predicate_ = predicate;
};


/**
 * @override
 * @param prefix
 */
jdp.proc.SelectionStep.prototype.generateCode = function (prefix) {
  var innerBody = [],
    fragment;
  fragment = this.childStep_.generateCode(prefix + 'p');
  fragment.innerBody.push(
    {
      "type": "IfStatement",
      "test": this.predicate_.generateCode(),
      "consequent": {
        "type": "BlockStatement",
        "body": innerBody
      },
      "alternate": null
    }
  );
  return new jdp.proc.StepCodeFragment(fragment.code, innerBody, fragment.declarations, fragment.columnDefinitions);
};