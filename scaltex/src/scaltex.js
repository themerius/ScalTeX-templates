/**
 * Namespace
 */
var scaltex = {};

scaltex.__version__ = "0.1dev";

/**
 * class: PageMaker
 */
scaltex.Configuration = function (contentHeight) {
  this.contentHeight = contentHeight;

  var tmpElem = document.createElement("div");
  tmpElem.id = "tmpElem";
  tmpElem.style.width = "1in";
  tmpElem.innerHTML = "<p>&nbsp;</p>";
  document.body.appendChild(tmpElem);

  this.dpi = document.getElementById("tmpElem").offsetWidth / 1.0;

  document.body.removeChild(tmpElem);
}

scaltex.Configuration.prototype.pixelPerMillimeter = function () {
  return this.dpi / 25.4;
}

scaltex.Configuration.prototype.maxHeightPerPage = function() {
  return this.contentHeight * this.pixelPerMillimeter();
}

/**
 * class: Object
 */
scaltex.Object = function (templateId) {
  this.template = document.getElementById(templateId).text;
}

scaltex.Object.prototype.render = function (json) {
  if (json.objId == undefined || null)
    throw new Error("objId property is needed");
  var ret = Mustache.render(this.template, json);
  ret.height = scaltex.Object.prototype.height;
  return ret
}

scaltex.Object.prototype.height = function (objId) {
  return document.getElementById("obj_" + objId).offsetHeight;
}

/**
 * class: ContinousPages
 */
scaltex.ContinuousPages = function (pageObject, objects, elementId) {
  this.pageObject = pageObject;
  this.objects = objects;
}

scaltex.ContinuousPages.prototype.generate = function () {
  return 0;
}
