var openprefs = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
  },

  onMenuItemCommand: function() {
    window.open("chrome://piswi/content/piswiprefs.xul", "", "chrome");
  }
};

window.addEventListener("load", function(e) { openprefs.onLoad(e); }, false); 