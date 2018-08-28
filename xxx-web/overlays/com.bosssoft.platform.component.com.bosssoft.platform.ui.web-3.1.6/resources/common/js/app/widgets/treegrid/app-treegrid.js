/**
 *
 */
define(	["app/core/app-jquery", "app/core/app-core", "app/core/app-options",
        "jquery/jquery-ui", "app/widgets/app-widget",
        "app/widgets/treegrid/app-datagrid", "app/data/app-ajax"],
    function($, $A, Opts, resizable, Widget, DataGrid, AppAjax) {

        var treeUtils = {
            /**
             * Get the index of array item, return -1 when the item is not
             * found.
             */
            indexOfArray : function(a, o, id) {
                for (var i = 0, len = a.length; i < len; i++) {
                    if (id == undefined) {
                        if (a[i] == o) {
                            return i;
                        }
                    } else {
                        if (a[i][o] == id) {
                            return i;
                        }
                    }
                }
                return -1;
            },
            /**
             * Remove array item, 'o' parameter can be item object or id
             * field name. When 'o' parameter is the id field name, the 'id'
             * parameter is valid.
             */
            removeArrayItem : function(a, o, id) {
                if (typeof o == 'string') {
                    for (var i = 0, len = a.length; i < len; i++) {
                        if (a[i][o] == id) {
                            a.splice(i, 1);
                            return;
                        }
                    }
                } else {
                    var index = this.indexOfArray(a, o);
                    if (index != -1) {
                        a.splice(index, 1);
                    }
                }
            },
            /**
             * Add un-duplicate array item, 'o' parameter is the id field
             * name, if the 'r' object is exists, deny the action.
             */
            addArrayItem : function(a, o, r) {
                var index = this.indexOfArray(a, o, r ? r[o] : undefined);
                if (index == -1) {
                    a.push(r ? r : o);
                } else {
                    a[index] = r ? r : o;
                }
            },
            getArrayItem : function(a, o, id) {
                var index = this.indexOfArray(a, o, id);
                return index == -1 ? null : a[index];
            },
            forEach : function(data, deep, callback) {
                var nodes = [];
                for (var i = 0; i < data.length; i++) {
                    nodes.push(data[i]);
                }
                while (nodes.length) {
                    var node = nodes.shift();
                    if (callback(node) == false) {
                        return;
                    }
                    if (deep && node.children) {
                        for (var i = node.children.length - 1; i >= 0; i--) {
                            nodes.unshift(node.children[i]);
                        }
                    }
                }
            }
        }
        var TreeGrid = DataGrid.extend({
            grid : null,

            initialize : function(el, opt) {
                this.element = el;
                var defaultOpt;
                if (!opt) {
                    opt = {};
                }
                var _self = this;
                if (!opt.view) {
                    opt.view = new TreeGridView(this);
                }
                defaultOpt = $.data(el, "treegrid", {
                    options : $.extend({}, TreeGrid.defaults, TreeGrid
                        .parseOptions(el), {
                        finder : {
                            getTr : function(target, id, type, _111) {
                                type = type || "body";
                                _111 = _111 || 0;
                                var dc = $.data(target, "datagrid").dc;
                                if (_111 == 0) {
                                    var opts = $.data(target,
                                        "treegrid").options;
                                    var tr1 = opts.finder.getTr(
                                        target, id, type, 1);
                                    var tr2 = opts.finder.getTr(
                                        target, id, type, 2);
                                    return tr1.add(tr2);
                                } else {
                                    if (type == "body") {
                                        var tr = $("#"
                                            + $.data(target,
                                                "datagrid").rowIdPrefix
                                            + "-" + _111 + "-"
                                            + id);
                                        if (!tr.length) {
                                            tr = (_111 == 1
                                                ? dc.body1
                                                : dc.body2)
                                                .find("tr[node-id=\""
                                                    + id
                                                    + "\"]");
                                        }
                                        return tr;
                                    } else {
                                        if (type == "footer") {
                                            return (_111 == 1
                                                ? dc.footer1
                                                : dc.footer2)
                                                .find("tr[node-id=\""
                                                    + id
                                                    + "\"]");
                                        } else {
                                            if (type == "selected") {
                                                return (_111 == 1
                                                    ? dc.body1
                                                    : dc.body2)
                                                    .find("tr.datagrid-row-selected");
                                            } else {
                                                if (type == "highlight") {
                                                    return (_111 == 1
                                                        ? dc.body1
                                                        : dc.body2)
                                                        .find("tr.datagrid-row-over");
                                                } else {
                                                    if (type == "checked") {
                                                        return (_111 == 1
                                                            ? dc.body1
                                                            : dc.body2)
                                                            .find("tr.datagrid-row-checked");
                                                    } else {
                                                        if (type == "last") {
                                                            return (_111 == 1
                                                                ? dc.body1
                                                                : dc.body2)
                                                                .find("tr:last[node-id]");
                                                        } else {
                                                            if (type == "allbody") {
                                                                return (_111 == 1
                                                                    ? dc.body1
                                                                    : dc.body2)
                                                                    .find("tr[node-id]");
                                                            } else {
                                                                if (type == "allfooter") {
                                                                    return (_111 == 1
                                                                        ? dc.footer1
                                                                        : dc.footer2)
                                                                        .find("tr[node-id]");
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            getRow : function(p) {
                                var id = (typeof p == "object") ? p
                                    .attr("node-id") : p;
                                return _self.find(id);
                            },
                            getRows : function(_113) {
                                return _self.getChildren();
                                // $(_113).treegrid("getChildren");
                            }
                        }
                    }, opt),
                    checkedRows : [],
                    data : []
                });

                if($.isFunction(defaultOpt.options.beforeRender)){
                    defaultOpt.options.beforeRender.call(this,defaultOpt.options);
                }
                var _self = this;
                var opts = defaultOpt.options
                var gridOpts = $.extend({}, opts, {
                    url : null,
                    data : null,
                    element : el,
                    autoLoad : false,
                    loader : function() {
                        return false;
                    },
                    onResizeColumn : function(field, width) {
                        _self.fixRowHeight();
                        _self.trigger("onResizeColumn", field,
                            width);
                        // opts.onResizeColumn.call(_5, _6);
                    },
                    onSortColumn : function(_sortName, sortOrder) {
                        opts.sortName = _sortName;
                        opts.sortOrder = sortOrder;
                        if (opts.remoteSort) {
                            _1f(_2);
                        } else {
                            var _9 = _self.loadData("getData");
                            _self.loadData(_9);
                        }
                        // opts.onSortColumn.call(_7, _8);
                    }
                });
                this.grid = new DataGrid(el, gridOpts)


                $.data(el, "datagridObj",this.grid);
                DataGrid.superclass.initialize.call(this, opts);
                if (!opts.columns) {
                    var options = $.data(el, "datagrid").options;
                    opts.columns = options.columns;
                    opts.frozenColumns = options.frozenColumns;
                }
                defaultOpt.dc = $.data(el, "datagrid").dc;
                if (opts.data) {
                    this.loadData(opts.data);
                }
                this.nodeLoad();
                this.bindNodeEvent();
                this.addEvents("onLoadSuccess", "onLoadError",
                    "onBeforeLoad", "onClickRow", "onDblClickRow",
                    "onClickCell", "onDblClickCell", "onSortColumn",
                    "onResizeColumn", "onSelect", "onUnselect",
                    "onSelectAll", "onUnselectAll", "onCheck",
                    "onUncheck", "onCheckAll", "onUncheckAll",
                    "onBeforeEdit", "onAfterEdit", "onCancelEdit",
                    "onHeaderContextMenu", "onAfterRender",
                    "onRowContextMenu")
            },
            bind:function(target,eventObj){
                var evts=eventObj;
                if (arguments.length==1){
                    evts=target;
                }
                for(var eventName in evts){
                    this.on(eventName,evts[eventName]);

                }
                this.grid.bind(target);
            },
            unbind:function(target,events){
                var evts=events;
                if (arguments.length==1){
                    evts=target;
                }
                if (typeof evts=="string"){
                    this.off(evts);
                }
                if (typeof evts=="array"){
                    for(var i=0,len=events.length;i<len;i++){
                        this.off(evts[i]);
                    }
                }
                this.grid.unbind(target);
            },
            toTreeNodeData : function(record) {
                var node = {
                    // text : this.formatText(record),
                    children : [],
                    state : this.get("asyTree") ? "closed" : "open"
                };
                /*
                 * if(this.autoNodeId !== true) { Ext.apply(node, { id :
                 * record[this.keyField] }); }
                 */
                /*
                 * if (this.checked == true) { node["checked"] =
                 * record[this.checkField] ? record[this.checkField] : false }
                 */
                node = $.extend(node, record);
                return node;
            },
            listToTreeData : function(treeDataList) {
                var parentIdMap = {};
                var IdMap = {};
                var parentMapId;
                for (var i = 0; i < treeDataList.length; i++) {

                    parentMapId = treeDataList[i][this.get("parentField")]
                        || this.get("rootId");
                    treeDataList[i][this.get("parentField")] = parentMapId;
                    if (!parentIdMap[parentMapId.toString()]) {
                        parentIdMap[parentMapId.toString()] = {};
                    }
                    parentIdMap[parentMapId.toString()][treeDataList[i][this
                        .get("idField")]] = {
                        data : treeDataList[i],
                        children : {}
                    };
                    IdMap[treeDataList[i][this.get("idField")]] = {
                        data : treeDataList[i],
                        children : []
                    };
                };
                var rootId, rootList = [];
                for (var pId in parentIdMap) {
                    if (!IdMap[pId]) {
                        rootId = pId;
                        rootList.push(pId);
                        // break;
                    }
                };
                var _self = this;
                var createTree = function(rootData, parentIdMap) {
                    var nodedata;
                    var treedata = [];
                    for (var p in rootData) {
                        nodedata = _self
                            .toTreeNodeData(rootData[p]["data"]);
                        if (parentIdMap[p]) {
                            rootData[p]["children"] = parentIdMap[p];
                            nodedata.children = createTree(
                                rootData[p]["children"], parentIdMap);
                        } else {
                            rootData[p]["children"] = null;
                        };
                        if (nodedata.children.length == 0) {
                            delete nodedata.children;
                        } else {
                            nodedata.leaf = false;
                        };
                        treedata.push(nodedata);
                    };
                    return treedata;
                };
                var treeData = [];
                var temarr;
                // var treeData = createTree(rootData, parentIdMap);
                for (var i = 0; i < rootList.length; i++) {
                    var rootData = parentIdMap[rootList[i]];
                    temarr = createTree(rootData, parentIdMap);
                    treeData = treeData.concat(temarr);
                }
                return treeData;
            },
            bindNodeEvent : function() {
                var target = this.element;
                var dc = $.data(target, "datagrid").dc;
                var body2 = dc.body1.add(dc.body2);
                var _self = this;
                var _2f = ($.data(body2[0], "events") || $._data(body2[0],
                    "events")).click[0].handler;
                dc.body1.add(dc.body2).bind("mouseover", function(e) {
                    var tt = $(e.target);
                    var tr = tt.closest("tr.datagrid-row");
                    if (!tr.length) {
                        return;
                    }
                    if (tt.hasClass("tree-hit")) {
                        tt.hasClass("tree-expanded") ? tt
                            .addClass("tree-expanded-hover") : tt
                            .addClass("tree-collapsed-hover");
                    }
                }).bind("mouseout", function(e) {
                    var tt = $(e.target);
                    var tr = tt.closest("tr.datagrid-row");
                    if (!tr.length) {
                        return;
                    }
                    if (tt.hasClass("tree-hit")) {
                        tt.hasClass("tree-expanded") ? tt
                            .removeClass("tree-expanded-hover") : tt
                            .removeClass("tree-collapsed-hover");
                    }
                }).unbind("click").bind("click", function(e) {
                    var tt = $(e.target);
                    var tr = tt.closest("tr.datagrid-row");
                    if (!tr.length) {
                        return;
                    }
                    if (tt.hasClass("tree-hit")) {
                        _self.toggle(tr.attr("node-id"));
                    } else {
                        _2f(e);
                    }
                });
            },
            nodeLoad : function(nodeId, queryParams, parentId, callback) {
                var target = this.element;
                var opts = $.data(target, "treegrid").options;
                var gridBody = this.getPanel().find("div.datagrid-body");
                var _self = this;
                if (queryParams) {
                    opts.queryParams = queryParams;
                }
                var params = $.extend({}, opts.queryParams);
                if (opts.pagination) {
                    $.extend(params, {
                        page : opts.pageNumber,
                        rows : opts.pageSize
                    });
                }
                if (opts.sortName) {
                    $.extend(params, {
                        sort : opts.sortName,
                        order : opts.sortOrder
                    });
                }
                var row = this.find(nodeId);
                if (this.trigger("onBeforeLoad", row, params) == false) {
                    return;
                }
                var parentNode = gridBody.find("tr[node-id=\"" + nodeId
                    + "\"] span.tree-folder");
                parentNode.addClass("tree-loading");
                this.loading();
                var _4f = opts.loader.call(this, params, function(data) {
                    parentNode.removeClass("tree-loading");
                    _self.loaded();
                    _self.loadNodeData(nodeId, data, parentId);
                    if (callback) {
                        callback();
                    }
                }, function() {
                    parentNode.removeClass("tree-loading");
                    _self.loaded();
                    _self.trigger("onLoadError", arguments);
                    if (callback) {
                        callback();
                    }
                });
                if (_4f == false) {
                    parentNode.removeClass("tree-loading");
                    _self.loaded();
                }

            },
            options : function() {
                return $.data(this.element, "treegrid").options;
            },
            resize : function(_b5) {
                // this.resize(_b5)
                TreeGrid.superclass.resize.call(this, _b5)
            },
            fixRowHeight : function(rowIndex) {
                /*
                 * return jq.each(function() { _20(this, _b6); });
                 */
                var target = this.element;
                var opts = $.data(target, "datagrid").options;
                var dc = $.data(target, "datagrid").dc;
                if (!dc.body1.is(":empty")
                    && (!opts.nowrap || opts.autoRowHeight)) {
                    if (rowIndex != undefined) {
                        var children = this.getChildren(rowIndex);
                        for (var i = 0; i < children.length; i++) {
                            setRowHeight(children[i][opts.idField]);
                        }
                    }
                }
                TreeGrid.superclass.fixRowHeight.call(this, rowIndex)

                function setRowHeight(nodeId) {
                    var tr1 = opts.finder.getTr(target, nodeId, "body", 1);
                    var tr2 = opts.finder.getTr(target, nodeId, "body", 2);
                    tr1.css("height", "");
                    tr2.css("height", "");
                    var _28 = Math.max(tr1.height(), tr2.height());
                    tr1.css("height", _28);
                    tr2.css("height", _28);
                };
            },
            loadNodeData : function(nodeId, data, _3d) {
                var target = this.element;
                var _3e = $.data(target, "treegrid");
                var opts = _3e.options;
                var dc = _3e.dc;
                data = opts.loadFilter.call(target, data, nodeId);
                var node = this.find(nodeId);
                if (node) {
                    var _42 = opts.finder.getTr(target, nodeId, "body", 1);
                    var _43 = opts.finder.getTr(target, nodeId, "body", 2);
                    var cc1 = _42.next("tr.treegrid-tr-tree")
                        .children("td").children("div");
                    var cc2 = _43.next("tr.treegrid-tr-tree")
                        .children("td").children("div");
                    if (!_3d) {
                        node.children = [];
                    }
                } else {
                    var cc1 = dc.body1;
                    var cc2 = dc.body2;
                    if (!_3d) {
                        _3e.data = [];
                    }
                }
                if (!_3d) {
                    cc1.empty();
                    cc2.empty();
                }
                if (opts.view.onBeforeRender) {
                    opts.view.onBeforeRender.call(opts.view, nodeId, data);
                }
                opts.view.render.call(opts.view, cc1, true);
                opts.view.render.call(opts.view, cc2, false);
                if (opts.showFooter) {
                    opts.view.renderFooter
                        .call(opts.view, dc.footer1, true);
                    opts.view.renderFooter.call(opts.view, dc.footer2,
                        false);
                }
                if (opts.view.onAfterRender) {
                    opts.view.onAfterRender.call(opts.view, target);
                }
                if (!nodeId && opts.pagination) {
                    var _44 = $.data(target, "treegrid").total;
                    var _45 = this.grid.getPager();
                    if (_45.pagination("options").total != _44) {
                        _45.pagination({
                            total : _44
                        });
                    }
                }
                this.fixRowHeight();
                this.setRownumber();
                this.showLines();
                this.setSelectionState();
                this.autoSizeColumn();
                // $(target).treegrid("showLines");
                // $(target).treegrid("setSelectionState");
                // $(target).treegrid("autoSizeColumn");
                this.trigger("onLoadSuccess", node, data)
                // opts.onLoadSuccess.call(this, node, data);
            },
            setRownumber : function() {
                var dc = $.data(this.element, "datagrid").dc;
                var opts = $.data(this.element, "treegrid").options;
                if (!opts.rownumbers) {
                    return;
                }
                dc.body1.find("div.datagrid-cell-rownumber").each(
                    function(i) {
                        $(this).html(i + 1);
                    });
            },
            loadData : function(data) {
                /*
                 * return jq.each(function() { _39(this, _b7.parent, _b7);
                 * });
                 */
                this.loadNodeData(data.parent, data)
            },
            load : function(param) {
                // return jq.each(function() {
                this.options().pageNumber = 1;
                this.getPager().pagination({
                    pageNumber : 1
                });
                // $(this).treegrid("reload", param);
                this.reload(param)
                // });
            },
            reload : function(id) {
                var opts = this.options();
                var queryParams = {};
                if (typeof id == "object") {
                    queryParams = id;
                } else {
                    queryParams = $.extend({}, opts.queryParams);
                    queryParams.id = id;
                }
                if (queryParams.id) {
                    var _bb = $(this).treegrid("find", queryParams.id);
                    if (_bb.children) {
                        _bb.children.splice(0, _bb.children.length);
                    }
                    opts.queryParams = queryParams;
                    var tr = opts.finder.getTr(this, queryParams.id);
                    tr.next("tr.treegrid-tr-tree").remove();
                    tr
                        .find("span.tree-hit")
                        .removeClass("tree-expanded tree-expanded-hover")
                        .addClass("tree-collapsed");
                    this.expand(queryParams.id);
                } else {
                    this.nodeLoad(null, queryParams);
                }

            },
            reloadFooter : function(_bc) {
                return jq.each(function() {
                    var _bd = $.data(this, "treegrid").options;
                    var dc = $.data(this, "datagrid").dc;
                    if (_bc) {
                        $.data(this, "treegrid").footer = _bc;
                    }
                    if (_bd.showFooter) {
                        _bd.view.renderFooter.call(_bd.view, this,
                            dc.footer1, true);
                        _bd.view.renderFooter.call(_bd.view, this,
                            dc.footer2, false);
                        if (_bd.view.onAfterRender) {
                            _bd.view.onAfterRender.call(_bd.view,
                                this);
                        }
                        $(this).treegrid("fixRowHeight");
                    }
                });
            },
            getData : function() {
                return $.data(this.element, "treegrid").data;
            },
            getFooterRows : function() {
                return $.data(this.element, "treegrid").footer;
            },
            getRoot : function() {
                var roots = this.getRoots();
                if (roots.length) {
                    return roots[0];
                } else {
                    return null;
                }
            },
            getRoots : function() {
                return $.data(this.element, "treegrid").data;;
            },
            getParent : function(id) {
                var row = this.find(id);
                if (row._parentId) {
                    return this.find(row._parentId);
                } else {
                    return null;
                }
            },
            getChildren : function(id) {
                // return _25(this.element, id);
                var _self = this;
                var target = this.element;
                var opts = $.data(target, "treegrid").options;
                var panel = this.getPanel()
                    .find("div.datagrid-view2 div.datagrid-body");
                var children = [];
                if (id) {
                    findChildrenById(id);
                } else {
                    var _5f = this.getRoots();
                    for (var i = 0; i < _5f.length; i++) {
                        children.push(_5f[i]);
                        findChildrenById(_5f[i][opts.idField]);
                    }
                }
                function findChildrenById(nodeId) {
                    var node = _self.find(nodeId);
                    if (node && node.children) {
                        for (var i = 0, len = node.children.length; i < len; i++) {
                            var nodeChildren = node.children[i];
                            children.push(nodeChildren);
                            findChildrenById(nodeChildren[opts.idField]);
                        }
                    }
                };
                return children;
            },
            getLevel : function(id) {
                if (!id) {
                    return 0;
                }
                var target = this.element
                var _66 = $.data(target, "treegrid").options;
                var _67 = this.getPanel().children("div.datagrid-view");
                var _68 = _67.find("div.datagrid-body tr[node-id=\"" + id
                    + "\"]").children("td[field=\"" + _66.treeField
                    + "\"]");
                return _68.find("span.tree-indent,span.tree-hit").length;
            },
            find : function(id) {
                // return _self.find(this.element, id);
                if (!id){
                    return null;
                }
                var target = this.element;
                var opts = $.data(target, "treegrid").options;
                var data = $.data(target, "treegrid").data;
                var nodes = [data];
                while (nodes.length) {
                    var c = nodes.shift();
                    for (var i = 0; i < c.length; i++) {
                        var node = c[i];
                        if (node[opts.idField] == id) {
                            return node;
                        } else {
                            if (node["children"]) {
                                nodes.push(node["children"]);
                            }
                        }
                    }
                }
                return null;
            },
            isLeaf : function(id) {
                var _be = $.data(this.element, "treegrid").options;
                var tr = _be.finder.getTr(this.element, id);
                var hit = tr.find("span.tree-hit");
                return hit.length == 0;
            },
            select : function(id) {
                return this.grid.selectRow(id);
                /*return jq.each(function() {
                            $(this).datagrid("selectRow", id);
                        });*/
            },
            unselect : function(id) {
                /*return jq.each(function() {
                            $(this).datagrid("unselectRow", id);
                        });*/
                return this.grid.unselectRow(id);
            },
            collapse : function(id) {
                var target = this.element;
                var opts = $.data(target, "treegrid").options;
                var row = this.find(id);
                var _self = this;
                var tr = opts.finder.getTr(target, id);
                var hit = tr.find("span.tree-hit");
                if (hit.length == 0) {
                    return;
                }
                if (hit.hasClass("tree-collapsed")) {
                    return;
                }
                if (this.trigger("onBeforeCollapse", row) == false) {
                    return;
                }
                hit.removeClass("tree-expanded tree-expanded-hover")
                    .addClass("tree-collapsed");
                hit.next().removeClass("tree-folder-open");
                row.state = "closed";
                tr = tr.next("tr.treegrid-tr-tree");
                var cc = tr.children("td").children("div");
                if (opts.animate) {
                    cc.slideUp("normal", function() {
                        _self.autoSizeColumn();
                        _self.fixRowHeight(id);
                        _self.trigger("onCollapse", row);
                    });
                } else {
                    cc.hide();
                    _self.autoSizeColumn()
                    _self.fixRowHeight(id);
                    _self.trigger("onCollapse", row)
                }
            },
            renderNodeChildren : function(id) {
                var target = this.element;
                var opts = $.data(target, "treegrid").options;
                var tr1 = opts.finder.getTr(target, id, "body", 1);
                var tr2 = opts.finder.getTr(target, id, "body", 2);
                var colCount = this.getColumnFields(true).length
                    + (opts.rownumbers ? 1 : 0);
                var colCount2 = this.getColumnFields(false).length;
                addNodeRow(tr1, colCount);
                addNodeRow(tr2, colCount2);
                function addNodeRow(tr, _38) {
                    $("<tr class=\"treegrid-tr-tree\">"
                        + "<td style=\"border:0px\" colspan=\"" + _38
                        + "\">" + "<div></div>" + "</td>" + "</tr>")
                        .insertAfter(tr);
                };

            },
            expand : function(id) {
                var target = this.element;
                var opts = $.data(target, "treegrid").options;
                var tr = opts.finder.getTr(target, id);
                var hit = tr.find("span.tree-hit");
                var row = this.find(id);
                var _self = this;
                if (hit.length == 0) {
                    return;
                }
                if (hit.hasClass("tree-expanded")) {
                    return;
                }
                if (this.trigger("onBeforeExpand", row) == false) {
                    return;
                }
                hit.removeClass("tree-collapsed tree-collapsed-hover")
                    .addClass("tree-expanded");
                hit.next().addClass("tree-folder-open");
                var childrenDom = tr.next("tr.treegrid-tr-tree");
                if (childrenDom.length) {
                    var cc = childrenDom.children("td").children("div");
                    show(cc);
                } else {
                    this.renderNodeChildren(row[opts.idField]);
                    var childrenDom = tr.next("tr.treegrid-tr-tree");
                    var cc = childrenDom.children("td").children("div");
                    cc.hide();
                    var queryParams = $.extend({}, opts.queryParams || {});
                    var queryParamFields = _self.get("queryParamFields");

                    queryParams.id = row[opts.idField];
                    if (queryParamFields) {
                        var paramFields = queryParamFields.split(",");
                        for (var i = 0; i < paramFields.length; i++) {
                            queryParams[paramFields[i]] = row[paramFields[i]];
                        }
                    }
                    this.nodeLoad(row[opts.idField], queryParams, true,
                        function() {
                            if (cc.is(":empty")) {
                                childrenDom.remove();
                            } else {
                                show(cc);
                            }
                        });
                }
                function show(cc) {
                    row.state = "open";
                    if (opts.animate) {
                        cc.slideDown("normal", function() {
                            _self.autoSizeColumn();
                            _self.fixRowHeight(id);
                            _self.trigger("onExpand", row)
                        });
                    } else {
                        cc.show();
                        _self.autoSizeColumn();
                        _self.fixRowHeight(id);
                        _self.trigger("onExpand", row)

                    }
                };
            },
            toggle : function(id) {
                var opts = $.data(this.element, "treegrid").options;
                var tr = opts.finder.getTr(this.element, id);
                var hit = tr.find("span.tree-hit");
                if (hit.hasClass("tree-expanded")) {
                    this.collapse(id);
                } else {
                    this.expand(id);
                }
            },
            collapseAll : function(id) {
                return jq.each(function() {
                    _7c(this, id);
                });
            },
            expandAll : function(id) {
                return jq.each(function() {
                    _81(this, id);
                });
            },
            expandTo : function(id) {
                return jq.each(function() {
                    _86(this, id);
                });
            },
            append : function(_bf) {
                return jq.each(function() {
                    _8a(this, _bf);
                });
            },
            getCheckedNodes: function(checkedStatae) {
                checkedStatae = checkedStatae || "checked";
                var checkNode = [];
                treeUtils.forEach($(this.element).data("treegrid").checkedRows, false,
                    function(row) {
                        if (row.checkState == _e0) {
                            checkNode.push(row);
                        }
                    });
                return checkNode;
            },
            checkNode: function(id) {
                this.changeCheckNode(id,true)
            },
            uncheckNode: function(id) {
                this.changeCheckNode(id,false)
            },

            changeCheckNode : function(nodeId, checked, closeBeforeCheckEvent,
                                       closeCheckNodeEvent) {
                var opts = $.data(this.element, "treegrid");
                var checkedRows = opts.checkedRows;
                var options = opts.options;
                if (!options.checkbox) {
                    return;
                }
                var row = this.find(nodeId);
                if (!row.checkState) {
                    return;
                }
                var tr = options.finder.getTr(this.element,nodeId);
                var ck = tr.find(".tree-checkbox");
                if (checked == undefined) {
                    if (ck.hasClass("tree-checkbox1")) {
                        checked = false;
                    } else {
                        if (ck.hasClass("tree-checkbox0")) {
                            checked = true;
                        } else {
                            if (row._checked == undefined) {
                                row._checked = ck
                                    .hasClass("tree-checkbox1");
                            }
                            checked = !row._checked;
                        }
                    }
                }
                row._checked = checked;
                if (checked) {
                    if (ck.hasClass("tree-checkbox1")) {
                        return;
                    }
                } else {
                    if (ck.hasClass("tree-checkbox0")) {
                        return;
                    }
                }
                if (!closeBeforeCheckEvent) {
                    if (options.onBeforeCheckNode.call(row, checked) == false) {
                        return;
                    }
                }
                //半选状态
                if (options.cascadeCheck) {
                    this.setChildrenNodeChecBox(row, checked);
                    this.setParentNodeCheckbox(row);
                } else {
                    this.setNodeCheckBox(row, checked ? "1" : "0");
                }
                if (!closeCheckNodeEvent) {
                    options.onCheckNode.call(row, checked);
                }

            },
            setChildrenNodeChecBox : function(row, checkboxValue) {
                checkboxValue = checkboxValue ? 1 : 0;
                this.setNodeCheckBox(row, checkboxValue);
                var _self = this;
                treeUtils.forEach(row.children || [], true, function(r) {
                    _self.setNodeCheckBox(r, checkboxValue);
                });
            },
            setParentNodeCheckbox : function(row) {
                var options = $.data(this.element, "treegrid").options;
                var parentNode = this.getParent(row[options.idField]);
                if (parentNode) {
                    this.setNodeCheckBox(parentNode, this
                        .getNodeCheckValue(parentNode));
                    this.setParentNodeCheckbox(parentNode);
                }
            },
            getNodeCheckValue : function(row) {
                var len = 0;
                var c0 = 0;
                var c1 = 0;
                treeUtils.forEach(row.children || [], false, function(r) {
                    if (r.checkState) {
                        len++;
                        if (r.checkState == "checked") {
                            c1++;
                        } else {
                            if (r.checkState == "unchecked") {
                                c0++;
                            }
                        }
                    }
                });
                if (len == 0) {
                    return undefined;
                }
                var checkValue = 0;
                if (c0 == len) {
                    checkValue = 0;
                } else {
                    if (c1 == len) {
                        checkValue = 1;
                    } else {
                        checkValue = 2;
                    }
                }
                return checkValue;
            },
            setNodeCheckBox : function(row, nodeCheckState) {

                var treeGridObj = $.data(this.element, "treegrid");
                var checkedRows = treeGridObj.checkedRows;
                var options = treeGridObj.options;
                if (!row.checkState || nodeCheckState == undefined) {
                    return;
                }
                var tr = options.finder.getTr(this.element,row[options.idField]);
                var ck = tr.find(".tree-checkbox");
                if (!ck.length) {
                    return;
                }
                row.checkState = ["unchecked", "checked", "indeterminate"][nodeCheckState];
                row.checked = (row.checkState == "checked");
                ck
                    .removeClass("tree-checkbox0 tree-checkbox1 tree-checkbox2");
                ck.addClass("tree-checkbox" + nodeCheckState);
                if (nodeCheckState == 0) {
                    treeUtils.removeArrayItem(checkedRows, options.idField,
                        row[options.idField]);
                } else {
                    treeUtils.addArrayItem(checkedRows, options.idField,
                        row);
                }
            },
            insert : function(_c0) {
                return jq.each(function() {
                    _90(this, _c0);
                });
            },
            remove : function(id) {
                return jq.each(function() {
                    _9c(this, id);
                });
            },
            pop : function(id) {
                var row = jq.treegrid("find", id);
                jq.treegrid("remove", id);
                return row;
            },
            refresh : function(id) {
                return jq.each(function() {
                    var _c1 = $.data(this, "treegrid").options;
                    _c1.view.refreshRow.call(_c1.view, this, id);
                });
            },
            update : function(node) {

                var opts = $.data(this.element, "treegrid").options;
                opts.view.updateRow
                    .call(opts.view, this, node.id, node.row);
                var row = node.row;
                if (row.checked != undefined) {
                    row = this.find(node.id);
                    $.extend(row, {
                        checkState : row.checked
                            ? "checked"
                            : (row.checked === false
                                ? "unchecked"
                                : undefined)
                    });
                    this.updateCheckbox(_dd.id);
                }

            },

            updateCheckbox : function(nodeId) {
                var opts = $.data(this.element, "treegrid").options;
                if (!opts.checkbox) {
                    return;
                }
                var row = this.find(nodeId);
                var tr = opts.finder.getTr(nodeId);
                var ck = tr.find(".tree-checkbox");
                if (opts.view.hasCheckbox(row)) {
                    if (!ck.length) {
                        row.checkState = row.checkState || "unchecked";
                        $("<span class=\"tree-checkbox\"></span>")
                            .insertBefore(tr.find(".tree-title"));
                    }
                    if (row.checkState == "checked") {
                        this.changeCheckNode(nodeId, true, true);
                    } else {
                        if (row.checkState == "unchecked") {
                            this.changeCheckNode(nodeId, false, true);
                        } else {
                            var checkValue = this.getNodeCheckValue(row);
                            if (checkValue === 0) {
                                this.changeCheckNode(nodeId, false, true);
                            } else {
                                if (checkValue === 1) {
                                    this.changeCheckNode(nodeId, true, true);
                                }
                            }
                        }
                    }
                } else {
                    ck.remove();
                    row.checkState = undefined;
                    row.checked = undefined;
                    this.setParentNodeCheckbox(row);
                }

            },
            beginEdit : function(id) {
                var jq = $(this.element);
                return jq.each(function() {
                    $(this).datagrid("beginEdit", id);
                    $(this).treegrid("fixRowHeight", id);
                });
            },
            endEdit : function(id) {
                var jq = $(this.element);
                return jq.each(function() {
                    $(this).datagrid("endEdit", id);
                });
            },
            cancelEdit : function(id) {
                var jq = $(this.element);
                return jq.each(function() {
                    $(this).datagrid("cancelEdit", id);
                });
            },
            showLines : function() {
                /*
                 * return jq.each(function() { _a0(this); });
                 */
                var t = $(this.element);
                var _slef = this;
                var target = this.element;
                var _a2 = this.options();
                if (_a2.lines) {
                    this.getPanel().addClass("tree-lines");
                } else {
                    this.getPanel().removeClass("tree-lines");
                    return;
                }
                this.getPanel().find("span.tree-indent")
                    .removeClass("tree-line tree-join tree-joinbottom");
                this
                    .getPanel()
                    .find("div.datagrid-cell")
                    .removeClass("tree-node-last tree-root-first tree-root-one");
                var _a3 = this.getRoots();
                if (_a3.length > 1) {
                    _a4(_a3[0]).addClass("tree-root-first");
                } else {
                    if (_a3.length == 1) {
                        _a4(_a3[0]).addClass("tree-root-one");
                    }
                }
                _a5(_a3);
                _a6(_a3);
                function _a5(_a7) {
                    $.map(_a7, function(_a8) {
                        if (_a8.children && _a8.children.length) {
                            _a5(_a8.children);
                        } else {
                            var _a9 = _a4(_a8);
                            _a9.find(".tree-icon").prev()
                                .addClass("tree-join");
                        }
                    });
                    var _aa = _a4(_a7[_a7.length - 1]);
                    _aa.addClass("tree-node-last");
                    _aa.find(".tree-join").removeClass("tree-join")
                        .addClass("tree-joinbottom");
                };
                function _a6(_ab) {
                    $.map(_ab, function(_ac) {
                        if (_ac.children && _ac.children.length) {
                            _a6(_ac.children);
                        }
                    });
                    for (var i = 0; i < _ab.length - 1; i++) {
                        var _ad = _ab[i];
                        var _ae = _slef.getLevel(_ad[_a2.idField]);
                        var tr = _a2.finder.getTr(target, _ad[_a2.idField]);
                        var cc = tr.next()
                            .find("tr.datagrid-row td[field=\""
                                + _a2.treeField
                                + "\"] div.datagrid-cell");
                        cc.find("span:eq(" + (_ae - 1) + ")")
                            .addClass("tree-line");
                    }
                };
                function _a4(_af) {
                    var tr = _a2.finder.getTr(target, _af[_a2.idField]);
                    var _b0 = tr.find("td[field=\"" + _a2.treeField
                        + "\"] div.datagrid-cell");
                    return _b0;
                };
            }
        });

        TreeGrid.parseOptions = function(treeGridDom) {
            return $.extend({}, DataGrid.parseOptions(treeGridDom), $.fn
                .parseOptions(treeGridDom, ["treeField", {
                    animate : "boolean"
                }]));
        };

        var TreeGridView = DataGrid.GridView.extend({
            initialize : function(treeGrid) {
                this.treeGrid = treeGrid;
            },
            render : function(_c7, _c8) {
                var target = this.treeGrid.element;
                var _self = this;
                var opts = $.data(target, "treegrid").options;
                var columns = this.treeGrid.getColumnFields(_c8);
                var rowIdPrefix = $.data(target, "datagrid").rowIdPrefix;
                if (_c8) {
                    if (!(opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length))) {
                        return;
                    }
                }
                // var _self = this;
                if (this.treeNodes && this.treeNodes.length) {
                    var _cd = _ce(_c8, this.treeLevel, this.treeNodes);
                    $(_c7).append(_cd.join(""));
                }
                function _ce(_cf, _d0, _d1) {
                    var _d2 = _self.treeGrid
                        .getParent(_d1[0][opts.idField]);
                    var _d3 = (_d2 ? _d2.children.length : _self.treeGrid
                            .getRoots())
                        - _d1.length;
                    var _d4 = ["<table class=\"datagrid-btable\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tbody>"];
                    for (var i = 0; i < _d1.length; i++) {
                        var row = _d1[i];
                        if (opts.leafField) {
                            if (row[opts.leafField] == true
                                || row[opts.leafField] == "1") {
                                row.state = "open";
                            } else {
                                row.state = "closed";

                            }
                        } else {
                            if (opts.state) {
                                row.state = opts.state;
                            } else if (row.state != "open"
                                && row.state != "closed") {
                                row.state = "closed";
                            }
                        }

                        var css = opts.rowStyler ? opts.rowStyler.call(
                            target, row) : "";
                        var _d5 = "";
                        var _d6 = "";
                        if (typeof css == "string") {
                            _d6 = css;
                        } else {
                            if (css) {
                                _d5 = css["class"] || "";
                                _d6 = css["style"] || "";
                            }
                        }
                        var cls = "class=\"datagrid-row "
                            + (_d3++ % 2 && opts.striped
                                ? "datagrid-row-alt "
                                : " ") + _d5 + "\"";
                        var _d7 = _d6 ? "style=\"" + _d6 + "\"" : "";
                        var _d8 = rowIdPrefix + "-" + (_cf ? 1 : 2) + "-"
                            + row[opts.idField];
                        _d4.push("<tr id=\"" + _d8 + "\" node-id=\""
                            + row[opts.idField] + "\" " + cls + " "
                            + _d7 + ">");
                        _d4 = _d4.concat(_self.renderRow.call(_self,
                            columns, _cf, _d0, row));
                        _d4.push("</tr>");
                        if (row.children && row.children.length) {
                            var tt = _ce(_cf, _d0 + 1, row.children);
                            var v = row.state == "closed"
                                ? "none"
                                : "block";
                            _d4
                                .push("<tr class=\"treegrid-tr-tree\"><td style=\"border:0px\" colspan="
                                    + (columns.length + (opts.rownumbers
                                        ? 1
                                        : 0))
                                    + "><div style=\"display:"
                                    + v
                                    + "\">");
                            _d4 = _d4.concat(tt);
                            _d4.push("</div></td></tr>");
                        }
                    }
                    _d4.push("</tbody></table>");
                    return _d4;
                };
            },
            renderFooter : function(_da, _db) {
                var target = this.treeGrid.element;
                var _dc = $.data(target, "treegrid").options;
                var _dd = $.data(target, "treegrid").footer || [];
                var _de = this.treeGrid.getColumnFields(_db);
                var _df = ["<table class=\"datagrid-ftable\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tbody>"];
                for (var i = 0; i < _dd.length; i++) {
                    var row = _dd[i];
                    row[_dc.idField] = row[_dc.idField]
                        || ("foot-row-id" + i);
                    _df.push("<tr class=\"datagrid-row\" node-id=\""
                        + row[_dc.idField] + "\">");
                    _df.push(this.renderRow.call(this, _de, _db, 0, row));
                    _df.push("</tr>");
                }
                _df.push("</tbody></table>");
                $(_da).html(_df.join(""));
            },
            renderRow : function(_ff, _100, _101, row) {
                var target = this.treeGrid.element;
                var treeGridObject = $.data(target, "treegrid");
                var opts = treeGridObject.options;
                var cc = [];
                if (_100 && opts.rownumbers) {
                    cc.push("<td class=\"datagrid-td-rownumber\"><div class=\"datagrid-cell-rownumber\">0</div></td>");
                }
                for (var i = 0; i < _ff.length; i++) {
                    var _103 = _ff[i];
                    var col = $(target).treegrid("getColumnOption", _103);
                    if (col) {
                        var css = col.styler
                            ? (col.styler(row[_103], row) || "")
                            : "";
                        var cs = this.getStyleValue(css);
                        var cls = cs.c ? "class=\"" + cs.c + "\"" : "";
                        var _104 = col.hidden ? "style=\"display:none;"
                            + cs.s + "\"" : (cs.s ? "style=\"" + cs.s
                            + "\"" : "");
                        cc.push("<td field=\"" + _103 + "\" " + cls + " "
                            + _104 + ">");
                        var _104 = "";
                        if (!col.checkbox&&_103 != opts.treeField) {
                            if (col.align) {
                                _104 += "text-align:" + col.align + ";";
                            }
                            if (!opts.nowrap) {
                                _104 += "white-space:normal;height:auto;";
                            } else {
                                if (opts.autoRowHeight) {
                                    _104 += "height:auto;";
                                }
                            }
                        }
                        cc.push("<div style=\"" + _104 + "\" ");
                        if (col.checkbox) {
                            cc.push("class=\"datagrid-cell-check ");
                        } else {
                            cc.push("class=\"datagrid-cell "
                                + col.cellClass);
                        }
                        cc.push("\">");

                        if (col.buttons){
                            for (var j=0;j<col.buttons.length;j++){
                                var btn=col.buttons[j],disabled="";

                                if($.isFunction(btn.disabled)){
                                    if(btn.disabled(rowData, rowIndex)){
                                        disabled = ' disabled';
                                    }
                                }else if(btn.disabled === true){
                                    disabled = ' disabled';
                                }
                                cc.push( '<a id="'
                                    + btn.id
                                    + '" class="rowBtn'
                                    + disabled
                                    + '" tab-index="-1" href="javascript:void(0)">'
                                    + '<i class="' + btn.iconCls + '" title="'
                                    + btn.text + '"></i>' + '</a>');


                            }

                        }
                        if (col.checkbox) {
                            if (row.checked) {
                                cc
                                    .push("<input type=\"checkbox\" checked=\"checked\"");
                            } else {
                                cc.push("<input type=\"checkbox\"");
                            }
                            cc.push(" name=\""
                                + _103
                                + "\" value=\""
                                + (row[_103] != undefined
                                    ? row[_103]
                                    : "") + "\">");
                        } else {
                            var val = null;
                            if (col.formatter) {
                                val = col.formatter(row[_103], row);
                            } else {
                                val = row[_103];
                            }
                            if (_103 == opts.treeField) {
                                for (var j = 0; j < _101; j++) {
                                    cc
                                        .push("<span class=\"tree-indent\"></span>");
                                }
                                if (row.state == "closed") {
                                    cc
                                        .push("<span class=\"tree-hit tree-collapsed\"></span>");
                                    cc
                                        .push("<span class=\"tree-icon tree-folder "
                                            + (row.iconCls
                                                ? row.iconCls
                                                : "")
                                            + "\"></span>");
                                } else {
                                    if (row.children && row.children.length) {
                                        cc
                                            .push("<span class=\"tree-hit tree-expanded\"></span>");
                                        cc
                                            .push("<span class=\"tree-icon tree-folder tree-folder-open "
                                                + (row.iconCls
                                                    ? row.iconCls
                                                    : "")
                                                + "\"></span>");
                                    } else {
                                        cc
                                            .push("<span class=\"tree-indent\"></span>");
                                        cc
                                            .push("<span class=\"tree-icon tree-file "
                                                + (row.iconCls
                                                    ? row.iconCls
                                                    : "")
                                                + "\"></span>");
                                    }
                                }
                                if (this.hasCheckbox( row)) {
                                    var flag = 0;
                                    var crow = treeUtils.getArrayItem(
                                        treeGridObject.checkedRows, opts.idField,
                                        row[opts.idField]);
                                    if (crow) {
                                        flag = crow.checkState == "checked"
                                            ? 1
                                            : 2;
                                        row.checkState = crow.checkState;
                                        row.checked = crow.checked;
                                        treeUtils.addArrayItem(
                                            treeGridObject.checkedRows,
                                            opts.idField, row);
                                    } else {
                                        var prow =treeUtils
                                            .getArrayItem(
                                                treeGridObject.checkedRows,
                                                opts.idField,
                                                row._parentId);
                                        if (prow
                                            && prow.checkState == "checked"
                                            && opts.cascadeCheck) {
                                            flag = 1;
                                            row.checked = true;
                                            treeUtils.addArrayItem(
                                                treeGridObject.checkedRows,
                                                opts.idField, row);
                                        } else {
                                            if (row.checked) {
                                                treeUtils.addArrayItem(
                                                    treeGridObject.tmpIds,
                                                    row[opts.idField]);
                                            }
                                        }
                                        row.checkState = flag
                                            ? "checked"
                                            : "unchecked";
                                    }
                                    cc
                                        .push("<span class=\"tree-checkbox tree-checkbox"
                                            + flag + "\"></span>");
                                } else {
                                    row.checkState = undefined;
                                    row.checked = undefined;
                                }
                                cc.push("<span class=\"tree-title\">" + val
                                    + "</span>");
                            } else {
                                cc.push(val);
                            }
                        }
                        cc.push("</div>");
                        cc.push("</td>");
                    }
                }
                return cc.join("");
            },
            hasCheckbox : function(row) {
                var target = this.treeGrid.element;
                var opts = $.data(target, "treegrid").options;
                if (opts.checkbox) {
                    if ($.isFunction(opts.checkbox)) {
                        if (opts.checkbox.call(_105, row)) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        if (opts.onlyLeafCheck) {
                            if (row.state == "open"
                                && !(row.children && row.children.length)) {
                                return true;
                            }
                        } else {
                            return true;
                        }
                    }
                }
                return false;
            },

            refreshRow : function(id) {
                this.updateRow.call(this, id, {});
            },
            updateRow : function(id, row) {
                var _ea = this.treeGrid.element;
                var _eb = $.data(_ea, "treegrid").options;
                var _ec = $(_ea).treegrid("find", id);
                $.extend(_ec, row);
                var _ed = $(_ea).treegrid("getLevel", id) - 1;
                var _ee = _eb.rowStyler ? _eb.rowStyler.call(_ea, _ec) : "";
                var _ef = $.data(_ea, "datagrid").rowIdPrefix;
                var idFiled=_eb["idField"];
                var _f0 = _ec[idFiled];
                function _f1(_f2) {
                    var _f3 = $(_ea).treegrid("getColumnFields", _f2);
                    var tr = _eb.finder.getTr(_ea, id, "body",
                        (_f2 ? 1 : 2));
                    var _f4 = tr.find("div.datagrid-cell-rownumber").html();
                    var _f5 = tr
                        .find("div.datagrid-cell-check input[type=checkbox]")
                        .is(":checked");
                    tr.html(this.renderRow( _f3, _f2, _ed, _ec));
                    tr.attr("style", _ee || "");
                    tr.find("div.datagrid-cell-rownumber").html(_f4);
                    if (_f5) {
                        tr
                            .find("div.datagrid-cell-check input[type=checkbox]")
                            ._propAttr("checked", true);
                    }
                    if (_f0 != id) {
                        tr
                            .attr("id", _ef + "-" + (_f2 ? 1 : 2) + "-"
                                + _f0);
                        tr.attr("node-id", _f0);
                    }
                };
                _f1.call(this, true);
                _f1.call(this, false);
                $(_ea).treegrid("fixRowHeight", id);
            },
            deleteRow : function(_f6, id) {
                var _f7 = $.data(_f6, "treegrid").options;
                var tr = _f7.finder.getTr(_f6, id);
                tr.next("tr.treegrid-tr-tree").remove();
                tr.remove();
                var _f8 = del(id);
                if (_f8) {
                    if (_f8.children.length == 0) {
                        tr = _f7.finder.getTr(_f6, _f8[_f7.idField]);
                        tr.next("tr.treegrid-tr-tree").remove();
                        var _f9 = tr.children("td[field=\"" + _f7.treeField
                            + "\"]").children("div.datagrid-cell");
                        _f9.find(".tree-icon").removeClass("tree-folder")
                            .addClass("tree-file");
                        _f9.find(".tree-hit").remove();
                        $("<span class=\"tree-indent\"></span>")
                            .prependTo(_f9);
                    }
                }
                function del(id) {
                    var cc;
                    var _fa = $(_f6).treegrid("getParent", id);
                    if (_fa) {
                        cc = _fa.children;
                    } else {
                        cc = $(_f6).treegrid("getData");
                    }
                    for (var i = 0; i < cc.length; i++) {
                        if (cc[i][_f7.idField] == id) {
                            cc.splice(i, 1);
                            break;
                        }
                    }
                    return _fa;
                };
            },
            onBeforeRender : function(_fc, _fd) {
                var target = this.treeGrid.element;
                if ($.isArray(_fc)) {
                    _fd = {
                        total : _fc.length,
                        rows : _fc
                    };
                    _fc = null;
                }
                if (!_fd) {
                    return false;
                }
                var _fe = $.data(target, "treegrid");
                var _ff = _fe.options;
                if (_fd.length == undefined) {
                    if (_fd.footer) {
                        _fe.footer = _fd.footer;
                    }
                    if (_fd.total) {
                        _fe.total = _fd.total;
                    }
                    _fd = this.transfer(_fc, _fd.rows);
                } else {
                    function _100(_101, _102) {
                        for (var i = 0; i < _101.length; i++) {
                            var row = _101[i];
                            row._parentId = _102;
                            if (row.children && row.children.length) {
                                _100(row.children, row[_ff.idField]);
                            }
                        }
                    };
                    _100(_fd, _fc);
                }
                var node = this.treeGrid.find(_fc);
                if (node) {
                    if (node.children) {
                        node.children = node.children.concat(_fd);
                    } else {
                        node.children = _fd;
                    }
                } else {
                    _fe.data = _fe.data.concat(_fd);
                }
                this.sort(_fd);
                this.treeNodes = _fd;
                this.treeLevel = this.treeGrid.getLevel(_fc);
            },
            onAfterRender : function() {
                var opts = $.data(this.treeGrid.element, "datagrid").options;
                if (opts.showFooter) {
                    var _221 = this.grid.getPanel()
                        .find("div.datagrid-footer");
                    _221
                        .find("div.datagrid-cell-rownumber,div.datagrid-cell-check")
                        .css("visibility", "hidden");
                }
            },
            sort : function(data) {
                var target = this.treeGrid.element;
                var opts = $.data(target, "treegrid").options;
                if (!opts.remoteSort && opts.sortName) {
                    var sortNames = opts.sortName.split(",");
                    var sortOrders = opts.sortOrder.split(",");
                    dataSort(data);
                }
                function dataSort(rows) {
                    rows.sort(function(r1, r2) {
                        var r = 0;
                        for (var i = 0; i < sortNames.length; i++) {
                            var sn = sortNames[i];
                            var so = sortOrders[i];
                            var col = $(target).treegrid(
                                "getColumnOption", sn);
                            var _107 = col.sorter
                                || function(a, b) {
                                    return a == b ? 0 : (a > b
                                        ? 1
                                        : -1);
                                };
                            r = _107(r1[sn], r2[sn])
                                * (so == "asc" ? 1 : -1);
                            if (r != 0) {
                                return r;
                            }
                        }
                        return r;
                    });
                    for (var i = 0; i < rows.length; i++) {
                        var _108 = rows[i].children;
                        if (_108 && _108.length) {
                            dataSort(_108);
                        }
                    }
                };
            },
            transfer : function(_10a, data) {
                var target = this.treeGrid.element;
                var opts = $.data(target, "treegrid").options;
                var rows = [];
                for (var i = 0; i < data.length; i++) {
                    rows.push(data[i]);
                }
                var _10b = [];
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    if (!_10a) {
                        if (!row._parentId) {
                            _10b.push(row);
                            rows.splice(i, 1);
                            i--;
                        }
                    } else {
                        if (row._parentId == _10a) {
                            _10b.push(row);
                            rows.splice(i, 1);
                            i--;
                        }
                    }
                }
                var toDo = [];
                for (var i = 0; i < _10b.length; i++) {
                    toDo.push(_10b[i]);
                }
                while (toDo.length) {
                    var node = toDo.shift();
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        if (row._parentId == node[opts.idField]) {
                            if (node.children) {
                                node.children.push(row);
                            } else {
                                node.children = [row];
                            }
                            toDo.push(row);
                            rows.splice(i, 1);
                            i--;
                        }
                    }
                }
                return _10b;
            }

        });

        function mouseEvent(isOver) {
            return function(e) {
                DataGrid.defaults.rowEvents[isOver ? "mouseover": "mouseout"](e);
                var tt = $(e.target);
                var fn = isOver ? "addClass": "removeClass";
                if (tt.hasClass("tree-hit")) {
                    tt.hasClass("tree-expanded") ? tt[fn]("tree-expanded-hover") : tt[fn]("tree-collapsed-hover");
                }
            };
        };

        function getTreeGridDOM(t) {
            return $(t).closest("div.datagrid-view").children(".datagrid-f")[0];
        };
        function rowClickEvent(e) {
            var tt = $(e.target);
            var tr = tt.closest("tr.datagrid-row");
            if (!tr.length || !tr.parent().length) {
                return;
            }
            var nodeId = tr.attr("node-id");
            var treeGridDOM = getTreeGridDOM(tr);
            var treeGridClass =  $.data(treeGridDOM, "treeGridObj");
            if (tt.hasClass("tree-hit")) {
                treeGridClass.toggle(nodeId);
            } else {
                if (tt.hasClass("tree-checkbox")) {
                    treeGridClass.changeCheckNode(nodeId);
                } else {
                    var options = $(treeGridDOM).treegrid("options");
                    if (!tt.parent().hasClass("datagrid-cell-check") && !options.singleSelect && e.shiftKey) {
                        var children = $(treeGridDOM).treegrid("getChildren");
                        var _2c = treeUtils.indexOfArray(children, options.idField, options.lastSelectedIndex);
                        var _2d = treeUtils.indexOfArray(children, options.idField, nodeId);
                        var _2e = Math.min(Math.max(_2c, 0), _2d);
                        var to = Math.max(_2c, _2d);
                        var row = children[_2d];
                        var td = tt.closest("td[field]", tr);
                        if (td.length) {
                            var _2f = td.attr("field");
                            options.onClickCell.call(treeGridDOM, nodeId, _2f, row[_2f]);
                        }
                        $(treeGridDOM).treegrid("clearSelections");
                        for (var i = _2e; i <= to; i++) {
                            $(treeGridDOM).treegrid("selectRow", children[i][options.idField]);
                        }

                        treeGridClass.trigger("onClickRow",row)
                        // options.onClickRow.call(treeGridDOM, row);
                    } else {
                        DataGrid.defaults.rowEvents.click(e);
                    }
                }
            }
        };

        TreeGrid.defaults = $.extend({}, DataGrid.defaults, {
            treeField : null,
            lines : false,
            animate : false,
            singleSelect : true,
            rootId : '-1',
            asyTree : false,
            leafField : '',
            checkboxField : '',
            checkbox: false,
            cascadeCheck: true,
            onlyLeafCheck: false,
            onBeforeCheckNode: function(row, _133) {},
            onCheckNode: function(row, _134) {},
            rowEvents: $.extend({},
                DataGrid.defaults.rowEvents, {
                    mouseover: mouseEvent(true),
                    mouseout: mouseEvent(false),
                    click: rowClickEvent
                }),
            // view : _c5,
            loader : function(queryParams, success, error) {
                var opts = this.options();
                var _self = this;
                if (!opts.url) {
                    return false;
                }
                if (!error) {
                    var ajaxError = error;
                    error = function() {
                        ajaxError.apply(this, arguments);
                    }
                }
                AppAjax.ajaxCall({
                    type : opts.method,
                    url : opts.url,
                    data : queryParams,
                    dataType : "json",
                    success : function(data) {
                        var data = data.data || data
                        data = _self.listToTreeData(data);
                        success(data);
                    },
                    error : error
                });
            },
            loadFilter : function(data, _10f) {
                return data;
            }

        });

        $.fn.treegrid = function(options, param) {
            var methodReturn;

            var $set = this.each(function() {
                var opt = options || {};
                var $this = $(this);
                var state = $.data(this, 'treegrid');
                var treeGridObj = $this.data('treeGridObj');
                if (state) {
                    if (typeof opt === 'object') {
                        var opts = $.extend(state.options, opt);
                    }
                } else {
                    opt.element = this;;
                    treeGridObj = new TreeGrid(this, opt);
                    $this.data('treeGridObj', treeGridObj);
                    // data._init(this);
                }
                if (typeof opt === 'string')
                    methodReturn = treeGridObj[options](param);
            });
            return (methodReturn === undefined) ? $set : methodReturn;
        };
        return TreeGrid;
    }

)