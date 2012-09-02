/**
 * Namespace
 */
var scaltex = {};

scaltex.__version__ = "0.1dev";

/**
 * class: PageMaker
 */
scaltex.PageMaker = function (test) {
  this.test = test;
}

scaltex.PageMaker.prototype.func = function(par) {
  return this.test + par;
}
