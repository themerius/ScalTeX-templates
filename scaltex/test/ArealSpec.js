describe("Areal", function() {
  var areal, seq, w, x, y, z;

  beforeEach(function() {  // init Classes
    w = document.createElement("script");
    w.id = "entityTypeW";
    w.innerHTML = "<div>{{w}}</div>";
    document.body.appendChild(w);

    x = document.createElement("script");
    x.id = "entityTypeX";
    x.innerHTML = "<div>{{x}}</div>";
    document.body.appendChild(x);

    y = document.createElement("script");
    y.id = "entityTypeY";
    y.innerHTML = "<div>{{y}}</div>";
    document.body.appendChild(y);

    z = document.createElement("script");
    z.id = "entityTypeZ";
    z.innerHTML = "<div>{{z}}</div>";
    document.body.appendChild(z);

    seq = [
      {
        pageTypeX: [
          {entityTypeW: {id: 0, w: "W"}},
          {entityTypeX: {id: 1, x: "X"}}
        ]
      },
      {
        pageTypeY: [
          {entityTypeY: {id: 2, y: "Y"}},
          {entityTypeZ: {id: 3, z: "Z"}}
        ]
      }
    ];

    areal = new scaltex.Areal("Areal_0", seq);
  });

  afterEach(function() {
    document.body.removeChild(
      document.getElementById("Areal_0_pageTypeX_constructionArea"));
    document.body.removeChild(
      document.getElementById("Areal_0_pageTypeY_constructionArea"));
    document.body.removeChild(w);
    document.body.removeChild(x);
    document.body.removeChild(y);
    document.body.removeChild(z);
  });

  it("should be able prepare a construction area for every page type", function() {
    areal.createConstructionArea();
    expect(document.getElementById("Areal_0_pageTypeX_constructionArea")
      .innerHTML).toEqual("");
    expect(document.getElementById("Areal_0_pageTypeY_constructionArea")
      .innerHTML).toEqual("");
  });

  it("should generate entities out of a json-sequence and keep them", function() {
    areal.generateEntities();

    expect(areal.entities[0].pageType).toEqual("pageTypeX");
    expect(areal.entities[0].entity.type).toEqual("entityTypeW");
    expect(areal.entities[0].entity.json).toEqual({id: 0, w: "W"});

    expect(areal.entities[1].pageType).toEqual("pageTypeX");
    expect(areal.entities[1].entity.type).toEqual("entityTypeX");
    expect(areal.entities[1].entity.json).toEqual({id: 1, x: "X"});

    expect(areal.entities[2].pageType).toEqual("pageTypeY");
    expect(areal.entities[2].entity.type).toEqual("entityTypeY");
    expect(areal.entities[2].entity.json).toEqual({id: 2, y: "Y"});

    expect(areal.entities[3].pageType).toEqual("pageTypeY");
    expect(areal.entities[3].entity.type).toEqual("entityTypeZ");
    expect(areal.entities[3].entity.json).toEqual({id: 3, z: "Z"});
  });

  it("should mount the entities into the targeted construction area", function() {
    areal.generateEntities();
    areal.renderEntities();
    areal.mountEntitiesToConstructionArea();

    expect(document.getElementById("Areal_0_pageTypeX_constructionArea")
      .innerHTML).toEqual(
        "<div id=\"Entity_0\"><div>W</div></div>" +
        "<div id=\"Entity_1\"><div>X</div></div>");

    expect(document.getElementById("Areal_0_pageTypeY_constructionArea")
      .innerHTML).toEqual(
        "<div id=\"Entity_2\"><div>Y</div></div>" +
        "<div id=\"Entity_3\"><div>Z</div></div>");
  });

  it("should create new pages for viewing and move the entities to fill the pages", function() {
    areal.generateEntities();
    areal.renderEntities();
    areal.mountEntitiesToConstructionArea();
    areal.moveEntitiesToNewPages();

    expect(document.getElementById("Areal_0_Page_0")
      .innerHTML).toEqual(
        "<div id=\"Entity_0\"><div>W</div></div>" +
        "<div id=\"Entity_1\"><div>X</div></div>");

    expect(document.getElementById("Areal_0_Page_1")
      .innerHTML).toEqual(
        "<div id=\"Entity_2\"><div>Y</div></div>" +
        "<div id=\"Entity_3\"><div>Z</div></div>");
  });

  it("should keep track of the page numbers of the viewed pages", function() {
    expect(x()).toEqual("some value");
  });

});
