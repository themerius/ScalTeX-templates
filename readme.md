# scaltex.js

Is a little framework to realize semi-automatic HTML/CSS document-generation with JSON-input. It gives you an abstraction over pages -- pages are not native provided by HTML/CSS.

Short: With this framework you can build your own document template and feed it with JSON-contents.

## Structure

There are three basis types:

 * Areal (or Zone)
 
   An areal within a document containing some content, for example most academic documents have areals
   like title and other meta information, foreword, table of contents, main document text, appendix,
   literature references, index. 
 
 * Page
 
   Every areal is populated with a least one page, and there can be several
   page types (layouts) within a document, for example normal A4 pages
   or landscape pages for big tables or a special titlepage.

 * Entity
 
   This are the basic document elements, which are hooked into the pages, like
   headings, text blocks, figures and so on.

The framework enables you to bring areal, page and entities together and renders semi-automatic a document out of some JSON-data. It especially delivers you an abstraction over pages, which is no usual HTML/CSS task.

`mustache.js` (template-engine) is the only dependency. So include it before `scaltex.js`:

    <script src="https://raw.github.com/janl/mustache.js/master/mustache.js"></script>
    <script src="scaltex/src/scaltex.js"></script>

There is also a `TestSuite.html`, with specifications.

### Templates

Templates are `mustache.js` snippets, which are representing *pages* or *entities*.

Pages have only append points, where entities can be hooked in. The entities know which append point they need; but this can be configured. Example page template:

	<script id="page" type="text/template">
	<div class="pageA4">
	  <div id="{{{appendPoint_content}}}" class="layoutGrid"></div>
	  <div id="{{{appendPoint_footer}}}"></div>
	</div>
	</script>

Entities are very individual and can maybe represent anything, but they may be fitted to the layout of the document resp. the page. Example:

	<script id="heading" type="text/template">
	<div class="row">
	  <div class="col4"><{{h}}>{{number}}</br>{{heading}}</{{h}}></br></br></div>
	  <div class="row-end">&nbsp;</div>
	</div>
	</script>

This entity can make use of a JSON like this:

	{
	  heading: "First Heading",
	  number: 1,
	  h: "h1",
	  id: 0
	};


### Processing Steps

#### Creating Pages

First we need to configure our pages. We have a page template like:

	<script id="page" type="text/template">
	<div class="pageA4">
	  <div id="{{{appendPoint_content}}}" class="layoutGrid"></div>
	  <div id="{{{appendPoint_footer}}}"></div>
	</div>
	</script>

Out of this we can configure a page and especially it's append points:

	var page = {
	  template: "page",  // id of the template
	  appendPoints: [
	    {type: "content", templateVariable: "appendPoint_content", maxHeight: 912},
	    {type: "footer", templateVariable: "appendPoint_footer", maxHeight: 48}
	  ]
	}

The entities know their append point `type`, default is *content*. Every append point has a maximal available space (`maxHeight`) and this space is consumed by the entities hooked into the page. The `templateVariable` is needed internal to give an individual append point id to every page.

Accepted `maxHeight`s are pixels and millimeters, for example:

    {… , maxHeight: 912}
    {… , maxHeight: "912px"}
    {… , maxHeight: "241.3mm"}

Give your pages with the page name to the `PageFactory`. This factory produces a new unique instance of the requested page:

	var pageFactory = new scaltex.PageFactory({
	  page: page,
	  other_name: other_configured_page
	});

#### Creating Areals

Every document areal is related to an element within the html-DOM. There is later the view-port showed.

	<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="utf-8" />
	<title>ScalTeX</title>
	 …
	</head>
	<body>
	
	<div id="DocumentAreal"></div>
	
	</body>
	</html>

Configure an areal with the element id `name`, a `sequence` of JSON with the proper contents for the entites and a `pageFactory`-instance, optional you can pass preconfigured `specialEntities` e.g. a footer with a page count variable.

	var documentAreal = new scaltex.Areal("DocumentAreal", seq, pageFactory);

The areal produces out of the JSON-sequence the entities, renders them, measures them and hooks them into a page if it's enough space on the actual working page, otherwise a new page will be created.

#### JSON Sequence

