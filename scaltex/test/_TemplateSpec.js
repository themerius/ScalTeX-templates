describe("TemplateSpec", function() {
  var x;

  beforeEach(function() {  // init Classes
    x = function () { return "some value" };
  });

  it("should do something", function() {
    expect(x()).toEqual("some value");
  });

});
