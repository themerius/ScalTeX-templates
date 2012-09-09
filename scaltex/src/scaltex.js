/**
 * Namespace
 */
var scaltex = {};
scaltex.Global = {};

scaltex.__version__ = "0.1dev";

/**
 * class: Configuration
 */
scaltex.Configuration = function (contentHeight) {
  this.contentHeight = contentHeight;
  this.templateObjects = {};
  this.pageObjects = {};

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
 * class: DocumentBuilder
 */
scaltex.DocumentBuilder = function (jsonGenerator, config, constructionAreaId, viewAreaId) {
  var list = [];
  for (var item in jsonGenerator) {
    if (jsonGenerator[item].type == "NewPage")
      list.push([ jsonGenerator[item].context, [] ]);
    else {
      var objsForPage = list.slice(-1)[0][1];
      var obj = jsonGenerator[item];
      objsForPage.push(
        config.templateObjects[obj.type].render(obj.context));
    }
  }
  this.objlist = list;
  this.config = config;
  this.constructionAreaId = constructionAreaId;
  this.viewAreaId = viewAreaId;
}

scaltex.DocumentBuilder.prototype.render = function (method) {
  for (var idx in this.objlist) {
    var pageGenerator = this.config.pageObjects[this.objlist[idx][0]];
    var objs = this.objlist[idx][1];

    var elem = document.createElement("div");
    elem.id = "PageClass_"+idx;
    document.getElementById(this.constructionAreaId).appendChild(elem);

    pageGenerator.render(objs, elem.id);
  }
}

scaltex.DocumentBuilder.prototype.splitIntoPages = function () {
  for (var idx in this.objlist) {
    var pageGenerator = this.config.pageObjects[this.objlist[idx][0]];
    var objs = this.objlist[idx][1];

    pageGenerator.splitIntoPages(objs, this.viewAreaId);
  }
  document.getElementById(this.constructionAreaId).innerHTML = "";
}

/**
 * class: Object
 */
scaltex.Object = function (templateId) {
  template = document.getElementById(templateId);
  this.template = (template == null) ? "" : template.text;
}

scaltex.Object.prototype.render = function (json) {
  if (json.objId == undefined || null)
    throw new Error("objId property is needed");

  var str = new String(Mustache.render(this.template, json));

  str.height = function () {
    return document.getElementById("obj_" + json.objId).offsetHeight;
  }

  str.id = function () {
    return "obj_"+json.objId;
  }

  return str;
}

/**
 * class: ContinuousPages
 * must be executed within window.onload.
 */
scaltex.Global.pageCount = 0;

scaltex.ContinuousPages = function (pageObject, templateEntryPoint, config, appendPoint) {
  this.pageTemplateObject = pageObject;
  this.templateEntryPoint = templateEntryPoint;
  this.config = config;
  this.appendPoint = appendPoint;
}

scaltex.ContinuousPages.prototype.newPage = function (viewAreaId) {
  var view = document.getElementById(viewAreaId);

  var json = {objId: -1};
  json[this.templateEntryPoint] = "";

  var page = this.pageTemplateObject.render(json);

  var el = document.createElement("div");
  el.id = "Page_Nr_" + scaltex.Global.pageCount;
  el.innerHTML = page;

  view.appendChild(el);

  scaltex.Global.pageCount++;

  var ret = el;
  for (var idx in this.appendPoint)
    ret = ret.getElementsByClassName(this.appendPoint[idx])[0];
  return ret;
}

scaltex.ContinuousPages.prototype.render = function (objects, constructionAreaId) {
  var json = {objId: -1};
  json[this.templateEntryPoint] = objects.join("");

  var page = this.pageTemplateObject.render(json);

  var view = document.getElementById(constructionAreaId);
  view.innerHTML = page;
}

scaltex.ContinuousPages.prototype.splitIntoPages = function (objects, viewAreaId) {
  var newpage = this.newPage(viewAreaId);
  var actualHeight = 0;
  for (var idx in objects) {
    var object = objects[idx];
    actualHeight += object.height();
    if (actualHeight <= this.config.maxHeightPerPage()) {
      newpage.appendChild(document.getElementById(object.id()));
    } else {
      newpage = this.newPage(viewAreaId);
      newpage.appendChild(document.getElementById(object.id()));
      actualHeight = object.height();
    }
  }
}
