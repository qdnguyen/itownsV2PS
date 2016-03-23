define(function(){
    var NodeTree = function (id, value, level) {
            this.children = [null, null, null, null];
            this.id = id;
            this.level = level;
            this.needsUpdate = false;
            this.value = value;
            this.visited = false;
    };

   NodeTree.prototype = {
            update: function (value) {
              this.value = parseInt(value, 10);
            },

            setChildren: function (children0, children1, children2, children3) {
              this.children[0] = children0;
              this.children[1] = children1;
              this.children[2] = children2;
              this.children[3] = children3;
            },

            canMergeWith: function (node) {
              return node.value === this.value;
            },

            canMergeChildren: function () {

              var child0 = this.children[0];
              var child1 = this.children[1];
              var child2 = this.children[2];
              var child3 = this.children[3];

              var result = false;
              var ab = child0.canMergeWith(child1);
              var cd = child2.canMergeWith(child3);
              if (ab && cd) {
                var abcd = child0.canMergeWith(child2);
                if (abcd) {
                  result = true;
                }
              }

              this.needsUpdate = result;
            }
    };
    return NodeTree;
});

