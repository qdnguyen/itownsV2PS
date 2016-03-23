define(['./PageID'],function(PageID){
    var UsageTable = function (size) {
            this.width = size;
            this.height = size;
            this.size = 0;

            this.maxMipMapLevel = Math.floor(Math.log(size) / Math.log(2));

            this.table = {};
  };

  UsageTable.prototype = {
        constructor: UsageTable,

        set: function (pageX, pageY, mipMapLevel) {
          var size = 1 << (this.maxMipMapLevel - mipMapLevel);
          var coord = pageY * size + pageX;

          this.add(coord, mipMapLevel);
        },

        add: function (pageNumber, mipMapLevel) {
          var id = PageID.create(pageNumber, mipMapLevel);

          if (undefined !== this.table[id]) {
            ++this.table[id].hits;
            ++this.size;
          } else {
            this.table[id] = {
              hits: 1
            };
          }
        },

        clear: function () {
          this.table = {};
          this.size = 0;
        },

        get pageCount() {
          return this.width * this.height;
        },

        set pageCount(value) {
          throw new Error('Cannot set pageCount to ' + value + ' manually, it\'s computed from width * height.');
        },

        get entryCount() {
          return this.size;
        },

        set entryCount(value) {
          throw new Error('Cannot set entryCount to ' + value + ' manually.');
        },

        isUsed: function (id) {
          return this.table[id] !== undefined;
        }
  };
    return UsageTable;
    
});

