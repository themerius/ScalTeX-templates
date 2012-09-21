/**
 * Namespace
 */
var scaltex = {};

scaltex.__version__ = "0.2dev";

/**
 * class: Util (singleton)
 */
scaltex.Util = function () {
  if (scaltex.Util.INSTANCE)
    return scaltex.Util.INSTANCE;
  scaltex.Util.INSTANCE = this;

  var tmpElem = document.createElement("div");
  tmpElem.id = "tmpElem";
  tmpElem.style.width = "1in";
  tmpElem.innerHTML = "<p>&nbsp;</p>";
  document.body.appendChild(tmpElem);

  this.dpi = document.getElementById("tmpElem").offsetWidth / 1.0;

  document.body.removeChild(tmpElem);
}

scaltex.Util.prototype.pixelPerMillimeter = function () {
  return this.dpi / 25.4;
}

scaltex.Util.prototype.copyJSON = function (json) {
  return JSON.parse(JSON.stringify(json));
}

/**
 * class: Entity
 */
scaltex.Entity = function (templateId, json) {
  this.type = templateId;
  var template = document.getElementById(templateId);
  this.template = (template == null) ? "" : template.text;
  this.json = json;
  this.element = document.createElement("div");
}

scaltex.Entity.prototype.render = function () {
  this.element.id = "Entity_" + this.json.id;
  this.element.innerHTML = Mustache.render(this.template, this.json);
  return this;
}

scaltex.Entity.prototype.appendTo = function (elementId) {
  var otherElement = document.getElementById(elementId);
  otherElement.appendChild(this.element);
  return this;
}

scaltex.Entity.prototype.height = function () {
  return document.getElementById(this.element.id).offsetHeight;
}

scaltex.Entity.prototype.modifyJSON = function (jsonDiff) {
  for (var key in jsonDiff) {
    this.json[key] = jsonDiff[key];
  }
  return this;
}

/**
 * class: Page
 */
scaltex.Page = function (config) {
  this.appendPoints = this.extractAppendPoints(config);
  this.maxHeightFor = this.extractMaxHeights(config);
  this.availableSpace = this.extractMaxHeights(config);
  this.element = this.createElement(config);
}

scaltex.Page.prototype.extractAppendPoints = function (config) {
  var json = {};
  for (var idx in config.appendPoints) {
    var type = config.appendPoints[idx].type;
    json[type] = type + '_' + config.pageId;
  }
  return json;
}

scaltex.Page.prototype.extractMaxHeights = function (config) {
  var json = {};
  for (var idx in config.appendPoints) {
    var type = config.appendPoints[idx].type;
    var maxHeight = config.appendPoints[idx].maxHeight;
    json[type] = maxHeight;
  }
  return json;
}

scaltex.Page.prototype.createElement = function (config) {
  var pageId = config.pageId;
  var template = document.getElementById(config.template);
  template = (template == null) ? "" : template.text;

  var json = {};
  for (var idx in config.appendPoints) {
    var templateVariable = config.appendPoints[idx].templateVariable;
    var type = config.appendPoints[idx].type;
    json[templateVariable] = type + '_' + config.pageId;
  }

  var element = document.createElement("div");
  element.id = pageId;
  element.innerHTML = Mustache.render(template, json);

  return element;
}

scaltex.Page.prototype.appendTo = function (elementId) {
  var otherElement = document.getElementById(elementId);
  otherElement.appendChild(this.element);
  return this;
}

scaltex.Page.prototype.fill = function (appendPoint, addedHeight) {
  var availableSpace = this.availableSpace[appendPoint];

  if (availableSpace < addedHeight)
    return false;

  this.availableSpace[appendPoint] = availableSpace - addedHeight;
  return true;
}

/**
 * class: PageFactory
 */
scaltex.PageFactory = function (incompletePageConfig) {
  this.incompletePageConfig = incompletePageConfig;
  this.util = new scaltex.Util();
}

scaltex.PageFactory.prototype.modifyJSON = function (pageName, json) {
  var modifyedJSON = this.util.copyJSON(this.incompletePageConfig[pageName]);
  for (var key in json) {
      modifyedJSON[key] = json[key];
  }
  return modifyedJSON;
}

scaltex.PageFactory.prototype.newPage = function (pageName, json) {
  var config = this.modifyJSON(pageName, json);
  return new scaltex.Page(config);
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
  this.predefinedJson = null;
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

scaltex.Object.prototype.apply_ = function (ptr) {
  var copy = JSON.parse(JSON.stringify(this.predefinedJson));
  for (var idx in this.predefinedJson) {
    if (this.predefinedJson[idx].__proto__.hasOwnProperty("apply_"))
      copy[idx] = this.predefinedJson[idx].apply_(ptr);
    else if (typeof this.predefinedJson[idx] == "object")
      copy[idx] = this.apply_(ptr);
  }
  return copy;
}

scaltex.Object.prototype.render_recursive = function (json) {
  for (var idx in json) {
    if (typeof json[idx] == "object")
      json[idx] = this.predefinedJson[idx].render(json[idx]);
  }
  return this.render(json);
}

/**
 * class: ContinuousPages
 * must be executed within window.onload.
 */
scaltex.Global.pageCount = 0;

scaltex.ContinuousPages = function (pageObject, config, appendPoint) {
  this.pageTemplateObject = pageObject;
  this.config = config;
  this.appendPoint = appendPoint;
}

scaltex.ContinuousPages.prototype.newPage = function (viewAreaId) {
  var view = document.getElementById(viewAreaId);

  var json = this.pageTemplateObject.apply_({pagecontent: ""});
  var page = this.pageTemplateObject.render_recursive(json);

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
  var json = this.pageTemplateObject.apply_({pagecontent: objects.join("")});
  var page = this.pageTemplateObject.render_recursive(json);

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

/**
 * class: PageCount
 */
scaltex.PageCount = function (numberformat) {
  this.numberformat = numberformat;
}

scaltex.PageCount.prototype.apply_ = function (ptr) {
  return scaltex.Global.pageCount + 1;
}

/**
 * class: PageContent
 */
scaltex.PageContent = function () {}

scaltex.PageContent.prototype.apply_ = function (ptr) {
  return ptr.pagecontent;
}
