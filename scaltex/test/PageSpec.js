describe("Page", function() {
  var page, config, tmpl, anotherElement;

  beforeEach(function() {  // init Classes
    tmpl = document.createElement("script");
    tmpl.id = "pageTemplate";
    tmpl.innerHTML = "<div class=\"pageX\">" +
      "<div id=\"{{{appendPoint_0}}}\" class=\"mainContent\"></div>" +
      "<div id=\"{{{appendPoint_1}}}\" class=\"footer\"></div>" +
      "</div>";
    document.body.appendChild(tmpl);

    anotherElement = document.createElement("div");
    anotherElement.id = "anotherElement";
    document.body.appendChild(anotherElement);

    config = {
      pageId: "Areal_0_Page_0",
      template: "pageTemplate",
      appendPoints: [
        {type: "content", templateVariable: "appendPoint_0", maxHeight: 200},
        {type: "footer", templateVariable: "appendPoint_1", maxHeight: 50}
      ]
    };

    page = new scaltex.Page(config);
  });

  afterEach(function() {
    document.body.removeChild(tmpl);
    document.body.removeChild(anotherElement);
  });

  it("should know the type and id for every configured append point", function() {
    expect(page.appendPoints.content).toEqual("content_Areal_0_Page_0");
    expect(page.appendPoints.footer).toEqual("footer_Areal_0_Page_0");
  });

  it("should know it's maximum height for every append point", function() {
    expect(page.maxHeightFor.content).toEqual(200);
    expect(page.maxHeightFor.footer).toEqual(50);
  });

  it("should create a new element out of a " +
     "page template and configured append points", function() {
    expect(page.element.id).toEqual("Areal_0_Page_0");
    expect(page.element.innerHTML).toEqual("<div class=\"pageX\">" +
      "<div id=\"content_Areal_0_Page_0\" class=\"mainContent\"></div>" +
      "<div id=\"footer_Areal_0_Page_0\" class=\"footer\"></div>" +
      "</div>");
  });

  it("should be append-able to another element with an id", function() {
    page.appendTo("anotherElement");
    expect(document.getElementById("anotherElement").innerHTML)
      .toEqual("<div id=\"Areal_0_Page_0\">" +
        "<div class=\"pageX\">" +
        "<div id=\"content_Areal_0_Page_0\" class=\"mainContent\"></div>" +
        "<div id=\"footer_Areal_0_Page_0\" class=\"footer\"></div>" +
        "</div></div>");
  });

  it("should know the available space on the page resp. it's append points", function() {
    expect(page.fill("content", 75)).toBe(true);
    expect(page.availableSpace.content).toEqual(125);
    expect(page.fill("content", 100)).toBe(true);
    expect(page.availableSpace.content).toEqual(25);
    expect(page.fill("content", 26)).toBe(false);  // may not added 
    expect(page.availableSpace.content).toEqual(25);

    expect(page.fill("footer", 25)).toBe(true);
    expect(page.availableSpace.footer).toEqual(25);
    expect(page.fill("footer", 25)).toBe(true);
    expect(page.availableSpace.footer).toEqual(0);
    expect(page.fill("footer", 1)).toBe(false);  // may not added
    expect(page.availableSpace.footer).toEqual(0);
  });

  describe("PageFactory", function() {
    var pf, stdPage, sPage;

    beforeEach(function() {  // init Classes
      stdPage = {
        template: "pageTemplate",
        appendPoints: [
          {type: "content", templateVariable: "appendPoint_0", maxHeight: 200},
          {type: "footer", templateVariable: "appendPoint_1", maxHeight: 50}
        ]
      };
      sPage = {
        template: "specialPage",
        appendPoints: [
          {type: "content", templateVariable: "appendPoint_0", maxHeight: 200},
        ]
      };

      pf = new scaltex.PageFactory({
        standardpage: stdPage,
        specialpage: sPage,
        });
    });

    it("should save the (maybe incomplete) page configurations " +
       "with a related name", function() {
      expect(pf.pageConfig.standardpage).toEqual(stdPage);
      expect(pf.pageConfig.specialpage).toEqual(sPage);
    });

    it("should combine the page configs with other page config fragments " +
       "to a complete page config", function() {
      var res = pf.modifyJSON("standardpage", {pageId: "Areal_0_Page_0"});
      expect(res).toEqual(
        {
          pageId: "Areal_0_Page_0",
          template: "normalPage",
          appendPoints: [
            {type: "content", templateVariable: "appendPoint_0", maxHeight: 200},
            {type: "footer", templateVariable: "appendPoint_1", maxHeight: 50}
          ]
        });
      expect(pf.pageConfig.standardpage).toEqual(stdPage);
    });

    it("should produce Page instances out of a certain page config and " +
       "other page config fragments", function() {
      expect(
        pf.newPage("standardpage", {pageId: "Areal_0_Page_0"}) === page
      ).toBe(true);
    });

  });

});