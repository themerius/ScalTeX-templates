/**
 * Namespace
 */
var scaltex = {};

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
scaltex.DocumentBuilder = function (jsonGenerator, config, hookinId) {
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
  this.hookinId = hookinId;
}

scaltex.DocumentBuilder.prototype.render = function (method) {
  for (var idx in this.objlist) {
    var pageGenerator = this.config.pageObjects[this.objlist[idx][0]];
    var objs = this.objlist[idx][1];

    var elem = document.createElement("div");
    elem.id = "PageClass_"+idx;
    document.getElementById(this.hookinId).appendChild(elem);

    pageGenerator.render(objs, elem.id);
  }
}

scaltex.DocumentBuilder.prototype.splitIntoPages = function () {
  for (var idx in this.objlist) {
    var pageGenerator = this.config.pageObjects[this.objlist[idx][0]];
    var objs = this.objlist[idx][1];

    pageGenerator.splitIntoPages(objs, "PageClass_"+idx);
  }

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

  return str;
}

/**
 * class: ContinuousPages
 * must be executed within window.onload.
 */
scaltex.ContinuousPages = function (pageObject, entryPoint, config) {
  this.pageTemplateObject = pageObject;
  this.templateEntryPoint = entryPoint;
  this.config = config;
}

scaltex.ContinuousPages.prototype.render = function (objects, elem) {
  var json = {objId: -1};
  json[this.templateEntryPoint] = objects.join("");

  var page = this.pageTemplateObject.render(json);

  var view = document.getElementById(elem);
  view.innerHTML = page;
}

scaltex.ContinuousPages.prototype.splitIntoPages = function (objects, elem) {
  var json = {objId: -1};
  json[this.templateEntryPoint] = objects.join("");

  var view = document.getElementById(elem);
  var heightlist = objects.map( function(x){return x.height()} );

  view.innerHTML = "";
  var cumm = 0;
  var objs = [];
  for (idx in objects) {
    cumm += heightlist[idx];
    if (cumm <= this.config.maxHeightPerPage()) {
      objs.push(objects[idx]);
    } else {
      json[this.templateEntryPoint] = objs.join("");
      view.innerHTML += this.pageTemplateObject.render(json);
      cumm = 0;
      objs = [];
      objs.push(objects[idx]);
    }
  };
  json[this.templateEntryPoint] = objs.join("");
  view.innerHTML += this.pageTemplateObject.render(json);
}
