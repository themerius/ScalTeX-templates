describe("PageMaker", function() {
  var pm;

  beforeEach(function() {
    pm = new scaltex.PageMaker("test");
  });

  it("should have set the test-attribute", function() {
    expect(pm.test).toEqual("test");
  });

  it("concatenates the strings", function() {
    expect(pm.func("it")).toEqual("testit");
  });

});
