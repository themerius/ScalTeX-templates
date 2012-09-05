describe("Object", function() {
  var o, tmpl;

  beforeEach(function() {
    tmpl = document.createElement("script");
    tmpl.id = "template";
    tmpl.innerHTML = "<div id=\"obj_{{objId}}\" style=\"height: 200px\">With {{variable}}</div>";
    document.body.appendChild(tmpl);

    o = new scaltex.Object("template");
  });

  afterEach(function() {
    document.body.removeChild(tmpl);
  });

  it("should grab the template as string", function() {
    expect(o.template)
      .toEqual("<div id=\"obj_{{objId}}\" style=\"height: 200px\">With {{variable}}</div>");
  });

  it("should render the template", function() {
    expect(o.render({objId: 0, variable: "myvar."}))
      .toEqual("<div id=\"obj_0\" style=\"height: 200px\">With myvar.</div>");
    expect( function(){ o.render({variable: "myvar."}) })
      .toThrow(new Error("objId property is needed"));
  });

  it("should know it's height in px after `render`", function() {
    var elem = document.createElement("div");
    elem.innerHTML = o.render({objId: 0, variable: "myvar."});
    document.body.appendChild(elem);

    expect(o.height(0)).toEqual(200);

    document.body.removeChild(elem);
  });

});
