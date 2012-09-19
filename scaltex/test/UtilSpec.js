describe("Util", function() {
  var util;

  beforeEach(function() {  // init Classes
    util = new scaltex.Util();
  });

  it("should determine the dpi used by the browser", function() {
    expect(util.dpi).toEqual(96);
  });

  it("should calculate the browser specific `pixels per mm`", function() {
    expect(util.pixelPerMillimeter()).toBeCloseTo(3.7795);
  });

  it("should be a singleton", function() {
    expect(new scaltex.Util() === util).toBe(true);
  });

});
