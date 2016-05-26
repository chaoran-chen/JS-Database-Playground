goog.provide('jdp.proc.Aggregation');


/** @interface */
jdp.proc.Aggregation = function () {
};

/**
 * @param {object} groupCode - An Expression refering the group.
 * @return A Statement
 */
jdp.proc.Aggregation.prototype.generateProcessingCode = function (groupCode) {
};

/**
 * @param {string} value - Identifier of the aggregation value object.
 * @return A Statement
 */
jdp.proc.Aggregation.prototype.generateGetResultCode = function (value) {
};