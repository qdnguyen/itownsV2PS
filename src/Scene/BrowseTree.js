/**
 * Generated On: 2015-10-5
 * Class: BrowseTree
 * Description: BrowseTree parcourt un arbre de Node. Lors du parcours un ou plusieur NodeProcess peut etre appliqué sur certains Node.
 */

define('Scene/BrowseTree', ['Globe/EllipsoidTileMesh'], function( EllipsoidTileMesh) {

    function BrowseTree(engine) {
        //Constructor

        this.oneNode = 0;
        this.gfxEngine = engine;
        this.nodeProcess = undefined;
        this.tree = undefined;
        this.date = new Date();
        this.fogDistance = 1000000000.0;
        this.mfogDistance = 1000000000.0;
        this.visibleNodes = 0;
        this.selectNodeId = -1;
        this.selectNode = null;
        this.cachedRTC = null;

    }


    BrowseTree.prototype.addNodeProcess = function(nodeProcess) {
        this.nodeProcess = nodeProcess;
    };

    BrowseTree.prototype.NodeProcess = function() {
        return this.nodeProcess;
    };

    /**
     * @documentation: Process to apply to each node
     * @param {type} node   : node current to apply process
     * @param {type} camera : current camera needed to process
     * @param {type} optional  : optional process
     * @returns {Boolean}
     */
    BrowseTree.prototype.processNode = function(node, camera, optional) {
        if (node instanceof EllipsoidTileMesh) {

            node.setVisibility(false);
            node.setSelected(false);

            if (node.loaded && this.nodeProcess.frustumCullingOBB(node, camera)) {
                if (this.nodeProcess.horizonCulling(node, camera)) {

                    if (node.parent.material !== undefined && node.parent.material.visible === true)

                        return node.setVisibility(false);

                    var sse = this.nodeProcess.SSE(node, camera);

                    if (optional && (sse || node.level < 2) && node.material.visible === true && node.wait === false)

                        this.tree.subdivide(node);

                    else if (!sse && node.level >= 2 && node.material.visible === false && node.wait === false) {

                        node.setMaterialVisibility(true);
                        this.uniformsProcess(node, camera);
                        node.setChildrenVisibility(false);

                        return false;
                    }
                }
            }

            if (node.visible && node.material.visible)
                this.uniformsProcess(node, camera);

            return node.visible;
        }

        return true;
    };


    BrowseTree.prototype.uniformsProcess = function(node, camera) {
        node.setMatrixRTC(this.gfxEngine.getRTCMatrixFromCenter(node.absoluteCenter, camera));
        
        if (node.id === this.selectNodeId) {
            node.setSelected(node.visible && node.material.visible);
            if (this.selectNode !== node) {
                this.selectNode = node;
                console.log(node);
            }
        }

        node.setFog(this.fogDistance);
    };

    /**
     * @documentation: Initiate traverse tree 
     * @param {type} tree       : tree 
     * @param {type} camera     : current camera
     * @param {type} optional   : optional process
     * @returns {undefined}
     */
    BrowseTree.prototype.browse = function(tree, camera, optional) {

        this.tree = tree;
        
        // TODO move to camera class
        camera.camera3D.updateMatrix();
        camera.camera3D.updateMatrixWorld(true);
        camera.camera3D.matrixWorldInverse.getInverse(camera.camera3D.matrixWorld);
        var distance = camera.camera3D.position.length();
        // <---        
        this.fogDistance = this.mfogDistance * Math.pow((distance - 6300000) / 25000000, 1.6);

        this.nodeProcess.preHorizonCulling(camera);

        for (var i = 0; i < tree.children.length; i++)
            this._browse(tree.children[i], camera, optional);
    };

    /**
     * @documentation: Recursive traverse tree
     * @param {type} node       : current node     
     * @param {type} camera     : current camera
     * @param {type} optional   : optional process
     * @returns {undefined}
     */
    BrowseTree.prototype._browse = function(node, camera, optional) {
        
        if (this.processNode(node, camera, optional))
            for (var i = 0; i < node.children.length; i++)
                this._browse(node.children[i], camera, optional);
        else
            this._clean(node, node.level + 2, camera);

    };

    BrowseTree.prototype._clean = function(node, level, camera) {
        if (node.children.length === 0)
            return true;

        var childrenCleaned = 0;
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            // TODO node.wait === true ---> delete child and switch to node.wait = false
            if (this._clean(child, level, camera) && ((child.level >= level && child.children.length === 0 && !this.nodeProcess.SSE(child, camera) && !node.wait) || node.level === 2))
                childrenCleaned++;
        }

        if (childrenCleaned === node.children.length) {
            node.disposeChildren();
            return true;
        } else
            return false;

    };

    BrowseTree.prototype.updateLayer = function(layer,camera) {

        var root = layer.children[0];
        for (var c = 0; c < root.children.length; c++) {
            var node = root.children[c];

            this.cachedRTC = this.gfxEngine.getRTCMatrixFromNode(node, camera);                        

            var cRTC = function(obj) {
                if (obj.material && obj.material.setMatrixRTC)
                    obj.material.setMatrixRTC(this.cachedRTC);

            }.bind(this);

            node.traverse(cRTC);
        }
    };

    return BrowseTree;
});
