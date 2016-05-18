goog.provide('jdp.proc.Step');
goog.provide('jdp.proc.StepCodeFragment');


/** @interface */
jdp.proc.Step = function () {
};

/**
 * @param {string} prefix - The prefix of variables which are to declare.
 * @return {!jdp.proc.StepCodeFragment}
 */
jdp.proc.Step.prototype.generateCode = function (prefix) {
};

/**
 * 
 * @param {!Array<object>} code - An array of Statement Objects
 * @param {object} innerBody
 * @param {!Array<object>} declarations
 * @param {!Array<jdp.ColumnDefinition>} columnDefinitions
 * @constructor
 */
jdp.proc.StepCodeFragment = function(code, innerBody, declarations, columnDefinitions){
  this.code = code;
  this.innerBody = innerBody;
  this.declarations = declarations;
  this.columnDefinitions = columnDefinitions;
};