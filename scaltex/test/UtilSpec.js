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

  it("should be able to transform mm to px", function (){
    expect(util.transformToPx("100mm")).toBeCloseTo(378);
    expect(util.transformToPx("26.5mm")).toBeCloseTo(100);
    expect(util.transformToPx("100px")).toEqual(100);
    expect(util.transformToPx("100")).toEqual("100");
    expect(util.transformToPx(100)).toEqual(100);
    expect(util.transformToPx(null)).toEqual(null);
    expect(util.transformToPx("10u")).toEqual("10u");
  });

});
