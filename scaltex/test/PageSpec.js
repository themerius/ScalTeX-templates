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
    page.fill("content", 75);
    expect(page.availableSpace("content")).toEqual(125);
    page.fill("content", 100);
    expect(page.availableSpace("content")).toEqual(25);
    page.fill("content", 26);  // may not added 
    expect(page.availableSpace("content")).toEqual(25);

    page.fill("footer", 25);
    expect(page.availableSpace("footer")).toEqual(25);
    page.fill("footer", 25);
    expect(page.availableSpace("footer")).toEqual(0);
    page.fill("footer", 1);  // may not added
    expect(page.availableSpace("footer")).toEqual(0);
  });

});
