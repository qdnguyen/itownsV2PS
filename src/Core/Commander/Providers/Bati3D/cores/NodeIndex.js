define(['./Node'] , function(Node){
    
    

var NodeIndex = function() {
	this.items = [ ];
};

NodeIndex.prototype = {
	get length() {
		return this.items.length;
	},

	get sink() {
		return (this.items.length - 1);
	},

	import : function (nodesCount, view, offset, littleEndian) {
		this.items = new Array(nodesCount);
		var s = 0;
		for (var i=0; i<nodesCount; ++i) {
			var node = new Node();
			s += node.import(view, offset + s, littleEndian);
			node.index = i;
			this.items[i] = node;
		}
		for (var i=0; i<(nodesCount-1); ++i) {
			var currNode = this.items[i];
			var nextNode = this.items[i+1];
			currNode.lastPatch = nextNode.firstPatch;
			currNode.lastByte  = nextNode.offset - 1;
		}
		return s;
	}
};

return NodeIndex;

});
