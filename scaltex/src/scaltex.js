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
  this.requiredPageAppendPoint = "content";
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
 * class: Areal
 */
scaltex.Areal = function (name, seq, pageFactory) {
  this.name = name;
  this.element = document.getElementById(name);
  this.seq = seq;
  this.pageFactory = pageFactory;
  this.constructionAreas = this.createConstructionAreas();
  this.entities = [];
  this.viewedPages = [];
}

scaltex.Areal.prototype.createConstructionAreas = function () {
  var pages = {};
  for (var key in this.pageFactory.incompletePageConfig) {
    pages[key] = this.pageFactory.newPage(key, {pageId: this.name + "_" + key + "_constructionArea"});
    pages[key].appendTo(this.name);
  }
  return pages;
}

scaltex.Areal.prototype.generateEntities = function () {
  for (var idx in this.seq) {
    var pageType = this.seq[idx].pageType;
    var entities = this.seq[idx].entities;
    for (var jdx in entities) {
      var entityContext = entities[jdx];
      var entity = new scaltex.Entity(entityContext.templateId, entityContext.json);
      this.entities.push({pageType: pageType, entity: entity});
    }
  }
  return this;
}

scaltex.Areal.prototype.renderEntities = function () {
  for (var idx in this.entities)
    this.entities[idx].entity.render();
};

scaltex.Areal.prototype.mountEntitiesToConstructionArea = function () {
  for (var idx in this.entities) {
    var pageType = this.entities[idx].pageType;
    var entity = this.entities[idx].entity;
    var appendPoint = this.entities[idx].entity.requiredPageAppendPoint;
    appendPoint = this.constructionAreas[pageType].appendPoints[appendPoint];
    entity.appendTo(appendPoint);
  }
}

scaltex.Areal.prototype.nextPageNr = function () {
  return this.viewedPages.length + 1;
}

scaltex.Areal.prototype.moveEntitiesToNewPages = function () {
  var currentPageType = null;
  for (var idx in this.entities) {
    var entity = this.entities[idx].entity;
    var pageType = this.entities[idx].pageType;
    var appendPoint = this.entities[idx].entity.requiredPageAppendPoint;
    var actualPage = this.viewedPages.slice(-1)[0];

    var noPage = !currentPageType;
    var falsePage = currentPageType != pageType;
    var notEnoughSpace = (actualPage == undefined) ? true : actualPage.availableSpace[appendPoint] < entity.height();
    var newPageCondition = noPage || falsePage || notEnoughSpace;

    if (newPageCondition) {
      var config = {pageId: this.name + "_" + "Page_" + this.nextPageNr()};
      actualPage = this.pageFactory.newPage(pageType, config);
      actualPage.appendTo(this.name);
      this.viewedPages.push(actualPage);
      currentPageType = pageType;
    }

    actualPage.fill(appendPoint, entity.height());
    appendPoint = actualPage.appendPoints[appendPoint];
    entity.appendTo(appendPoint);
  }
  return this;
}

scaltex.Areal.prototype.destructConstructionAreas = function () {
  for (var key in this.constructionAreas) {
    var elem = this.constructionAreas[key].element;
    elem.parentNode.removeChild(elem);
  }
  return this;
}