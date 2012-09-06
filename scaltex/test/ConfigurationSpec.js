describe("Configuration", function() {
  var cfg, elem;

  beforeEach(function() {
    cfg = new scaltex.Configuration(241.3);
  });

  it("should calculate dpi of the current system", function() {
    expect(cfg.dpi).toEqual(96);
  });

  it("should calculate pixels per millimeter", function() {
    expect(cfg.pixelPerMillimeter()).toEqual(3.7795275590551185);
  });

  it("should convert the maximum height of the actual content, from mm to px",
    function() {
    expect(cfg.maxHeightPerPage()).toEqual(912.0000000000001);
  });

  it("should memorize the configured template objects", function() {
    cfg.addTemplateObject("heading", "");
    expect(cfg.templateObjects.heading).toEqual(jasmine.any(scaltex.Object));
    cfg.addTemplateObject("figure", "");
    expect(cfg.templateObjects.heading).toEqual(jasmine.any(scaltex.Object));
    expect(cfg.templateObjects.figure).toEqual(jasmine.any(scaltex.Object));
  });

});
