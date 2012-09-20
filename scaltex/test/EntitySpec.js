describe("Entity", function() {
  var ety_empty, ety_withTemplate, ety0, ety1,
      tmpl, anotherElement, json0, json1;

  beforeEach(function() {  // init Classes
    tmpl = document.createElement("script");
    tmpl.id = "template";
    tmpl.innerHTML = "<div style=\"height: 200px\">With {{{variable}}}</div>";
    document.body.appendChild(tmpl);

    anotherElement = document.createElement("div");
    anotherElement.id = "anotherElement";
    document.body.appendChild(anotherElement);

    json0 = {id: 0, variable: "foo"};
    json1 = {id: 1, variable: "foo<em>bar</bar>"};

    ety_empty = new scaltex.Entity();
    ety_withTemplate = new scaltex.Entity("template");
    ety0 = new scaltex.Entity("template", json0);
    ety1 = new scaltex.Entity("template", json1);
  });

  afterEach(function() {
    document.body.removeChild(tmpl);
    document.body.removeChild(anotherElement);
  });

  it("should create an element out of template and json", function() {
    ety0.render();
    expect(ety0.element.innerHTML)
      .toEqual("<div style=\"height: 200px\">With foo</div>");
    expect(ety0.element.id).toEqual("Entity_0");

    ety1.render();
    expect(ety1.element.innerHTML)
      .toEqual("<div style=\"height: 200px\">With foo<em>bar</em></div>");
    expect(ety1.element.id).toEqual("Entity_1");
  });

  it("should be able to append the created element to " +
     "another element with an id", function() {
    ety0.render();
    ety0.appendTo("anotherElement");
    expect(document.getElementById("anotherElement").innerHTML)
      .toEqual(
        "<div id=\"Entity_0\">" +
        "<div style=\"height: 200px\">With foo</div></div>");

    ety1.render();
    ety1.appendTo("anotherElement");
    expect(document.getElementById("anotherElement").innerHTML)
      .toEqual(
        "<div id=\"Entity_0\">" +
        "<div style=\"height: 200px\">With foo</div></div>" +
        "<div id=\"Entity_1\">" +
        "<div style=\"height: 200px\">With foo<em>bar</em></div></div>");
  });

  it("should know it's actual height", function() {
    ety0.render();
    ety0.appendTo("anotherElement");
    expect(ety0.height()).toEqual(200);

    ety1.render();
    ety1.appendTo("anotherElement");
    expect(ety1.height()).toEqual(200);
  });

  it("should be able to modify or extend the json", function() {
    expect(ety0.json).toEqual({id: 0, variable: "foo"});

    ety0.modifyJSON({variable: "foobar"});
    expect(ety0.json).toEqual({id: 0, variable: "foobar"});

    ety0.modifyJSON({newvar: "barfoo"});
    expect(ety0.json).toEqual({id: 0, variable: "foobar", newvar: "barfoo"});

    ety0.render();
    ety0.appendTo("anotherElement");
    expect(document.getElementById("anotherElement").innerHTML)
      .toEqual(
        "<div id=\"Entity_0\">" +
        "<div style=\"height: 200px\">With foobar</div></div>");
  });

});