describe("DocumentBuilder", function() {
  var db, json;

  beforeEach(function() {
    json = [
      {type: "NewPage", context: "ContinousPages"},
      {type: "heading", context: "heading_context"},
      {type: "text", context: "text_context"},
      {type: "NewPage", context: "StaticPage"},
      {type: "figure", context: "fig_context"}
    ];

    var r = function (x) { return x };
    var configMock = {templateObjects: {
      heading: {render: r}, text: {render: r}, figure: {render: r}}};

    db = new scaltex.DocumentBuilder(json, configMock);
  });

  it("should transform the generated json to renderable objects", function() {
    expect(db.objlist)
      .toEqual([
        ["ContinousPages", ["heading_context", "text_context"]],
        ["StaticPage", ["fig_context"]]
      ]);
  });

});
