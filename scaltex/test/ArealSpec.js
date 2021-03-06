describe("Areal", function() {
  var areal, page, pageFactory, w, x, y, z, footer, seq, arealElement, specialEntities;

  beforeEach(function() {  // init Classes
    page = document.createElement("script");
    page.id = "pageTypeX";
    page.innerHTML = "<div class=\"pageTypeX\">" +
      "<div id=\"{{{appendPoint_0}}}\" class=\"mainContent\"></div>" +
      "<div id=\"{{{appendPoint_1}}}\" class=\"footer\"></div>" +
      "</div>";
    document.body.appendChild(page);

    pageFactory = new scaltex.PageFactory({
      pageTypeX: {
        template: "pageTypeX",
        appendPoints: [
          {type: "content", templateVariable: "appendPoint_0", maxHeight: 200},
          {type: "footer", templateVariable: "appendPoint_1", maxHeight: 50}
        ]
      },
      pageTypeY: {
        template: "pageTypeX",
        appendPoints: [
          {type: "content", templateVariable: "appendPoint_0", maxHeight: 200}
        ]
      }
    });

    w = document.createElement("script");
    w.id = "entityTypeW";
    w.innerHTML = "<div style=\"height: 200px\">{{w}}</div>";
    document.body.appendChild(w);

    x = document.createElement("script");
    x.id = "entityTypeX";
    x.innerHTML = "<div style=\"height: 50px\">{{x}}</div>";
    document.body.appendChild(x);

    y = document.createElement("script");
    y.id = "entityTypeY";
    y.innerHTML = "<div>{{y}}</div>";
    document.body.appendChild(y);

    z = document.createElement("script");
    z.id = "entityTypeZ";
    z.innerHTML = "<div>{{z}}</div>";
    document.body.appendChild(z);

    footer = document.createElement("script");
    footer.id = "footerType";
    footer.innerHTML = "<div>{{text}} {{pageNr}}</div>";
    document.body.appendChild(footer);

    seq = [
      {
        pageType: "pageTypeX",
        entities: [
          {templateId: "entityTypeW", json: {id: 0, w: "W"}},
          {templateId: "entityTypeX", json: {id: 1, x: "X"}}
        ]
      },
      {
        pageType: "pageTypeY",
        entities: [
          {templateId: "entityTypeY", json: {id: 2, y: "Y"}},
          {templateId: "entityTypeZ", json: {id: 3, z: "Z"}}
        ]
      }
    ];

    arealElement = document.createElement("div");
    arealElement.id = "Areal_0";
    document.body.appendChild(arealElement);

    specialEntities = [
      {
        templateId: "footerType",
        json: {text: "Static Name", pageNr: "@nextPageNr"},
        requiredPageAppendPoint: "footer"
      }
    ];

    areal = new scaltex.Areal("Areal_0", seq, pageFactory, specialEntities);
  });

  afterEach(function() {
    document.body.removeChild(page);
    document.body.removeChild(w);
    document.body.removeChild(x);
    document.body.removeChild(y);
    document.body.removeChild(z);
    document.body.removeChild(footer);
    document.body.removeChild(arealElement);
  });

  it("should be able prepare a construction area for every page type", function() {
    expect(document.getElementById("Areal_0_pageTypeX_constructionArea")
      .innerHTML).toEqual(
        "<div class=\"pageTypeX\">" +
          "<div id=\"content_Areal_0_pageTypeX_constructionArea\" " +
               "class=\"mainContent\"></div>" +
          "<div id=\"footer_Areal_0_pageTypeX_constructionArea\" " +
               "class=\"footer\"></div>" +
        "</div>");
    expect(document.getElementById("Areal_0_pageTypeY_constructionArea")
      .innerHTML).toEqual(
        "<div class=\"pageTypeX\">" +
          "<div id=\"content_Areal_0_pageTypeY_constructionArea\" " +
               "class=\"mainContent\"></div>" +
          "<div id=\"\" class=\"footer\"></div>" +
        "</div>");
    expect(areal.constructionAreas.pageTypeX.appendPoints)
      .toEqual({ content : 'content_Areal_0_pageTypeX_constructionArea',
                 footer : 'footer_Areal_0_pageTypeX_constructionArea' });
    expect(areal.constructionAreas.pageTypeY.appendPoints)
      .toEqual({ content : 'content_Areal_0_pageTypeY_constructionArea' });
  });

  it("should generate entities out of a json-sequence and keep them", function() {
    areal.generateEntities();

    expect(areal.entities[0].pageType).toEqual("pageTypeX");
    expect(areal.entities[0].entity.type).toEqual("entityTypeW");
    expect(areal.entities[0].entity.json).toEqual({id: 0, w: "W"});
    expect(areal.entities[0].pagebreak).toEqual(true);

    expect(areal.entities[1].pageType).toEqual("pageTypeX");
    expect(areal.entities[1].entity.type).toEqual("entityTypeX");
    expect(areal.entities[1].entity.json).toEqual({id: 1, x: "X"});
    expect(areal.entities[1].pagebreak).toEqual(false);

    expect(areal.entities[2].pageType).toEqual("pageTypeY");
    expect(areal.entities[2].entity.type).toEqual("entityTypeY");
    expect(areal.entities[2].entity.json).toEqual({id: 2, y: "Y"});
    expect(areal.entities[2].pagebreak).toEqual(true);

    expect(areal.entities[3].pageType).toEqual("pageTypeY");
    expect(areal.entities[3].entity.type).toEqual("entityTypeZ");
    expect(areal.entities[3].entity.json).toEqual({id: 3, z: "Z"});
    expect(areal.entities[3].pagebreak).toEqual(false);
  });

  it("should generate the special entities, which are individual for every page", function() {
    var special = areal.generateSpecialEntities();

    expect(special[0].type).toEqual("footerType");
    expect(special[0].json).toEqual({id: "Special_Areal_0_1", text: "Static Name", pageNr: 1});
    special[0].render();
    expect(special[0].element.id).toEqual("Entity_Special_Areal_0_1");
  });

  it("should mount the entities into the targeted construction area", function() {
    areal.generateEntities();
    areal.renderEntities();
    areal.mountEntitiesToConstructionArea();

    expect(document.getElementById("content_Areal_0_pageTypeX_constructionArea")
      .innerHTML).toEqual(
        "<div id=\"Entity_0\"><div style=\"height: 200px\">W</div></div>" +
        "<div id=\"Entity_1\"><div style=\"height: 50px\">X</div></div>");

    expect(document.getElementById("content_Areal_0_pageTypeY_constructionArea")
      .innerHTML).toEqual(
        "<div id=\"Entity_2\"><div>Y</div></div>" +
        "<div id=\"Entity_3\"><div>Z</div></div>");
  });

  it("should create new pages for viewing, with footer, and move the entities to fill the pages", function() {
    areal.generateEntities();
    areal.renderEntities();
    areal.mountEntitiesToConstructionArea();
    areal.moveEntitiesToNewPages();

    expect(document.getElementById("Areal_0_Page_1")
      .innerHTML).toEqual(
        "<div class=\"pageTypeX\">" +
          "<div id=\"content_Areal_0_Page_1\" class=\"mainContent\">" +
            "<div id=\"Entity_0\"><div style=\"height: 200px\">W</div></div>" +
          "</div>" +
          "<div id=\"footer_Areal_0_Page_1\" class=\"footer\">" +
            "<div id=\"Entity_Special_Areal_0_1\">" +
              "<div>Static Name 1</div>" +
            "</div>" +
          "</div>" +
        "</div>");

    expect(document.getElementById("Areal_0_Page_2")
      .innerHTML).toEqual(
        "<div class=\"pageTypeX\">" +
          "<div id=\"content_Areal_0_Page_2\" class=\"mainContent\">" +
            "<div id=\"Entity_1\"><div style=\"height: 50px\">X</div></div>" +
          "</div>" +
          "<div id=\"footer_Areal_0_Page_2\" class=\"footer\">" +
            "<div id=\"Entity_Special_Areal_0_2\">" +
              "<div>Static Name 2</div>" +
            "</div>" +
          "</div>" +
        "</div>");

    expect(document.getElementById("Areal_0_Page_3")
      .innerHTML).toEqual(
        "<div class=\"pageTypeX\">" +
          "<div id=\"content_Areal_0_Page_3\" class=\"mainContent\">" +
            "<div id=\"Entity_2\"><div>Y</div></div>" +
            "<div id=\"Entity_3\"><div>Z</div></div>" +
          "</div>" +
          "<div id=\"\" class=\"footer\"></div>" +
        "</div>");
  });

  it("should keep track of the page numbers of the viewed pages", function() {
    areal.generateEntities();
    areal.renderEntities();
    areal.mountEntitiesToConstructionArea();

    expect(areal.nextPageNr()).toEqual(1);

    areal.moveEntitiesToNewPages();

    expect(areal.nextPageNr()).toEqual(4);
  });

  it("should be able to switch page numbering style between arabic and roman", function() {
    areal.pagenumberstyle = "roman"
    areal.generateEntities();
    areal.renderEntities();
    areal.mountEntitiesToConstructionArea();

    expect(areal.nextPageNr()).toEqual("i");

    areal.moveEntitiesToNewPages();

    expect(areal.nextPageNr()).toEqual("iv");
  });

  it("should be able to destruct the construction areas", function() {
    areal.destructConstructionAreas();
    expect(document.getElementById("Areal_0_pageTypeX_constructionArea"))
      .toEqual(null);
    expect(document.getElementById("Areal_0_pageTypeY_constructionArea"))
      .toEqual(null);
  });

});