Within the JSON-sequence you define on which page type which entities with which contents are.

	var section_1 = {
	  heading: "First Heading",
	  number: 1,
	  h: "h1",
	  id: 0
	};
	
	…

	var seq = [
	  {
	    pageType: "page",
	    entities: [
	      {templateId: "heading", json: section_1},
	      {templateId: "text_1110", json: par_1},
	      {templateId: "heading", json: subsection_1_1},
	      {templateId: "text_1110", json: par_2},
	      {templateId: "figure_1100", json: figData},
	      {templateId: "text_1110", json: par_3}
	    ]
	  },
	  {
	    pageType: "other_name",
	    entities: [
	      {templateId: "heading", json: section_2},
	      {templateId: "heading", json: subsection_2_1},
	      {templateId: "text_1110", json: par_4},
	      {templateId: "text_1110", json: par_5},
	      {templateId: "text_1110", json: par_6}
	    ]
	  }
	];

The sequence is a list of dictionaries. The dictionary has a `pageType`-key and a `entities`-key. The `entities`-key is a list of dictionaries, too, containing a `templateId` wich points on an existent entity template element id, and a `json`-key with information the entity should filled with.

#### Run

Now are all preparations met. Just let the areal generate entities and pages:

	// bring entity template and it's assigned content together:
	documentAreal.generateEntities();

	// render the entities to real DOM-elements:
	documentAreal.renderEntities();

	// the browser hooks the entity elements into a temporary area,
	// maybe resources like pictures must be processed by the browser (may take a while),
	// if done the real height of every entity can be measured:
	documentAreal.mountEntitiesToConstructionArea();

	window.onload = function () {
	  // if resourceloading is finished, new pages are generated
	  // and the enities can be moved to their destination pages:
	  documentAreal.moveEntitiesToNewPages();

	  // get rid of the temporary area:
	  documentAreal.destructConstructionAreas();
	};

This step must be done for every areal.

### Common Entity Types and Conventions

The templating is made very flexible, but usual documents share common entity types, like headings, text, figures and so on, therefore a uniform naming is very useful.

*Every entity needs a unique ID!*

| templateId  | included in example | parameters                   | notes                 |
|:----------- |:-------------------:|:---------------------------- |:--------------------- |
| heading     | yes                 | id, heading, number, h       | h: 1,2,3,4            |
| text        | yes                 | id, text                     |                       |
| figure      | yes                 | id, src, description, number |                       |
| table       | not yet             |                              |                       |
| math        | not yet             |                              |                       |
| chemistry   | not yet             |                              |                       |
| [abbr-]code | not yet             |                              | py-code, java-code, … |


It's recommendable to use a layout grid in your document template (even for every normal webpage!) and therefore it also may useful to have a uniform naming convention.

As example we assume a 4-column-layout-grid, which should suitable for the most documents. Then a `text` entity which bears 4 columns will be named `text_1111`, if it bears only the left 3 columns it will be namend `text_1110` and so on. Here are some combinations:

    4 Columns Layout Grid
    
    +---+---+---+---+
    | X |   |   |   |   --->  [templateId]_1000  (content only bears in the first column)
    +---+---+---+---+ 

    +---+---+---+---+
    |   | X | X |   |   --->  [templateId]_0110  (content bears the second and third column)
    +---+---+---+---+

    +---+---+---+---+
    | X | X | X |   |   --->  [templateId]_1110  (content bears from 1st to 3rd column)
    +---+---+---+---+
    
    …

This rule can be applied to all `templateId`s except `heading`.

### Common Page Types and Conventions

Of course it is possible to name the pages anything, but there are common used pages and it's recommandable to name them in a uniform fashion.

| page name   | included in example | append points                      | notes                 |
|:----------- |:-------------------:|:---------------------------------- |:--------------------- |
| A4          | yes                 | content, header, footer            | header not impl yet   |
| A4_landscape| not yet             | content, header, footer            |                       |
| A4_titlepage| yes                 | logo, longName, mainTitle, partner |                       |

## Basic Documents

Details about the different documents and their additional entity types.

### Academic Article (Fraunhofer Style)

4 Column Basis Container for Fraunhofer Bericht (academic article).

Columns are based on http://978.gs.

### Patent (EPO/USPTO)

### Academic Paper