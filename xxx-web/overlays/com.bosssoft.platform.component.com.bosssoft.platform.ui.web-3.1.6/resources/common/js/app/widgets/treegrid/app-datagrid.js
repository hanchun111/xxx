/**
 *
 */

define(	["app/core/app-jquery", "app/core/app-core", "app/core/app-options",
    "jquery/jquery-ui", "app/widgets/app-widget",
    "app/widgets/panel/app-panel",
    "app/widgets/treegrid/app-pagination"], function($, $A, Opts,
                                                     resizable, Widget, Panel) {
    var _1 = 0;
    // =_2(
    var findArrayIndex = function(arrayList, value) {
        for (var i = 0, len = arrayList.length; i < len; i++) {
            if (arrayList[i] == value) {
                return i;
            }
        }
        return -1;
    }
    function addArrayMap(a, o, r) {
        for (var i = 0, _8 = a.length; i < _8; i++) {
            if (a[i][o] == r[o]) {
                return;
            }
        }
        a.push(r);
    };

    function removeArrayMap(a, o, id) {
        if (typeof o == "string") {
            for (var i = 0, _5 = a.length; i < _5; i++) {
                if (a[i][o] == id) {
                    a.splice(i, 1);
                    return;
                }
            }
        } else {
            var _6 = findArrayIndex(a, o);
            if (_6 != -1) {
                a.splice(_6, 1);
            }
        }
    };
    var DataGrid = Widget.extend({
        operator:{},

        initColumnButton:function(columns){
            if (columns){
                for (var i=0;i<columns.length;i++){

                    for (var j=0;j<columns[i].length;j++){

                        var col=columns[i][j];
                        if (col.buttons){
                            for(var m=0;m<col.buttons.length;m++){
                                var btn=col.buttons[m];
                                this.operator[btn["id"]]=btn["handler"];
                            }
                        }
                    }
                }
            }
        },


        initialize : function(el, opt) {
            var data = $.data(el, "datagrid");
            var opts;
            this.element = el;
            if (data) {
                opts = $.extend(data.options, opt);
                data.options = opts;
            } else {
                opts = $.extend({}, $.extend({}, DataGrid.defaults, {
                    queryParams : {}
                }), DataGrid.parseOptions(el), opt);
                $(this).css("width", "").css("height", "");
                var wrapResult = this.wrapGrid(opts.rownumbers);
                if (!opts.view) {
                    opts.view = new GridView(this);

                }
                if (!opts.columns) {
                    opts.columns = wrapResult.columns;
                }


                if (!opts.frozenColumns) {
                    opts.frozenColumns = wrapResult.frozenColumns;
                }

                opts.columns = $.extend(true, [], opts.columns);
                opts.frozenColumns = $.extend(true, [],
                    opts.frozenColumns);
                opts.view = $.extend({}, opts.view);
                this.initColumnButton(opts.columns);
                this.initColumnButton(opts.frozenColumns);
                $.data(el, "datagrid", {
                    options : opts,
                    panel : wrapResult.panel,
                    dc : wrapResult.dc,
                    ss : null,
                    selectedRows : [],
                    checkedRows : [],
                    data : {
                        total : 0,
                        rows : []
                    },
                    originalRows : [],
                    updatedRows : [],
                    insertedRows : [],
                    deletedRows : []
                });
            }
            this.render();
            this.renderGridWarp();
            this.resize();
            if (opts.data) {
                this.loadData(opts.data);
                this.clearEditData();
            } else {
                var data = this.parseData();
                if (data.total > 0) {
                    this.loadData(data);
                    this.clearEditData();
                }
            }
            if (opts.autoLoad) {
                this.load();
            }
            DataGrid.superclass.initialize.call(this, opts);
            this.addEvents("onLoadSuccess", "onLoadError",
                "onBeforeLoad", "onClickRow", "onDblClickRow",
                "onClickCell", "onDblClickCell", "onSortColumn",
                "onResizeColumn", "onSelect", "onUnselect",
                "onSelectAll", "onUnselectAll", "onCheck",
                "onUncheck", "onCheckAll", "onUncheckAll",
                "onBeforeEdit", "onAfterEdit", "onCancelEdit",
                "onHeaderContextMenu", "onAfterRender",
                "onRowContextMenu");
        },
        registerEvent : function(opts) {
            var events = [];
            for (var i = 0; i < events.length; i++) {
                if (opts[events[i]]) {
                    this.on(events[i], opts[events[i]]);
                }
            }

        },
        getPager : function() {
            return $.data(this.element, "datagrid").panel
                .children("div.datagrid-pager");
        },

        setSelectionState : function() {
            var target = this.element;
            var _e5 = $.data(target, "datagrid");
            var _e6 = _e5.options;
            var dc = _e5.dc;
            dc.header1.add(dc.header2).find("input[type=checkbox]")
                .attr("checked", false);
            if (_e6.idField) {
                var _e7 = $.data(target, "treegrid") ? true : false;
                var _e8 = _e6.onSelect;
                var _e9 = _e6.onCheck;
                _e6.onSelect = _e6.onCheck = function() {
                };
                var _ea = _e6.finder.getRows.call(this, target);
                for (var i = 0; i < _ea.length; i++) {
                    var row = _ea[i];
                    var _eb = _e7 ? row[_e6.idField] : i;
                    if (_ec(_e5.selectedRows, row)) {
                        this.selectRow(_eb, true);
                    }
                    if (_ec(_e5.checkedRows, row)) {
                        this.checkRow(_eb, true);
                    }
                }
                _e6.onSelect = _e8;
                _e6.onCheck = _e9;
            }
            function _ec(a, r) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i][_e6.idField] == r[_e6.idField]) {
                        a[i] = r;
                        return true;
                    }
                }
                return false;
            };
        },
        parseData : function() {
            var t = $(this.element);
            var data = {
                total : 0,
                rows : []
            };
            var _1e6 = this.getColumnFields(true).concat(this
                .getColumnFields(false));
            t.find("tbody tr").each(function() {
                data.total++;
                var row = {};
                $.extend(row, $.fn.parseOptions(this, ["iconCls",
                    "state"]));
                for (var i = 0; i < _1e6.length; i++) {
                    row[_1e6[i]] = $(this).find("td:eq(" + i + ")")
                        .html();
                }
                data.rows.push(row);
            });

            return data;
        },
        setViewSize : function() {
            var target = this.element;
            var gridData = $.data(target, "datagrid");
            var opts = gridData.options;
            var dc = gridData.dc;
            var panel = gridData.panel;
            var panelWidth = panel.width();
            var panelHeight = panel.height();
            var view = dc.view;
            var view1 = dc.view1;
            var view2 = dc.view2;
            var view1Header = view1.children("div.datagrid-header");
            var view2Header = view2.children("div.datagrid-header");
            var view1Table = view1Header.find("table");
            var view2Table = view2Header.find("table");
            view.width(panelWidth);
            var _30 = view1Header.children("div.datagrid-header-inner")
                .show();
            view1.width(_30.find("table").width());
            if (!opts.showHeader) {
                _30.hide();
            }
            view2.width(panelWidth - view1._outerWidth());

            view1
                .children("div.datagrid-header,div.datagrid-body,div.datagrid-footer")
                .width(view1.width());
            view2
                .children("div.datagrid-header,div.datagrid-body,div.datagrid-footer")
                .width(view2.width());
            var hh;
            view1Header.add(view2Header).css("height", "");
            view1Table.add(view2Table).css("height", "");
            hh = Math.max(view1Table.height(), view2Table.height());
            view1Table.add(view2Table).height(hh);
            view1Header.add(view2Header)._outerHeight(hh);
            dc.body1.add(dc.body2)
                .children("table.datagrid-btable-frozen").css({
                position : "absolute",
                top : dc.header2._outerHeight()
            });
            var frozen2Height = dc.body2
                .children("table.datagrid-btable-frozen")
                ._outerHeight();
            var pagerHeight = frozen2Height
                + view2.children("div.datagrid-header")
                    ._outerHeight()
                + view2.children("div.datagrid-footer")
                    ._outerHeight()
                + panel.children("div.datagrid-toolbar")
                    ._outerHeight();
            panel.children("div.datagrid-pager").each(function() {
                pagerHeight += $(this)._outerHeight();
            });
            var boxHeight = panel.outerHeight() - panel.height();
            var panelMinHeight = panel._size("minHeight") || "";
            var panelMaxHeight = panel._size("maxHeight") || "";
            view1.add(view2).children("div.datagrid-body").css({
                marginTop : frozen2Height,
                height : (isNaN(parseInt(opts.height))
                    ? ""
                    : (panelHeight - pagerHeight)),
                minHeight : (panelMinHeight ? panelMinHeight
                    - boxHeight - pagerHeight : ""),
                maxHeight : (panelMaxHeight ? panelMaxHeight
                    - boxHeight - pagerHeight : "")
            });
            view.height(view2.height());

        },
        loading : function(jq) {

            var opts = $.data(this.element, "datagrid").options;
            this.getPager().pagination("loading");
            if (opts.loadMsg) {
                var _1c0 = this.getPanel();
                if (!_1c0.children("div.datagrid-mask").length) {
                    $("<div class=\"datagrid-mask\" style=\"display:block\"></div>")
                        .appendTo(_1c0);
                    var msg = $("<div class=\"datagrid-mask-msg\" style=\"display:block;left:50%\"></div>")
                        .html(opts.loadMsg).appendTo(_1c0);
                    msg._outerHeight(40);
                    msg.css({
                        marginLeft : (-msg.outerWidth() / 2),
                        lineHeight : (msg.height() + "px")
                    });
                }
            }

        },
        options : function() {
            var _1b7 = $.data(this.element, "datagrid").options;
            var _1b8 = $.data(this.element, "datagrid").panel
                .panel("options");
            var opts = $.extend(_1b7, {
                width : _1b8.width,
                height : _1b8.height,
                closed : _1b8.closed,
                collapsed : _1b8.collapsed,
                minimized : _1b8.minimized,
                maximized : _1b8.maximized
            });
            return opts;
        },
        getPanel : function() {
            return $.data(this.element, "datagrid").panel;
        },
        reload : function(_1be) {

            var opts = $(this.element).datagrid("options");
            if (typeof _1be == "string") {
                opts.url = _1be;
                _1be = null;
            }
            this.load( _1be);

        },
        reloadFooter : function(_1bf) {

            var opts = $.data(this.element, "datagrid").options;
            var dc = $.data(this.element, "datagrid").dc;
            if (_1bf) {
                $.data(this.element, "datagrid").footer = _1bf;
            }
            if (opts.showFooter) {
                opts.view.renderFooter.call(opts.view,
                    this, dc.footer2, false);
                opts.view.renderFooter.call(opts.view,
                    this, dc.footer1, true);
                if (opts.view.onAfterRender) {
                    opts.view.onAfterRender.call(opts.view,
                        this);
                }
                this.fixRowHeight();

            }

        },

        loaded : function() {

            this.getPager().pagination("loaded");
            var _1c1 = this.getPanel();
            _1c1.children("div.datagrid-mask-msg").remove();
            _1c1.children("div.datagrid-mask").remove();

        },

        freezeRow : function(_1c4) {
            var target = this.element;
            var _4a = $.data(target, "datagrid");
            var _4b = _4a.options;
            var dc = _4a.dc;
            if (!dc.body2.children("table.datagrid-btable-frozen").length) {
                dc.body1
                    .add(dc.body2)
                    .prepend("<table class=\"datagrid-btable datagrid-btable-frozen\" cellspacing=\"0\" cellpadding=\"0\"></table>");
            }
            _4c(true);
            _4c(false);
            this.setViewSize();
            function _4c(_4d) {
                var _4e = _4d ? 1 : 2;
                var tr = _4b.finder.getTr(target, _49, "body", _4e);
                (_4d ? dc.body1 : dc.body2)
                    .children("table.datagrid-btable-frozen")
                    .append(tr);
            };
        },
        autoSizeColumn : function(_ae) {
            var target = this.element;
            var _af = $.data(target, "datagrid");
            var _b0 = _af.options;
            var dc = _af.dc;
            var _self = this;
            var tmp = $("<div class=\"datagrid-cell\" style=\"position:absolute;left:-9999px\"></div>")
                .appendTo("body");
            if (_ae) {
                _1c(_ae);
                if (_b0.fitColumns) {
                    this.setViewSize();
                    this.fitColumns();
                }
            } else {
                var _b1 = false;
                var _b2 = this.getColumnFields(true).concat(this
                    .getColumnFields(false));
                for (var i = 0; i < _b2.length; i++) {
                    var _ae = _b2[i];
                    var col = this.getColumnOption(_ae);
                    if (col.auto) {
                        _1c(_ae);
                        _b1 = true;
                    }
                }
                if (_b1 && _b0.fitColumns) {
                    this.setViewSize();
                    this.fitColumns();
                }
            }
            tmp.remove();
            function _1c(_b3) {
                var _b4 = dc.view
                    .find("div.datagrid-header td[field=\"" + _b3
                        + "\"] div.datagrid-cell");
                _b4.css("width", "");
                var col = _self.getColumnOption(_b3);
                col.width = undefined;
                col.boxWidth = undefined;
                col.auto = true;
                _self.fixColumnSize(_b3)
                // $(target).datagrid("fixColumnSize", _b3);
                var _b5 = Math.max(_b6("header"), _b6("allbody"),
                    _b6("allfooter"))
                    + 1;
                _b4._outerWidth(_b5 - 1);
                col.width = _b5;
                col.boxWidth = parseInt(_b4[0].style.width);
                col.deltaWidth = _b5 - col.boxWidth;
                _b4.css("width", "");
                _self.fixColumnSize(_b3);
                _b0.onResizeColumn.call(target, _b3, col.width);
                function _b6(_b7) {
                    var _b8 = 0;
                    if (_b7 == "header") {
                        _b8 = _b9(_b4);
                    } else {
                        _b0.finder.getTr(target, 0, _b7)
                            .find("td[field=\"" + _b3
                                + "\"] div.datagrid-cell")
                            .each(function() {
                                var w = _b9($(this));
                                if (_b8 < w) {
                                    _b8 = w;
                                }
                            });
                    }
                    return _b8;
                    function _b9(_ba) {
                        return _ba.is(":visible")
                            ? _ba._outerWidth()
                            : tmp.html(_ba.html())._outerWidth();
                    };
                };
            };
        },
        getData : function() {
            return $.data(this.element, "datagrid").data;
        },
        getRows : function() {
            return $.data(this.element, "datagrid").data.rows;
        },
        getFooterRows : function() {
            return $.data(this.element, "datagrid").footer;
        },
        getRowIndex : function(id) {
            var _ef = $.data(this.element, "datagrid");
            var _f0 = _ef.options;
            var _f1 = _ef.data.rows;
            if (typeof row == "object") {
                return findArrayIndex(_f1, row);
            } else {
                for (var i = 0; i < _f1.length; i++) {
                    if (_f1[i][_f0.idField] == row) {
                        return i;
                    }
                }
                return -1;
            }
        },
        getChecked : function() {
            var _fa = $.data(this.element, "datagrid");
            var _fb = _fa.options;
            if (_fb.idField) {
                return _fa.checkedRows;
            } else {
                var _fc = [];
                _fb.finder.getTr(_f9, "", "checked", 2).each(
                    function() {
                        _fc.push(_fb.finder.getRow(_f9, $(this)));
                    });
                return _fc;
            }
        },
        getSelected : function() {
            var rows = this.getSelections();
            return rows.length > 0 ? rows[0] : null;
        },
        getSelections : function() {
            var _f4 = $.data(this.element, "datagrid");
            var _f5 = _f4.options;
            var _f6 = _f4.data;
            if (_f5.idField) {
                return _f4.selectedRows;
            } else {
                var _f7 = [];
                _f5.finder.getTr(_f3, "", "selected", 2).each(
                    function() {
                        _f7.push(_f5.finder.getRow(_f3, $(this)));
                    });
                return _f7;
            }
        },
        clearSelections : function() {
            var _1c6 = $.data(this.element, "datagrid");
            var _1c7 = _1c6.selectedRows;
            var _1c8 = _1c6.checkedRows;
            _1c7.splice(0, _1c7.length);
            _10e(this);
            if (_1c6.options.checkOnSelect) {
                _1c8.splice(0, _1c8.length);
            }
        },
        clearChecked : function() {

            var _1c9 = $.data(this.element, "datagrid");
            var _1ca = _1c9.selectedRows;
            var _1cb = _1c9.checkedRows;
            _1cb.splice(0, _1cb.length);
            this.uncheckAll();
            if (_1c9.options.selectOnCheck) {
                _1ca.splice(0, _1ca.length);
            }

        },
        scrollTo : function(rowIndex) {
            var _100 = $.data(this.element, "datagrid");
            var dc = _100.dc;
            var opts = _100.options;
            var tr = opts.finder.getTr(this.element, rowIndex);
            if (tr.length) {
                if (tr.closest("table")
                        .hasClass("datagrid-btable-frozen")) {
                    return;
                }
                var _101 = dc.view2.children("div.datagrid-header")
                    ._outerHeight();
                var _102 = dc.body2;
                var _103 = _102.outerHeight(true) - _102.outerHeight();
                var top = tr.position().top - _101 - _103;
                if (top < 0) {
                    _102.scrollTop(_102.scrollTop() + top);
                } else {
                    if (top + tr._outerHeight() > _102.height() - 18) {
                        _102.scrollTop(_102.scrollTop() + top
                            + tr._outerHeight() - _102.height()
                            + 18);
                    }
                }
            }
        },
        rowOver : function(rowIndex) {
            var gridData = $.data(this.element, "datagrid");
            var opts = gridData.options;
            opts.finder.getTr(this.element, gridData.highlightIndex)
                .removeClass("datagrid-row-over");
            opts.finder.getTr(this.element, rowIndex)
                .addClass("datagrid-row-over");
            gridData.highlightIndex = rowIndex;
        },
        highlightRow : function(_1cd) {
            this.rowOver(_1cd);
            this.scrollTo(_1cd);
        },
        selectAll : function() {
            var target = this.element;
            var _11a = $.data(this.element, "datagrid");
            var opts = _11a.options;
            var rows = opts.finder.getRows.call(this, target);
            var _11b = $.data(this.element, "datagrid").selectedRows;
            if (!_119 && opts.checkOnSelect) {
                this.checkAll(true);
            }
            opts.finder.getTr(this.element, "", "allbody")
                .addClass("datagrid-row-selected");
            if (opts.idField) {
                for (var _11d = 0; _11d < rows.length; _11d++) {
                    removeArrayMap(_11b, opts.idField, rows[_11d]);
                }
            }
            this.trigger("onSelectAll", rows)
        },
        unselectAll : function(_11f) {
            var target = this.element;
            var _120 = $.data(target, "datagrid");
            var opts = _120.options;
            var rows = opts.finder.getRows.call(this, target);
            var _121 = $.data(target, "datagrid").selectedRows;
            if (!_11f && opts.checkOnSelect) {
                this.uncheckAll(true);
            }
            opts.finder.getTr(target, "", "selected")
                .removeClass("datagrid-row-selected");
            if (opts.idField) {
                for (var _123 = 0; _123 < rows.length; _123++) {
                    removeArrayMap(_121, opts.idField,
                        rows[_123][opts.idField]);
                }
            }
            this.trigger("onUnselectAll", rows);
        },
        selectRow : function(rowIndex, _10b) {
            var target = this.element;
            var _10c = $.data(target, "datagrid");
            var dc = _10c.dc;
            var opts = _10c.options;
            var selectedRows = _10c.selectedRows;
            if (opts.singleSelect) {
                this.unselectAll();
                selectedRows.splice(0, selectedRows.length);
            }
            if (!_10b && opts.checkOnSelect) {
                this.checkRow(rowIndex, true);
            }
            var row = opts.finder.getRow.call(this, rowIndex);
            if (opts.idField) {
                addArrayMap(selectedRows, opts.idField, row);
            }
            opts.finder.getTr(target, rowIndex)
                .addClass("datagrid-row-selected");
            // opts.onSelect.call(target, rowIndex, row);
            this.trigger("onSelect", rowIndex, row);

            this.scrollTo(rowIndex);
        },
        selectRecord : function( id) {

            var opts = $.data(this.element, "datagrid").options;
            if (opts.idField) {
                var _1cf = _ed(this, id);
                if (_1cf >= 0) {
                    this.selectRow(_1cf)

                }
            }

        },
        unselectRow : function(rowIndex, _113) {
            var target = this.element;
            var _114 = $.data(target, "datagrid");
            var dc = _114.dc;
            var opts = _114.options;
            var _115 = $.data(target, "datagrid").selectedRows;
            if (!_113 && opts.checkOnSelect) {
                this.uncheckRow(rowIndex, true);
            }
            opts.finder.getTr(target, rowIndex)
                .removeClass("datagrid-row-selected");
            var row = opts.finder.getRow(this, target, rowIndex);
            if (opts.idField) {
                removeArrayMap(_115, opts.idField, row[opts.idField]);
            }
            this.trigger("onUnselect", rowIndex, row)
        },
        checkRow : function(rowIndex, _126) {
            var target = this.element;
            var _127 = $.data(target, "datagrid");
            var opts = _127.options;
            if (!_126 && opts.selectOnCheck) {
                this.selectRow(rowIndex, true);
            }
            var tr = opts.finder.getTr(target, rowIndex)
                .addClass("datagrid-row-checked");
            var ck = tr
                .find("div.datagrid-cell-check input[type=checkbox]");
            ck.attr("checked", true);
            tr = opts.finder.getTr(target, "", "checked", 2);
            if (tr.length == opts.finder.getRows.call(this, target).length) {
                var dc = _127.dc;
                var _128 = dc.header1.add(dc.header2);
                _128.find("input[type=checkbox]").attr("checked", true);
            }
            var row = opts.finder.getRow.call(this, rowIndex);
            if (opts.idField) {
                addArrayMap(_127.checkedRows, opts.idField, row);
            }
            this.trigger("onCheck", rowIndex, row)

        },
        uncheckRow : function(_12a, _12b) {
            var target = this.element;
            var _12c = $.data(target, "datagrid");
            var opts = _12c.options;
            if (!_12b && opts.selectOnCheck) {
                this.unselectRow(target, _12a, true);
            }
            var tr = opts.finder.getTr(target, _12a)
                .removeClass("datagrid-row-checked");
            var ck = tr
                .find("div.datagrid-cell-check input[type=checkbox]");
            ck.attr("checked", false);
            var dc = _12c.dc;
            var _12d = dc.header1.add(dc.header2);
            _12d.find("input[type=checkbox]").attr("checked", false);
            var row = opts.finder.getRow.call(this, target, _12a);
            if (opts.idField) {
                removeArrayMap(_12c.checkedRows, opts.idField,
                    row[opts.idField]);
            }
            this.trigger("onUncheck", _12a, row)

        },
        beginEdit : function(rowIndex) {
            var target = this.element;
            var opts = $.data(target, "datagrid").options;
            var tr = opts.finder.getTr(target, rowIndex);
            var row = opts.finder.getRow.call(this, rowIndex);
            if (tr.hasClass("datagrid-row-editing")) {
                return;
            }
            if (this.trigger("onBeforeEdit", rowIndex, row) == false) {
                return;
            }
            tr.addClass("datagrid-row-editing");
            this.showEditor(rowIndex);
            this.setEditorWidth();
            tr.find("div.datagrid-editable").each(function() {
                var _138 = $(this).parent().attr("field");
                var ed = $.data(this, "datagrid.editor");
                ed.actions.setValue(ed.target, row[_138]);
            });
            this.validateRow(rowIndex);
            this.trigger("onBeginEdit", rowIndex, row);
        },
        showEditor : function(rowIndex) {
            var target = this.element;
            var opts = $.data(target, "datagrid").options;
            var tr = opts.finder.getTr(target, rowIndex);
            var _self=this;
            tr.children("td").each(function() {
                var cell = $(this).find("div.datagrid-cell");
                var _150 = $(this).attr("field");
                var col = _self.getColumnOption(_150);
                if (col && col.editor) {
                    var _151, _152;
                    if (typeof col.editor == "string") {
                        _151 = col.editor;
                    } else {
                        _151 = col.editor.type;
                        _152 = col.editor.options;
                    }
                    var _153 = opts.editors[_151];
                    if (_153) {
                        var _154 = cell.html();
                        var _155 = cell._outerWidth();
                        cell.addClass("datagrid-editable");
                        cell._outerWidth(_155);
                        cell
                            .html("<table border=\"0\" cellspacing=\"0\" cellpadding=\"1\"><tr><td></td></tr></table>");
                        cell.children("table").bind(
                            "click dblclick contextmenu",
                            function(e) {
                                e.stopPropagation();
                            });
                        $.data(cell[0], "datagrid.editor", {
                            actions : _153,
                            target : _153.init(cell.find("td"),
                                _152),
                            field : _150,
                            type : _151,
                            oldHtml : _154
                        });
                    }
                }
            });
            this.fixRowHeight(rowIndex, true);
        },
        endEdit : function(rowIndex, notValidate) {
            var target = this.element;
            var _13e = $.data(target, "datagrid");
            var opts = _13e.options;
            var _13f = _13e.updatedRows;
            var _140 = _13e.insertedRows;
            var tr = opts.finder.getTr(target, rowIndex);
            var row = opts.finder.getRow.call(this, rowIndex);
            if (!tr.hasClass("datagrid-row-editing")) {
                return;
            }
            if (!notValidate) {
                if (!this.validateRow(rowIndex)) {
                    return;
                }
                var _141 = false;
                var _142 = {};
                tr.find("div.datagrid-editable").each(function() {
                    var _143 = $(this).parent().attr("field");
                    var ed = $.data(this, "datagrid.editor");
                    var _144 = ed.actions.getValue(ed.target);
                    if (row[_143] != _144) {
                        row[_143] = _144;
                        _141 = true;
                        _142[_143] = _144;
                    }
                });
                if (_141) {
                    if (findArrayIndex(_140, row) == -1) {
                        if (findArrayIndex(_13f, row) == -1) {
                            _13f.push(row);
                        }
                    }
                }
                this.trigger("onEndEdit", rowIndex, row, _142);
            }
            tr.removeClass("datagrid-row-editing");
            this.endEditRow(rowIndex);
            this.refreshRow(rowIndex)
           // $(target).datagrid("refreshRow", rowIndex);
            if (!notValidate) {

                this.trigger("onAfterEdit", rowIndex, row, _142);
            } else {
                this.trigger("onCancelEdit", rowIndex, row);

            }
        },

        endEditRow : function(rowIndex) {
            var target = this.element;
            var opts = $.data(target, "datagrid").options;
            var tr = opts.finder.getTr(target, rowIndex);
            tr.children("td").each(function() {
                var cell = $(this)
                    .find("div.datagrid-editable");
                if (cell.length) {
                    var ed = $.data(cell[0], "datagrid.editor");
                    if (ed.actions.destroy) {
                        ed.actions.destroy(ed.target);
                    }
                    cell.html(ed.oldHtml);
                    $.removeData(cell[0], "datagrid.editor");
                    cell.removeClass("datagrid-editable");
                    cell.css("width", "");
                }
            });
        },
        cancelEdit : function(rowIndex) {
            return this.endEdit(rowIndex, true);
        },
        getEditors : function(rowIndex) {
            var target = this.element;
            var opts = $.data(target, "datagrid").options;
            var tr = opts.finder.getTr(target, rowIndex);
            var _149 = [];
            tr.children("td").each(function() {
                var cell = $(this)
                    .find("div.datagrid-editable");
                if (cell.length) {
                    var ed = $.data(cell[0], "datagrid.editor");
                    _149.push(ed);
                }
            });
            return _149;
        },
        getEditor : function(editorInfo) {
            var _14d = this.getEditors(editorInfo.index != undefined
                ? editorInfo.index
                : editorInfo.id);
            for (var i = 0; i < _14d.length; i++) {
                if (_14d[i].field == editorInfo.field) {
                    return _14d[i];
                }
            }
            return null;
        },
        refreshRow : function(index) {
            var opts = $.data(this.element, "datagrid").options;
            opts.view.refreshRow.call(opts.view,  index);

        },
        validateRow : function(rowIndex) {
            var target = this.element;
            var tr = $.data(target, "datagrid").options.finder.getTr(
                target, rowIndex);
            if (!tr.hasClass("datagrid-row-editing")) {
                return true;
            }
          //  var vbox = tr.find(".validatebox-text");
           // vbox.validatebox("validate");
           // vbox.trigger("mouseleave");
           // var _15a = tr.find(".validatebox-invalid");
            return true;
        },
        updateRow : function(_1da) {

            var opts = $.data(this.element, "datagrid").options;
            opts.view.updateRow.call(opts.view, this, _1da.index,
                _1da.row);

        },
        appendRow : function(row) {
            var target = this.element;
            var data = $.data(target, "datagrid").data;
            var view = $.data(target, "datagrid").options.view;
            var _16d = $.data(target, "datagrid").insertedRows;
            view.insertRow.call(view, null, row);
            _16d.push(row);
            $(target).datagrid("getPager").pagination("refresh", {
                total : data.total
            });
        },
        insertRow : function(insertRow) {
            var target = this.element;
            var data = $.data(target, "datagrid").data;
            var view = $.data(target, "datagrid").options.view;
            var _16a = $.data(target, "datagrid").insertedRows;
            view.insertRow.call(view, insertRow.index, insertRow.row);
            _16a.push(insertRow.row);
            $(target).datagrid("getPager").pagination("refresh", {
                total : data.total
            });
        },
        deleteRow : function(_1dc) {
            var target = this.element;
            var _164 = $.data(target, "datagrid");
            var opts = _164.options;
            var data = _164.data;
            var _165 = _164.insertedRows;
            var _166 = _164.deletedRows;
            $(target).datagrid("cancelEdit", _163);
            var row = opts.finder.getRow.call(this, target, _163);
            if (findArrayIndex(_165, row) >= 0) {
                removeArrayMap(_165, row);
            } else {
                _166.push(row);
            }
            removeArrayMap(_164.selectedRows, opts.idField,
                row[opts.idField]);
            removeArrayMap(_164.checkedRows, opts.idField,
                row[opts.idField]);
            opts.view.deleteRow.call(opts.view, _163);
            if (opts.height == "auto") {
                this.fixRowHeight();
            }
            $(target).datagrid("getPager").pagination("refresh", {
                total : data.total
            });
        },
        getChanges : function(_15d) {
            var target = this.element;
            var _15e = $.data(target, "datagrid").insertedRows;
            var _15f = $.data(target, "datagrid").deletedRows;
            var _160 = $.data(target, "datagrid").updatedRows;
            if (!_15d) {
                var rows = [];
                rows = rows.concat(_15e);
                rows = rows.concat(_15f);
                rows = rows.concat(_160);
                return rows;
            } else {
                if (_15d == "inserted") {
                    return _15e;
                } else {
                    if (_15d == "deleted") {
                        return _15f;
                    } else {
                        if (_15d == "updated") {
                            return _160;
                        }
                    }
                }
            }
            return [];
        },
        acceptChanges : function() {
            var target = this.element;
            var data = $.data(target, "datagrid").data;
            var ok = true;
            for (var i = 0, len = data.rows.length; i < len; i++) {
                if (validateRow(i)) {
                    $(target).datagrid("endEdit", i);
                } else {
                    ok = false;
                }
            }
            if (ok) {
                clearEditData(target);
            }
        },
        rejectChanges : function(jq) {
            /*
					 * return jq.each(function() { _174(this); });
					 */
        },
        mergeCells : function(options) {
            var target = this.element;
            var opts = $.data(target, "datagrid").options;
            options.type = options.type || "body";
            options.rowspan = options.rowspan || 1;
            options.colspan = options.colspan || 1;
            if (options.rowspan == 1 && options.colspan == 1) {
                return;
            }
            var tr = opts.finder.getTr(target,
                (options.index != undefined
                    ? options.index
                    : options.id), options.type);
            if (!tr.length) {
                return;
            }
            var td = tr.find("td[field=\"" + options.field + "\"]");
            td.attr("rowspan", options.rowspan).attr("colspan",
                options.colspan);
            td.addClass("datagrid-td-merged");
            _18a(td.next(), options.colspan - 1);
            for (var i = 1; i < options.rowspan; i++) {
                tr = tr.next();
                if (!tr.length) {
                    break;
                }
                td = tr.find("td[field=\"" + options.field + "\"]");
                _18a(td, options.colspan);
            }
            this.setCellWidth();
            function _18a(td, _18b) {
                for (var i = 0; i < _18b; i++) {
                    td.hide();
                    td = td.next();
                }
            };
        },
        showColumn : function(field) {
            var panel = this.getPanel();
            panel.find("td[field=\"" + field + "\"]").show();
            this.getColumnOption(field).hidden = false;
            this.fitColumns(field)

        },
        hideColumn : function(field) {
            var panel = this.getPanel();
            panel.find("td[field=\"" + field + "\"]").hide();
            this.getColumnOption(field).hidden = true;
            this.fitColumns(field)

        },
        resize : function(size) {
            var target = this.element;
            var gridData = $.data(target, "datagrid");
            var opts = gridData.options;
            var panel = gridData.panel;
            if (size) {
                $.extend(opts, size);
            }
            if (opts.fit == true) {
                var p = panel.panel("panel").parent();
                opts.width = p.width();
                opts.height = p.height();
            }
            panel.panel("resize", opts);
        },
        checkAll : function() {
            var target = this.element;
            var gridData = $.data(target, "datagrid");
            var opts = gridData.options;
            var rows = opts.finder.getRows.call(this, target);
            if (!_12f && opts.selectOnCheck) {
                _117(target, true);
            }
            var dc = gridData.dc;
            var hck = dc.header1.add(dc.header2)
                .find("input[type=checkbox]");
            var bck = opts.finder
                .getTr(target, "", "allbody")
                .addClass("datagrid-row-checked")
                .find("div.datagrid-cell-check input[type=checkbox]");
            hck.add(bck).attr("checked", true);
            if (opts.idField) {
                for (var i = 0; i < rows.length; i++) {
                    addArrayMap(gridData.checkedRows, opts.idField,
                        rows[i]);
                }
            }
            this.trigger("onCheckAll", rows);

        },
        uncheckAll : function(_132) {
            var target = this.element;
            var gridData = $.data(target, "datagrid");
            var opts = gridData.options;
            var rows = opts.finder.getRows.call(this, target);
            if (!_132 && opts.selectOnCheck) {
                _10e(target, true);
            }
            var dc = gridData.dc;
            var hck = dc.header1.add(dc.header2)
                .find("input[type=checkbox]");
            var bck = opts.finder
                .getTr(target, "", "checked")
                .removeClass("datagrid-row-checked")
                .find("div.datagrid-cell-check input[type=checkbox]");
            hck.add(bck).attr("checked", false);
            if (opts.idField) {
                for (var i = 0; i < rows.length; i++) {
                    removeArrayMap(gridData.checkedRows, opts.idField,
                        rows[i][opts.idField]);
                }
            }
            this.trigger("onUncheckAll", rows);

        },
        sort : function(sortObj) {
            var target = this.element;
            var gridData = $.data(target, "datagrid");
            var opts = gridData.options;
            sortObj = sortObj || {};
            var newSortObj = {
                sortName : opts.sortName,
                sortOrder : opts.sortOrder
            };
            if (typeof sortObj == "object") {
                $.extend(newSortObj, sortObj);
            }
            var sortNames = [];
            var sortOrder = [];
            if (newSortObj.sortName) {
                sortNames = newSortObj.sortName.split(",");
                sortOrder = newSortObj.sortOrder.split(",");
            }
            if (typeof sortObj == "string") {
                var sortField = sortObj;
                var col = this.getColumnOption(sortField);
                if (!col.sortable || gridData.resizing) {
                    return;
                }
                var colOrder = col.colOrder || "asc";
                var pos = findArrayIndex(sortNames, sortField);
                if (pos >= 0) {
                    var sortOrder = sortOrder[pos] == "asc"
                        ? "desc"
                        : "asc";
                    if (opts.multiSort && sortOrder == colOrder) {
                        sortNames.splice(pos, 1);
                        sortOrder.splice(pos, 1);
                    } else {
                        sortOrder[pos] = sortOrder;
                    }
                } else {
                    if (opts.multiSort) {
                        sortNames.push(sortField);
                        sortOrder.push(colOrder);
                    } else {
                        sortNames = [sortField];
                        sortOrder = [colOrder];
                    }
                }
                newSortObj.sortName = sortNames.join(",");
                newSortObj.sortOrder = sortOrder.join(",");
            }
            if (this.trigger("onBeforeSortColumn", newSortObj.sortName,
                    newSortObj.sortOrder) == false) {
                return;
            }
            $.extend(opts, newSortObj);
            var dc = gridData.dc;
            var _97 = dc.header1.add(dc.header2);
            _97
                .find("div.datagrid-cell")
                .removeClass("datagrid-sort-asc datagrid-sort-desc");
            for (var i = 0; i < sortNames.length; i++) {
                var col = this.getColumnOption(sortNames[i]);
                _97.find("div." + col.cellClass)
                    .addClass("datagrid-sort-" + sortOrder[i]);
            }
            if (opts.remoteSort) {
                this.load();
            } else {
                this.loadData($(target).datagrid("getData"));
            }
            this.trigger("onSortColumn", opts.sortName, opts.sortOrder)

        },
        renderGridWarp : function() {
            var gridData = $.data(this.element, "datagrid");
            var panel = gridData.panel;
            var options = gridData.options;
            var dc = gridData.dc;
            var headers = dc.header1.add(dc.header2);
            var _self = this;
            headers.unbind(".datagrid");
            for (var key in options.headerEvents) {
                headers.bind(key + ".datagrid",
                    options.headerEvents[key]);
            }
            var headerTd = headers.find("div.datagrid-cell");
            var resizeHandle = options.resizeHandle == "right"
                ? "e"
                : (options.resizeHandle == "left" ? "w" : "e,w");
            headerTd.each(function() {
                $(this).resizable({
                    handles : resizeHandle,
                    disabled : ($(this).attr("resizable") ? $(this)
                        .attr("resizable") == "false" : false),
                    minWidth : 25,
                    start : function(e) {
                        gridData.resizing = true;
                        headers.css("cursor", $("body").css("cursor"));
                        if (!gridData.proxy) {
                            gridData.proxy = $("<div class=\"datagrid-resize-proxy\"></div>")
                                .appendTo(dc.view);
                        }
                        gridData.proxy.css({
                            left : e.pageX - $(panel).offset().left - 1,
                            display : "none"
                        });
                        setTimeout(function() {
                            if (gridData.proxy) {
                                gridData.proxy.show();
                            }
                        }, 500);
                    },
                    resize : function(e) {
                        gridData.proxy.css({
                            left : e.pageX - $(panel).offset().left - 1,
                            display : "block"
                        });
                        return false;
                    },
                    stop : function(e) {
                        headers.css("cursor", "");
                        $(this).css("height", "");
                        var field = $(this).parent().attr("field");
                        var col = _self.getColumnOption(field);
                        col.width = $(this)._outerWidth();
                        col.boxWidth = col.width - col.deltaWidth;
                        col.auto = undefined;
                        $(this).css("width", "");
                        _self.fixColumnSize(field);
                        gridData.proxy.remove();
                        gridData.proxy = null;
                        if ($(this)
                                .parents("div:first.datagrid-header")
                                .parent().hasClass("datagrid-view1")) {
                            _self.setViewSize();
                        }
                        _self.fitColumns();
                        _self.trigger("onResizeColumn", field,
                            col.width);

                        setTimeout(function() {
                            gridData.resizing = false;
                        }, 0);
                    }
                });
            });
            var bb = dc.body1.add(dc.body2);
            bb.unbind();
            for (var key in options.rowEvents) {
                bb.bind(key, options.rowEvents[key]);
            }
            dc.body1.bind("mousewheel DOMMouseScroll", function(e) {
                e.preventDefault();
                var e1 = e.originalEvent || window.event;
                var wheelDelta = e1.wheelDelta || e1.detail
                    * (-1);
                if ("deltaY" in e1) {
                    wheelDelta = e1.deltaY * -1;
                }
                var dg = $(e.target)
                    .closest("div.datagrid-view")
                    .children(".datagrid-f");
                var dc = dg.data("datagrid").dc;
                dc.body2.scrollTop(dc.body2.scrollTop()
                    - wheelDelta);
            });
            dc.body2.bind("scroll", function() {
                var b1 = dc.view1.children("div.datagrid-body");
                b1.scrollTop($(this).scrollTop());
                var c1 = dc.body1.children(":first");
                var c2 = dc.body2.children(":first");
                if (c1.length && c2.length) {
                    var _80 = c1.offset().top;
                    var _81 = c2.offset().top;
                    if (_80 != _81) {
                        b1.scrollTop(b1.scrollTop() + _80 - _81);
                    }
                }
                dc.view2
                    .children("div.datagrid-header,div.datagrid-footer")
                    ._scrollLeft($(this)._scrollLeft());
                dc.body2.children("table.datagrid-btable-frozen").css(
                    "left", -$(this)._scrollLeft());
            });
        },

        fixRowHeight : function(rowIndex, fixRowBody) {
            var target = this.element;
            var rows = $.data(target, "datagrid").data.rows;
            var opts = $.data(target, "datagrid").options;
            var dc = $.data(target, "datagrid").dc;
            if (!dc.body1.is(":empty")
                && (!opts.nowrap || opts.autoRowHeight || fixRowBody)) {
                if (rowIndex != undefined) {
                    var tr1 = opts.finder.getTr(target, rowIndex,
                        "body", 1);
                    var tr2 = opts.finder.getTr(target, rowIndex,
                        "body", 2);
                    setRowHeight(tr1, tr2);
                } else {
                    var tr1 = opts.finder
                        .getTr(target, 0, "allbody", 1);
                    var tr2 = opts.finder
                        .getTr(target, 0, "allbody", 2);
                    setRowHeight(tr1, tr2);
                    if (opts.showFooter) {
                        var tr1 = opts.finder.getTr(target, 0,
                            "allfooter", 1);
                        var tr2 = opts.finder.getTr(target, 0,
                            "allfooter", 2);
                        setRowHeight(tr1, tr2);
                    }
                }
            }
            this.setViewSize();
            if (opts.height == "auto") {
                var gridWarp = dc.body1.parent();
                var body2 = dc.body2;
                var body2Size = getBodySize(body2);
                var bodyHeight = body2Size.height;
                if (body2Size.width > body2.width()) {
                    bodyHeight += 18;
                }
                bodyHeight -= parseInt(body2.css("marginTop")) || 0;
                gridWarp.height(bodyHeight);
                body2.height(bodyHeight);
                dc.view.height(dc.view2.height());
            }
            dc.body2.triggerHandler("scroll");
            function setRowHeight(tr1, tr2) {
                for (var i = 0; i < tr2.length; i++) {
                    var tr1 = $(tr1[i]);
                    var tr2 = $(tr2[i]);
                    tr1.css("height", "");
                    tr2.css("height", "");
                    var height = Math.max(tr1.height(), tr2.height());
                    tr1.css("height", height);
                    tr2.css("height", height);
                }
            };
            function getBodySize(cc) {
                var width = 0;
                var height = 0;
                $(cc).children().each(function() {
                    var c = $(this);
                    if (c.is(":visible")) {
                        height += c._outerHeight();
                        if (width < c._outerWidth()) {
                            width = c._outerWidth();
                        }
                    }
                });
                return {
                    width : width,
                    height : height
                };
            };
        },

        getColumnOption : function(field) {
            function findCol(_cd) {
                if (_cd) {
                    for (var i = 0; i < _cd.length; i++) {
                        var cc = _cd[i];
                        for (var j = 0; j < cc.length; j++) {
                            var c = cc[j];
                            if (c.field == field) {
                                return c;
                            }
                        }
                    }
                }
                return null;
            };
            var gridData = $.data(this.element, "datagrid").options;
            var col = findCol(gridData.columns);
            if (!col) {
                col = findCol(gridData.frozenColumns);
            }
            return col;
        },

        setEditorWidth : function() {
            var target = this.element;
            var dc = $.data(target, "datagrid").dc;
            dc.view.find("div.datagrid-editable").each(function() {
                var _c8 = $(this);
                var _c9 = _c8.parent().attr("field");
                var col = $(target).datagrid("getColumnOption",
                    _c9);
                _c8._outerWidth(col.boxWidth + col.deltaWidth
                    - 1);
                var ed = $.data(this, "datagrid.editor");
                if (ed.actions.resize) {
                    ed.actions.resize(ed.target, _c8.width());
                }
            });
        },
        setCellWidth : function() {
            var target = this.element;
            var dc = $.data(target, "datagrid").dc;
            dc.view.find("td.datagrid-td-merged").each(function() {
                var td = $(this);
                var _c5 = td.attr("colspan") || 1;
                var col = this.getColumnOption(td.attr("field"));
                var cellWidth = col.boxWidth + col.deltaWidth - 1;
                for (var i = 1; i < _c5; i++) {
                    td = td.next();
                    col = this.getColumnOption(td.attr("field"));
                    cellWidth += col.boxWidth + col.deltaWidth;
                }
                $(this).children("div.datagrid-cell")
                    ._outerWidth(cellWidth);
            });
        },

        fixColumnSize : function(field) {
            var _self = this;
            var target = this.element;
            var gridData = $.data(target, "datagrid");
            var options = gridData.options;
            var dc = gridData.dc;
            var gridtable = dc.view
                .find("table.datagrid-btable,table.datagrid-ftable");
            gridtable.css("table-layout", "fixed");
            if (field) {
                fix(field);
            } else {
                var ff = _self.getColumnFields(true).concat(_self
                    .getColumnFields(false));
                for (var i = 0; i < ff.length; i++) {
                    fix(ff[i]);
                }
            }
            gridtable.css("table-layout", "auto");
            this.setCellWidth();
            this.fixRowHeight();
            this.setEditorWidth();
            function fix(field) {
                var col = _self.getColumnOption(field);
                if (col.cellClass) {
                    gridData.ss.set("." + col.cellClass, col.boxWidth
                        ? col.boxWidth + "px"
                        : "auto");
                }
            };
        },

        fitColumns : function() {
            var target = this.element;
            var gridData = $.data(target, "datagrid");
            var options = gridData.options;
            var dc = gridData.dc;
            var _self = this;
            var headers = dc.view2.children("div.datagrid-header");
            dc.body2.css("overflow-x", "");
            _9f();
            _a0();
            if (headers.width() >= headers.find("table").width()) {
                dc.body2.css("overflow-x", "hidden");
            }
            function _a0() {
                if (!options.fitColumns) {
                    return;
                }
                if (!gridData.leftWidth) {
                    gridData.leftWidth = 0;
                }
                var _a1 = 0;
                var cc = [];
                var _a2 = _self.getColumnFields(false);
                for (var i = 0; i < _a2.length; i++) {
                    var col = _self.getColumnOption(_a2[i]);
                    if (_a3(col)) {
                        _a1 += col.width;
                        cc.push({
                            field : col.field,
                            col : col,
                            addingWidth : 0
                        });
                    }
                }
                if (!_a1) {
                    return;
                }
                cc[cc.length - 1].addingWidth -= gridData.leftWidth;
                var _a4 = headers.children("div.datagrid-header-inner")
                    .show();
                var _a5 = headers.width()
                    - headers.find("table").width()
                    - options.scrollbarSize + gridData.leftWidth;
                var _a6 = _a5 / _a1;
                if (!options.showHeader) {
                    _a4.hide();
                }
                for (var i = 0; i < cc.length; i++) {
                    var c = cc[i];
                    var _a7 = parseInt(c.col.width * _a6);
                    c.addingWidth += _a7;
                    _a5 -= _a7;
                }
                cc[cc.length - 1].addingWidth += _a5;
                for (var i = 0; i < cc.length; i++) {
                    var c = cc[i];
                    if (c.col.boxWidth + c.addingWidth > 0) {
                        c.col.boxWidth += c.addingWidth;
                        c.col.width += c.addingWidth;
                    }
                }
                gridData.leftWidth = _a5;
                _self.fixColumnSize();
            };
            function _9f() {
                var _a8 = false;
                var _a9 = _self.getColumnFields(true).concat(_self
                    .getColumnFields(false));
                $.map(_a9, function(_aa) {
                    var col = _self.getColumnOption(_aa);
                    if (String(col.width || "").indexOf("%") >= 0) {
                        var _ab = $.fn.parseValue("width",
                            col.width, dc.view,
                            options.scrollbarSize)
                            - col.deltaWidth;
                        if (_ab > 0) {
                            col.boxWidth = _ab;
                            _a8 = true;
                        }
                    }
                });
                if (_a8) {
                    _bb(target);
                }
            };
            function _a3(col) {
                if (String(col.width || "").indexOf("%") >= 0) {
                    return false;
                }
                if (!col.hidden && !col.checkbox && !col.auto
                    && !col.fixed) {
                    return true;
                }
            };

        },
        getColumnFields : function(frozen) {
            var target = this.element;
            var gridData = $.data(target, "datagrid").options;
            var columns = (frozen == true)
                ? (gridData.frozenColumns || [[]])
                : gridData.columns;
            if (columns.length == 0) {
                return [];
            }
            var aa = [];
            var colspanCount = getColspanCount();
            for (var i = 0; i < columns.length; i++) {
                aa[i] = new Array(colspanCount);
            }
            for (var i = 0; i < columns.length; i++) {
                $.map(columns[i], function(col) {
                    var _d6 = getColumnIndex(aa[i]);
                    if (_d6 >= 0) {
                        var _d8 = col.field || "";
                        for (var c = 0; c < (col.colspan || 1); c++) {
                            for (var r = 0; r < (col.rowspan || 1); r++) {
                                aa[i + r][_d6] = _d8;
                            }
                            _d6++;
                        }
                    }
                });
            }
            return aa[aa.length - 1];
            function getColspanCount() {
                var colspanCount = 0;
                $.map(columns[0], function(col) {
                    colspanCount += col.colspan || 1;
                });
                return colspanCount;
            };
            function getColumnIndex(a) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i] == undefined) {
                        return i;
                    }
                }
                return -1;
            };
        },
        loadData : function(data) {
            var target = this.element;
            var _dc = $.data(target, "datagrid");
            var _dd = _dc.options;
            var dc = _dc.dc;
            data = _dd.loadFilter.call(target, data);
            data.total = parseInt(data.total);
            _dc.data = data;
            if (data.footer) {
                _dc.footer = data.footer;
            }
            if (!_dd.remoteSort && _dd.sortName) {
                var _de = _dd.sortName.split(",");
                var _df = _dd.sortOrder.split(",");
                data.rows.sort(function(r1, r2) {
                    var r = 0;
                    for (var i = 0; i < _de.length; i++) {
                        var sn = _de[i];
                        var so = _df[i];
                        var col = getColumnOption(target, sn);
                        var _e0 = col.sorter || function(a, b) {
                            return a == b
                                ? 0
                                : (a > b ? 1 : -1);
                        };
                        r = _e0(r1[sn], r2[sn])
                            * (so == "asc" ? 1 : -1);
                        if (r != 0) {
                            return r;
                        }
                    }
                    return r;
                });
            }
            if (_dd.view.onBeforeRender) {
                _dd.view.onBeforeRender.call(_dd.view, data.rows);
            }
            _dd.view.render.call(_dd.view, dc.body2, false);
            _dd.view.render.call(_dd.view, dc.body1, true);
            if (_dd.showFooter) {
                _dd.view.renderFooter.call(_dd.view, dc.footer2, false);
                _dd.view.renderFooter.call(_dd.view, dc.footer1, true);
            }
            if (_dd.view.onAfterRender) {
                _dd.view.onAfterRender.call(_dd.view, target);
            }
            _dc.ss.clean();
            var pager = this.getPager();
            if (pager.length) {
                var _e2 = pager.pagination("options");
                if (_e2.total != data.total) {
                    pager.pagination("refresh", {
                        total : data.total
                    });
                    if (_dd.pageNumber != _e2.pageNumber) {
                        _dd.pageNumber = _e2.pageNumber;
                        load(target);
                    }
                }
            }
            this.fixRowHeight();
            dc.body2.triggerHandler("scroll");
            this.setSelectionState();
            this.autoSizeColumn();
            // $(target).datagrid("setSelectionState");
            // $(target).datagrid("autoSizeColumn");
            this.trigger("onLoadSuccess", target, data)

        },
        load : function(queryParams) {
            var target = this.element;
            var _self = this;
            var opts = $.data(target, "datagrid").options;
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
            if (this.trigger("onBeforeLoad", target, params) == false) {
                return;
            }
            this.loading();
            setTimeout(function() {
                loadAfter();
            }, 0);
            function loadAfter() {
                var value = opts.loader.call(_self, params, function(
                    data) {
                    setTimeout(function() {
                        _self.loaded();
                    }, 0);
                    loadData(data);
                    setTimeout(function() {
                        clearEditData();
                    }, 0);
                }, function() {
                    setTimeout(function() {
                        _self.loaded();
                    }, 0);

                    _self.trigger("onLoadError", target,
                        arguments)

                });
                if (value == false) {
                    _self.loaded();;
                }
            };
        },
        clearEditData : function() {
            var target = this.element;
            var gridData = $.data(target, "datagrid");
            var data = gridData.data;
            var rows = data.rows;
            var originalRows = [];
            for (var i = 0; i < rows.length; i++) {
                originalRows.push($.extend({}, rows[i]));
            }
            gridData.originalRows = originalRows;
            gridData.updatedRows = [];
            gridData.insertedRows = [];
            gridData.deletedRows = [];

        },
        createStyleSheet : function() {
            var target = this.element;
            var _b = $.data(target, "datagrid");
            var _c = _b.options;
            var _d = _b.panel;
            var dc = _b.dc;
            var ss = null;
            if (_c.sharedStyleSheet) {
                ss = typeof _c.sharedStyleSheet == "boolean"
                    ? "head"
                    : _c.sharedStyleSheet;
            } else {
                ss = _d.closest("div.datagrid-view");
                if (!ss.length) {
                    ss = dc.view;
                }
            }
            var cc = $(ss);
            var _e = $.data(cc[0], "ss");
            if (!_e) {
                _e = $.data(cc[0], "ss", {
                    cache : {},
                    dirty : []
                });
            }
            return {
                add : function(_f) {
                    var ss = ["<style type=\"text/css\" appui=\"true\">"];
                    for (var i = 0; i < _f.length; i++) {
                        _e.cache[_f[i][0]] = {
                            width : _f[i][1]
                        };
                    }
                    var _10 = 0;
                    for (var s in _e.cache) {
                        var _11 = _e.cache[s];
                        _11.index = _10++;
                        ss.push(s + "{width:" + _11.width + "}");
                    }
                    ss.push("</style>");
                    $(ss.join("\n")).appendTo(cc);
                    cc.children("style[appui]:not(:last)").remove();
                },
                getRule : function(_12) {
                    var _13 = cc.children("style[appui]:last")[0];
                    var _14 = _13.styleSheet
                        ? _13.styleSheet
                        : (_13.sheet || document.styleSheets[document.styleSheets.length
                        - 1]);
                    var _15 = _14.cssRules || _14.rules;
                    return _15[_12];
                },
                set : function(_16, _17) {
                    var _18 = _e.cache[_16];
                    if (_18) {
                        _18.width = _17;
                        var _19 = this.getRule(_18.index);
                        if (_19) {
                            _19.style["width"] = _17;
                        }
                    }
                },
                remove : function(_1a) {
                    var tmp = [];
                    for (var s in _e.cache) {
                        if (s.indexOf(_1a) == -1) {
                            tmp.push([s, _e.cache[s].width]);
                        }
                    }
                    _e.cache = {};
                    this.add(tmp);
                },
                dirty : function(_1b) {
                    if (_1b) {
                        _e.dirty.push(_1b);
                    }
                },
                clean : function() {
                    for (var i = 0; i < _e.dirty.length; i++) {
                        this.remove(_e.dirty[i]);
                    }
                    _e.dirty = [];
                }
            };

        },
        render : function() {
            var wrapdata = $.data(this.element, "datagrid");
            var opts = wrapdata.options;
            var _self = this;
            var dc = wrapdata.dc;
            var gridPanel = wrapdata.panel;
            var gridEl = this.element;
            wrapdata.ss = this.createStyleSheet();
            gridPanel.panel($.extend({}, opts, {
                id : null,
                doSize : false,
                onResize : function(_5f, _60) {
                    setTimeout(function() {
                        if ($.data(gridEl, "datagrid")) {
                            _self.setViewSize();
                            _self.fitColumns();
                            _self
                                .trigger(
                                    "onResize",
                                    gridPanel,
                                    _5f, _60)
                        }
                    }, 0);
                },
                onExpand : function() {
                    fixRowHeight(gridEl);
                    _self.trigger("onExpand", gridPanel);
                }
            }));
            wrapdata.rowIdPrefix = "datagrid-row-r" + (++_1);
            wrapdata.cellClassPrefix = "datagrid-cell-c" + _1;
            createColumnHeader(dc.header1, opts.frozenColumns, true);
            createColumnHeader(dc.header2, opts.columns, false);
            createColumnCheckBox();
            dc.header1.add(dc.header2).css("display",
                opts.showHeader ? "block" : "none");
            dc.footer1.add(dc.footer2).css("display",
                opts.showFooter ? "block" : "none");
            if (opts.toolbar) {
                if ($.isArray(opts.toolbar)) {
                    $("div.datagrid-toolbar", gridPanel).remove();
                    var tb = $("<div class=\"datagrid-toolbar\"><table cellspacing=\"0\" cellpadding=\"0\"><tr></tr></table></div>")
                        .prependTo(gridPanel);
                    var tr = tb.find("tr");
                    for (var i = 0; i < opts.toolbar.length; i++) {
                        var btn = opts.toolbar[i];
                        if (btn == "-") {
                            $("<td><div class=\"datagrid-btn-separator\"></div></td>")
                                .appendTo(tr);
                        } else {
                            var td = $("<td></td>").appendTo(tr);
                            var btn = $("<a href=\"javascript:void(0)\"></a>")
                                .appendTo(td);
                            btn[0].onclick = eval(btn.handler
                                || function() {
                                });
                            btn.linkbutton($.extend({}, btn, {
                                plain : true
                            }));
                        }
                    }
                } else {
                    $(opts.toolbar).addClass("datagrid-toolbar")
                        .prependTo(gridPanel);
                    $(opts.toolbar).show();
                }
            } else {
                $("div.datagrid-toolbar", gridPanel).remove();
            }
            $("div.datagrid-pager", gridPanel).remove();
            if (opts.pagination) {
                var pagerDom = $("<div class=\"datagrid-pager\"></div>");
                if (opts.pagePosition == "bottom") {
                    pagerDom.appendTo(gridPanel);
                } else {
                    if (opts.pagePosition == "top") {
                        pagerDom.addClass("datagrid-pager-top")
                            .prependTo(gridPanel);
                    } else {
                        var pagertop = $("<div class=\"datagrid-pager datagrid-pager-top\"></div>")
                            .prependTo(gridPanel);
                        pagerDom.appendTo(gridPanel);
                        pagerDom = pagerDom.add(pagertop);
                    }
                }
                pagerDom.pagination({
                    total : (opts.pageNumber * opts.pageSize),
                    pageNumber : opts.pageNumber,
                    pageSize : opts.pageSize,
                    pageList : opts.pageList,
                    onSelectPage : function(pageNumber,
                                            pageSize) {
                        opts.pageNumber = pageNumber;
                        opts.pageSize = pageSize;
                        pagerDom.pagination("refresh", {
                            pageNumber : pageNumber,
                            pageSize : pageSize
                        });
                        load();
                    }
                });
                opts.pageSize = pagerDom.pagination("options").pageSize;
            }
            function createColumnHeader(headerDom, columns,
                                        isShowRownumbers) {
                if (!columns) {
                    return;
                }
                $(headerDom).show();
                $(headerDom).empty();
                var sortFields = [];
                var orderFields = [];
                if (opts.sortName) {
                    sortFields = opts.sortName.split(",");
                    orderFields = opts.sortOrder.split(",");
                }
                var t = $("<table class=\"datagrid-htable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody></tbody></table>")
                    .appendTo(headerDom);
                for (var i = 0; i < columns.length; i++) {
                    var tr = $("<tr class=\"datagrid-header-row\"></tr>")
                        .appendTo($("tbody", t));
                    var subCols = columns[i];
                    for (var j = 0; j < subCols.length; j++) {
                        var col = subCols[j];
                        var headerHtml = "";
                        if (col.rowspan) {
                            headerHtml += "rowspan=\"" + col.rowspan
                                + "\" ";
                        }
                        if (col.colspan) {
                            headerHtml += "colspan=\"" + col.colspan
                                + "\" ";
                        }
                        var td = $("<td " + headerHtml + "></td>")
                            .appendTo(tr);
                        if (col.checkbox) {
                            td.attr("field", col.field);
                            $("<div class=\"datagrid-header-check\"></div>")
                                .html("<input type=\"checkbox\"/>")
                                .appendTo(td);
                        } else {
                            if (col.field) {
                                td.attr("field", col.field);
                                td
                                    .append("<div class=\"datagrid-cell\"><span></span><span class=\"datagrid-sort-icon\"></span></div>");
                                $("span", td).html(col.title);
                                $("span.datagrid-sort-icon", td)
                                    .html("&nbsp;");
                                var headerCell = td
                                    .find("div.datagrid-cell");
                                var pos = findArrayIndex(sortFields,
                                    col.field);
                                if (pos >= 0) {
                                    headerCell
                                        .addClass("datagrid-sort-"
                                            + orderFields[pos]);
                                }
                                if (col.resizable == false) {
                                    headerCell.attr("resizable",
                                        "false");
                                }
                                if (col.width) {
                                    var colWidth = $.fn
                                        .parseValue("width",
                                            col.width, dc.view,
                                            opts.scrollbarSize);
                                    headerCell
                                        ._outerWidth(colWidth - 1);
                                    col.boxWidth = parseInt(headerCell[0].style.width);
                                    col.deltaWidth = colWidth
                                        - col.boxWidth;
                                } else {
                                    col.auto = true;
                                }
                                headerCell
                                    .css(
                                        "text-align",
                                        (col.halign
                                            || col.align || ""));
                                col.cellClass = wrapdata.cellClassPrefix
                                    + "-"
                                    + col.field.replace(/[\.|\s]/g,
                                        "-");
                                headerCell.addClass(col.cellClass).css(
                                    "width", "");
                            } else {
                                $("<div class=\"datagrid-cell-group\"></div>")
                                    .html(col.title).appendTo(td);
                            }
                        }
                        if (col.hidden) {
                            td.hide();
                        }
                    }
                }
                if (isShowRownumbers && opts.rownumbers) {
                    var td = $("<td rowspan=\""
                        + opts.frozenColumns.length
                        + "\"><div class=\"datagrid-header-rownumber\"></div></td>");
                    if ($("tr", t).length == 0) {
                        td
                            .wrap("<tr class=\"datagrid-header-row\"></tr>")
                            .parent().appendTo($("tbody", t));
                    } else {
                        td.prependTo($("tr:first", t));
                    }
                }
            };
            function createColumnCheckBox() {
                var checkBoxColumns = [];
                var columnFields = _self.getColumnFields(true)
                    .concat(_self.getColumnFields(gridEl));
                for (var i = 0; i < columnFields.length; i++) {
                    var col = _self.getColumnOption(columnFields[i]);
                    if (col && !col.checkbox) {
                        checkBoxColumns.push([
                            "." + col.cellClass,
                            col.boxWidth
                                ? col.boxWidth + "px"
                                : "auto"]);
                    }
                }
                wrapdata.ss.add(checkBoxColumns);
                wrapdata.ss.dirty(wrapdata.cellSelectorPrefix);
                wrapdata.cellSelectorPrefix = "."
                    + wrapdata.cellClassPrefix;
            };
        },
        wrapGrid : function(rownumbers) {
            var $this = $(this.element)
            function getColumns() {
                var frozenColumns = [];
                var columns = [];

                $this.children("thead").each(function() {
                    var opt = $this.parseOptions(this, [{
                        frozen : "boolean"
                    }]);
                    $(this).find("tr").each(function() {
                        var column = [];
                        $(this).find("th").each(function() {
                            var th = $(this);
                            var col = $.extend({}, th.parseOptions(
                                this, ["field", "align",
                                    "halign", "order",
                                    "width", {
                                        sortable : "boolean",
                                        checkbox : "boolean",
                                        resizable : "boolean",
                                        fixed : "boolean"
                                    }, {
                                        rowspan : "number",
                                        colspan : "number"
                                    }]), {
                                title : (th.html() || undefined),
                                hidden : (th.attr("hidden")
                                    ? true
                                    : undefined),
                                formatter : (th
                                    .attr("formatter")
                                    ? eval(th
                                        .attr("formatter"))
                                    : undefined),
                                styler : (th.attr("styler")
                                    ? eval(th
                                        .attr("styler"))
                                    : undefined),
                                sorter : (th.attr("sorter")
                                    ? eval(th
                                        .attr("sorter"))
                                    : undefined)
                            });
                            if (col.width
                                && String(col.width).indexOf("%") == -1) {
                                col.width = parseInt(col.width);
                            }
                            if (th.attr("editor")) {
                                var s = $.trim(th.attr("editor"));
                                if (s.substr(0, 1) == "{") {
                                    col.editor = eval("(" + s + ")");
                                } else {
                                    col.editor = s;
                                }
                            }
                            column.push(col);
                        });
                        opt.frozen
                            ? frozenColumns.push(column)
                            : columns.push(column);
                    });
                });
                return [frozenColumns, columns];
            };
            var wrap = $("<div class=\"datagrid-wrap\">"
                + "<div class=\"datagrid-view\">"
                + "<div class=\"datagrid-view1\">"
                + "<div class=\"datagrid-header\">"
                + "<div class=\"datagrid-header-inner\"></div>"
                + "</div>" + "<div class=\"datagrid-body\">"
                + "<div class=\"datagrid-body-inner\"></div>"
                + "</div>" + "<div class=\"datagrid-footer\">"
                + "<div class=\"datagrid-footer-inner\"></div>"
                + "</div>" + "</div>"
                + "<div class=\"datagrid-view2\">"
                + "<div class=\"datagrid-header\">"
                + "<div class=\"datagrid-header-inner\"></div>"
                + "</div>" + "<div class=\"datagrid-body\"></div>"
                + "<div class=\"datagrid-footer\">"
                + "<div class=\"datagrid-footer-inner\"></div>"
                + "</div>" + "</div>" + "</div>" + "</div>")
                .insertAfter($this);
            wrap.panel({
                doSize : false,
                cls : "datagrid"
            });
            $($this).addClass("datagrid-f").hide()
                .appendTo(wrap.children("div.datagrid-view"));
            var columns = getColumns();
            var gridViewWrap = wrap.children("div.datagrid-view");
            var gridViewWrap1 = gridViewWrap
                .children("div.datagrid-view1");
            var gridViewWrap2 = gridViewWrap
                .children("div.datagrid-view2");
            return {
                panel : wrap,
                frozenColumns : columns[0],
                columns : columns[1],
                dc : {
                    view : gridViewWrap,
                    view1 : gridViewWrap1,
                    view2 : gridViewWrap2,
                    header1 : gridViewWrap1
                        .children("div.datagrid-header")
                        .children("div.datagrid-header-inner"),
                    header2 : gridViewWrap2
                        .children("div.datagrid-header")
                        .children("div.datagrid-header-inner"),
                    body1 : gridViewWrap1.children("div.datagrid-body")
                        .children("div.datagrid-body-inner"),
                    body2 : gridViewWrap2.children("div.datagrid-body"),
                    footer1 : gridViewWrap1
                        .children("div.datagrid-footer")
                        .children("div.datagrid-footer-inner"),
                    footer2 : gridViewWrap2
                        .children("div.datagrid-footer")
                        .children("div.datagrid-footer-inner")
                }
            };

        }

    });

    var GridView = Widget.extend({
        initialize : function(datagrid) {
            this.grid = datagrid;
        },

        getStyleValue : function(css) {
            var _225 = "";
            var _226 = "";
            if (typeof css == "string") {
                _226 = css;
            } else {
                if (css) {
                    _225 = css["class"] || "";
                    _226 = css["style"] || "";
                }
            }
            return {
                c : _225,
                s : _226
            };
        },
        render : function(_1e9, _1ea) {
            var _1eb = $.data(this.grid.element, "datagrid");
            var opts = _1eb.options;
            var rows = _1eb.data.rows;
            var columnFields = this.grid.getColumnFields();
            if (_1ea) {
                if (!(opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length))) {
                    return;
                }
            }
            var dataTableHtml = ["<table class=\"datagrid-btable\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tbody>"];
            for (var i = 0; i < rows.length; i++) {
                var css = opts.rowStyler ? opts.rowStyler.call(
                    this.grid.element, i, rows[i]) : "";
                var _1ee = "";
                var _1ef = "";
                if (typeof css == "string") {
                    _1ef = css;
                } else {
                    if (css) {
                        _1ee = css["class"] || "";
                        _1ef = css["style"] || "";
                    }
                }
                var cls = "class=\"datagrid-row "
                    + (i % 2 && opts.striped
                        ? "datagrid-row-alt "
                        : " ") + _1ee + "\"";
                var _1f0 = _1ef ? "style=\"" + _1ef + "\"" : "";
                var _1f1 = _1eb.rowIdPrefix + "-" + (_1ea ? 1 : 2)
                    + "-" + i;
                dataTableHtml.push("<tr id=\"" + _1f1
                    + "\" datagrid-row-index=\"" + i + "\" " + cls
                    + " " + _1f0 + ">");
                dataTableHtml.push(this.renderRow.call(this,
                    columnFields, _1ea, i, rows[i]));
                dataTableHtml.push("</tr>");
            }
            dataTableHtml.push("</tbody></table>");
            $(_1e9).html(dataTableHtml.join(""));
        },
        renderFooter : function(_1f3, _1f4) {
            var opts = $.data(this.grid.element, "datagrid").options;
            var rows = $.data(this.grid.element, "datagrid").footer
                || [];
            var _1f5 = this.grid.getColumnFields(_1f4)
            var _1f6 = ["<table class=\"datagrid-ftable\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tbody>"];
            for (var i = 0; i < rows.length; i++) {
                _1f6
                    .push("<tr class=\"datagrid-row\" datagrid-row-index=\""
                        + i + "\">");
                _1f6.push(this.renderRow.call(this, _1f5, _1f4, i,
                    rows[i]));
                _1f6.push("</tr>");
            }
            _1f6.push("</tbody></table>");
            $(_1f3).html(_1f6.join(""));
        },
        renderRow : function(_1f8, _1f9, _1fa, _1fb) {
            var opts = $.data(this.grid.element, "datagrid").options;
            var cc = [];
            if (_1f9 && opts.rownumbers) {
                var _1fc = _1fa + 1;
                if (opts.pagination) {
                    _1fc += (opts.pageNumber - 1) * opts.pageSize;
                }
                cc
                    .push("<td class=\"datagrid-td-rownumber\"><div class=\"datagrid-cell-rownumber\">"
                        + _1fc + "</div></td>");
            }
            for (var i = 0; i < _1f8.length; i++) {
                var _1fd = _1f8[i];
                var col = this.grid.getColumnOption(_1fd);
                if (col) {
                    var _1fe = _1fb[_1fd];
                    var css = col.styler ? (col
                        .styler(_1fe, _1fb, _1fa) || "") : "";
                    var _1ff = "";
                    var _200 = "";
                    if (typeof css == "string") {
                        _200 = css;
                    } else {
                        if (css) {
                            _1ff = css["class"] || "";
                            _200 = css["style"] || "";
                        }
                    }
                    var cls = _1ff ? "class=\"" + _1ff + "\"" : "";
                    var _201 = col.hidden ? "style=\"display:none;"
                        + _200 + "\"" : (_200 ? "style=\"" + _200
                        + "\"" : "");
                    cc.push("<td field=\"" + _1fd + "\" " + cls + " "
                        + _201 + ">");
                    var _201 = "";
                    if (!col.checkbox) {
                        if (col.align) {
                            _201 += "text-align:" + col.align + ";";
                        }
                        if (!opts.nowrap) {
                            _201 += "white-space:normal;height:auto;";
                        } else {
                            if (opts.autoRowHeight) {
                                _201 += "height:auto;";
                            }
                        }
                    }
                    cc.push("<div style=\"" + _201 + "\" ");
                    cc.push(col.checkbox
                        ? "class=\"datagrid-cell-check\""
                        : "class=\"datagrid-cell " + col.cellClass
                        + "\"");
                    cc.push(">");
                    if (col.checkbox) {
                        cc.push("<input type=\"checkbox\" "
                            + (_1fb.checked
                                ? "checked=\"checked\""
                                : ""));
                        cc.push(" name=\"" + _1fd + "\" value=\""
                            + (_1fe != undefined ? _1fe : "")
                            + "\">");
                    } else {
                        if (col.formatter) {
                            cc.push(col.formatter(_1fe, _1fb, _1fa));
                        } else {
                            cc.push(_1fe);
                        }
                    }
                    cc.push("</div>");
                    cc.push("</td>");
                }
            }
            return cc.join("");
        },
        refreshRow : function(_202, _203) {
            this.updateRow.call(this, _202, _203, {});
        },
        updateRow : function(_204, _205, row) {
            var opts = $.data(this.grid.element, "datagrid").options;
            var rows = $(this.grid.element).datagrid("getRows");
            $.extend(rows[_205], row);
            var css = opts.rowStyler ? opts.rowStyler.call(
                this.grid.element, _205, rows[_205]) : "";
            var _206 = "";
            var _207 = "";
            if (typeof css == "string") {
                _207 = css;
            } else {
                if (css) {
                    _206 = css["class"] || "";
                    _207 = css["style"] || "";
                }
            }
            var _206 = "datagrid-row "
                + (_205 % 2 && opts.striped
                    ? "datagrid-row-alt "
                    : " ") + _206;
            function _208(_209) {
                var _20a = $(this.grid.element).datagrid(
                    "getColumnFields", _209);
                var tr = opts.finder.getTr(this.grid.element, _205,
                    "body", (_209 ? 1 : 2));
                var _20b = tr
                    .find("div.datagrid-cell-check input[type=checkbox]")
                    .is(":checked");
                tr.html(this.renderRow.call(this, this.grid.element,
                    _20a, _209, _205, rows[_205]));
                tr.attr("style", _207).attr(
                    "class",
                    tr.hasClass("datagrid-row-selected") ? _206
                        + " datagrid-row-selected" : _206);
                if (_20b) {
                    tr
                        .find("div.datagrid-cell-check input[type=checkbox]")
                        .attr("checked", true);
                }
            };
            _208.call(this, true);
            _208.call(this, false);
            this.grid.fixRowHeight(_205);
            // $(_204).datagrid("fixRowHeight", _205);
        },
        insertRow : function(_20d, row) {
            var _20e = $.data(this.grid.element, "datagrid");
            var opts = _20e.options;
            var dc = _20e.dc;
            var data = _20e.data;
            if (_20d == undefined || _20d == null) {
                _20d = data.rows.length;
            }
            if (_20d > data.rows.length) {
                _20d = data.rows.length;
            }
            function _20f(_210) {
                var _211 = _210 ? 1 : 2;
                for (var i = data.rows.length - 1; i >= _20d; i--) {
                    var tr = opts.finder.getTr(this.grid.element, i,
                        "body", _211);
                    tr.attr("datagrid-row-index", i + 1);
                    tr.attr("id", _20e.rowIdPrefix + "-" + _211 + "-"
                        + (i + 1));
                    if (_210 && opts.rownumbers) {
                        var _212 = i + 2;
                        if (opts.pagination) {
                            _212 += (opts.pageNumber - 1)
                                * opts.pageSize;
                        }
                        tr.find("div.datagrid-cell-rownumber")
                            .html(_212);
                    }
                    if (opts.striped) {
                        tr.removeClass("datagrid-row-alt")
                            .addClass((i + 1) % 2
                                ? "datagrid-row-alt"
                                : "");
                    }
                }
            };
            function _213(_214) {
                var _215 = _214 ? 1 : 2;
                var _216 = this.grid.getColumnFields(_214);
                var _217 = _20e.rowIdPrefix + "-" + _215 + "-" + _20d;
                var tr = "<tr id=\""
                    + _217
                    + "\" class=\"datagrid-row\" datagrid-row-index=\""
                    + _20d + "\"></tr>";
                if (_20d >= data.rows.length) {
                    if (data.rows.length) {
                        opts.finder.getTr(this.grid.element, "",
                            "last", _215).after(tr);
                    } else {
                        var cc = _214 ? dc.body1 : dc.body2;
                        cc
                            .html("<table cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tbody>"
                                + tr + "</tbody></table>");
                    }
                } else {
                    opts.finder.getTr(this.grid.element, _20d + 1,
                        "body", _215).before(tr);
                }
            };
            _20f.call(this, true);
            _20f.call(this, false);
            _213.call(this, true);
            _213.call(this, false);
            data.total += 1;
            data.rows.splice(_20d, 0, row);
            this.refreshRow.call(this, this.grid.element, _20d);
        },
        deleteRow : function(_218, _219) {
            var _21a = $.data(_218, "datagrid");
            var opts = _21a.options;
            var data = _21a.data;
            function _21b(_21c) {
                var _21d = _21c ? 1 : 2;
                for (var i = _219 + 1; i < data.rows.length; i++) {
                    var tr = opts.finder.getTr(_218, i, "body", _21d);
                    tr.attr("datagrid-row-index", i - 1);
                    tr.attr("id", _21a.rowIdPrefix + "-" + _21d + "-"
                        + (i - 1));
                    if (_21c && opts.rownumbers) {
                        var _21e = i;
                        if (opts.pagination) {
                            _21e += (opts.pageNumber - 1)
                                * opts.pageSize;
                        }
                        tr.find("div.datagrid-cell-rownumber")
                            .html(_21e);
                    }
                    if (opts.striped) {
                        tr.removeClass("datagrid-row-alt")
                            .addClass((i - 1) % 2
                                ? "datagrid-row-alt"
                                : "");
                    }
                }
            };
            opts.finder.getTr(_218, _219).remove();
            _21b.call(this, true);
            _21b.call(this, false);
            data.total -= 1;
            data.rows.splice(_219, 1);
        },
        onBeforeRender : function(_21f, rows) {
        },
        onAfterRender : function() {
            var opts = $.data(this.grid.element, "datagrid").options;
            if (opts.showFooter) {
                var _221 = this.grid.getPanel()
                    .find("div.datagrid-footer");
                _221
                    .find("div.datagrid-cell-rownumber,div.datagrid-cell-check")
                    .css("visibility", "hidden");
            }
        }
    })

    function createEditors(editorList) {
        var editors = {};
        $.map(editorList, function(name) {
            editors[name] = initEditor(name);
        });

        return editors;
        function initEditor(name) {
            function isA(editorDom) {
                return $.data($(editorDom)[0], name) != undefined;
            };
            return {
                init : function(dom, opt) {
                    var editorDom = $("<input type=\"text\" class=\"datagrid-editable-input\" width=\"100%\">")
                        .appendTo(dom);
                    if (editorDom[name] && name != "text") {
                        var t = editorDom[name](opt);
                        return editorDom;
                    } else {
                        return editorDom;
                    }
                },
                destroy : function(editorDom) {
                    if (isA(editorDom, name)) {
                        $(editorDom)[name]("destroy");
                    }
                },
                getValue : function(editorDom) {
                    if (isA(editorDom, name)) {
                        var opts = $(editorDom)[name]("options");
                        if (opts.multiple) {
                            return $(editorDom)[name]("getValues")
                                .join(opts.separator);
                        } else {
                            return $(editorDom)[name]("getValue");
                        }
                        return $(editorDom)[name]("getValue");
                    } else {
                        return $(editorDom).val();
                    }
                },
                setValue : function(editorDom, value) {
                    if (isA(editorDom, name)) {
                        var opts = $(editorDom)[name]("options");
                        if (opts.multiple) {
                            if (value) {
                                $(editorDom)[name]("setValues", value
                                    .split(opts.separator));
                            } else {
                                $(editorDom)[name]("clear");
                            }
                        } else {
                            $(editorDom)[name]("setValue", value);
                        }
                    } else {
                        $(editorDom).val(value);
                    }
                },
                resize : function(editorDom, size) {
                    if (isA(editorDom, name)) {
                        $(editorDom)[name]("resize", size);
                    } else {
                        $(editorDom)._outerWidth(size)._outerHeight(22);
                    }
                }
            };
        };
    };
    var editors = $.extend({}, createEditors(["text", "textbox",
        "number", "numberspinner", "combobox", "combotree",
        "combogrid", "datebox", "datetimebox",
        "timespinner", "datetimespinner"]), {
        textarea : {
            init : function(dom, opt) {
                var editorDom = $("<textarea class=\"datagrid-editable-input\"></textarea>")
                    .appendTo(dom);
                return editorDom;
            },
            getValue : function(editorDom) {
                return $(editorDom).val();
            },
            setValue : function(editorDom, value) {
                $(editorDom).val(value);
            },
            resize : function(editorDom, size) {
                $(editorDom)._outerWidth(size);
            }
        },
        checkbox : {
            init : function(dom, opt) {
                var editorDom = $("<input type=\"checkbox\">")
                    .appendTo(dom);
                if (opt){
                editorDom.val(opt.on);
                editorDom.attr("offval", opt.off);
                }
                return editorDom;
            },
            getValue : function(editorDom) {
                if ($(editorDom).is(":checked")) {
                    return $(editorDom).val();
                } else {
                    return $(editorDom).attr("offval");
                }
            },
            setValue : function(_1ab, _1ac) {
                var _1ad = false;
                // if ($(_1ab).val() == _1ac) {
                //     _1ad = true;
                // }
                $(_1ab).attr("checked", _1ac);
            }
        },
        validatebox : {
            init : function(_1ae, _1af) {
                var _1b0 = $("<input type=\"text\" class=\"datagrid-editable-input\">")
                    .appendTo(_1ae);
                _1b0.validatebox(_1af);
                return _1b0;
            },
            destroy : function(_1b1) {
                $(_1b1).validatebox("destroy");
            },
            getValue : function(_1b2) {
                return $(_1b2).val();
            },
            setValue : function(_1b3, _1b4) {
                $(_1b3).val(_1b4);
            },
            resize : function(_1b5, _1b6) {
                $(_1b5)._outerWidth(_1b6)._outerHeight(22);
            }
        },
        button : {
            init : function(_1ae, _1af) {

                var _1b0 = $('<a>[对象]</a>').appendTo(_1ae);
                _1b0.button(_1af);
                return _1b0;
            },
            destroy : function(_1b1) {
                // $(_1b1).validatebox("destroy");
            },
            getValue : function(_1b2, row, field) {
                return row[field];
            },
            setValue : function(_1b3, _1b4) {
                $(_1b3).val(_1b4);
            },
            resize : function(_1b5, _1b6) {
                $(_1b5)._outerWidth(_1b6)._outerHeight(22);
            }
        }
    });

    function getGridDom(t) {
        return $(t).closest("div.datagrid-view")
            .children(".datagrid-f")[0];
    }
    function getHeaderOverEvent(isOver) {
        return function(e) {
            var td = $(e.target).closest("td[field]");
            if (td.length) {
                var gridDom = getGridDom(td);
                if (!$(gridDom).data("datagrid").resizing && isOver) {
                    td.addClass("datagrid-header-over");
                } else {
                    td.removeClass("datagrid-header-over");
                }
            }
        };
    }

    function headerClickEvent(e) {
        var gridDom = getGridDom(e.target);
        var options = $(gridDom).datagrid("options");
        var ck = $(e.target).closest("input[type=checkbox]");
        if (ck.length) {
            if (options.singleSelect && options.selectOnCheck) {
                return false;
            }
            if (ck.is(":checked")) {
                $(gridDom).datagrid("checkAll");
            } else {
                $(gridDom).datagrid("uncheckAll");
            }
            e.stopPropagation();
        } else {
            var cell = $(e.target).closest(".datagrid-cell");
            if (cell.length) {
                var p1 = cell.offset().left + 5;
                var p2 = cell.offset().left + cell._outerWidth() - 5;
                if (e.pageX < p2 && e.pageX > p1) {
                    $(gridDom).datagrid("sort",
                        cell.parent().attr("field"));
                }
            }
        }
    }

    function headerDblclick(e) {
        var gridDom = getGridDom(e.target);
        var options = $(gridDom).datagrid("options");
        var cells = $(e.target).closest(".datagrid-cell");
        if (cells.length) {
            var p1 = cells.offset().left + 5;
            var p2 = cells.offset().left + cells._outerWidth() - 5;
            var resizeHandle = options.resizeHandle == "right"
                ? (e.pageX > p2)
                : (options.resizeHandle == "left"
                    ? (e.pageX < p1)
                    : (e.pageX < p1 || e.pageX > p2));
            if (resizeHandle) {
                var field = cells.parent().attr("field");
                var col = $(gridDom).datagrid("getColumnOption", field);
                if (col.resizable == false) {
                    return;
                }
                $(gridDom).datagrid("autoSizeColumn", field);
                col.auto = false;
            }
        }
    }

    function headerContextmenuEvent(e) {
        var gridDom = getGridDom(e.target);
        var options = $(gridDom).datagrid("options");
        var td = $(e.target).closest("td[field]");
        options.onHeaderContextMenu.call(gridDom, e, td.attr("field"));
    }

    function getGridRowDom(t, closetDom) {
        var tr = $(t).closest(closetDom || "tr.datagrid-row");
        if (tr.length && tr.parent().length) {
            return tr;
        } else {
            return undefined;
        }
    }

    function getRowIndex(tr) {
        if (tr.attr("datagrid-row-index")) {
            return parseInt(tr.attr("datagrid-row-index"));
        } else {
            return tr.attr("node-id");
        }
    }
    function getCellOverEvent(isOver) {
        return function(e) {
            var tr = getGridRowDom(e.target);
            if (!tr) {
                return;
            }
            var gridDom = getGridDom(tr);
            if ($.data(gridDom, "datagrid").resizing) {
                return;
            }
            var rowIndex = getRowIndex(tr);
            if (rowIndex) {
                rowOver(gridDom, rowIndex);
            } else {
                var options = $.data(gridDom, "datagrid").options;
                options.finder.getTr(gridDom, rowIndex)
                    .removeClass("datagrid-row-over");
            }
        };
    }
    function rowOver(gridDom, trDom) {
        var dataGridObj = $.data(gridDom, "datagrid");
        var opts = dataGridObj.options;
        opts.finder.getTr(gridDom, dataGridObj.highlightIndex)
            .removeClass("datagrid-row-over");
        opts.finder.getTr(gridDom, trDom).addClass("datagrid-row-over");
        dataGridObj.highlightIndex = trDom;
    }



    function bodyCellClickEvent(e) {
        var tr = getGridRowDom(e.target);
        if (!tr) {
            return;
        }
        var gridDom = getGridDom(tr);
        var options = $.data(gridDom, "datagrid").options;

        var dataGridClass = $.data(gridDom, "datagridObj");

        var rowIndex = getRowIndex(tr);
        var row = options.finder.getRow(rowIndex);

        var tt = $(e.target);

        var rowBtn = tt.closest("a.rowBtn");
        if (rowBtn.length>0){
            dataGridClass.operator[rowBtn.attr("id")].call(this,row)
            return;
        }
        if (tt.parent().hasClass("datagrid-cell-check")) {
            if (options.singleSelect && options.selectOnCheck) {
                tt.attr("checked", !tt.is(":checked"));
                dataGridClass.checkRow(rowIndex);

            } else {
                if (tt.is(":checked")) {
                    tt.attr("checked", false);
                    dataGridClass.checkRow(rowIndex);
                } else {
                    tt.attr("checked", true);
                    dataGridClass.uncheckRow(rowIndex);
                }
            }
        } else {
            var td = tt.closest("td[field]", tr);
            if (td.length) {
                var field = td.attr("field");
                dataGridClass.trigger("onClickCell", rowIndex, field,
                    row[field],row,e)
                // options.onClickCell.call(gridDom, rowIndex,
                // _a4,row[_a4]);
            }
            if (options.singleSelect == true) {
                dataGridClass.selectRow(rowIndex);
            } else {
                if (options.ctrlSelect) {
                    if (e.ctrlKey) {
                        if (tr.hasClass("datagrid-row-selected")) {

                            dataGridClass.unselectRow(rowIndex);
                            // $(gridDom).datagrid("unselectRow", );
                        } else {
                            dataGridClass.selectRow(rowIndex);
                            // $(gridDom).datagrid("selectRow",
                            // rowIndex);
                        }
                    } else {
                        if (e.shiftKey) {
                            $(gridDom).datagrid("clearSelections");
                            var _a7 = Math.min(
                                options.lastSelectedIndex || 0,
                                rowIndex);
                            var _a8 = Math.max(
                                options.lastSelectedIndex || 0,
                                rowIndex);
                            for (var i = _a7; i <= _a8; i++) {
                                _a5(gridDom, i);
                            }
                        } else {
                            $(gridDom).datagrid("clearSelections");
                            dataGridClass.selectRow(rowIndex);
                            options.lastSelectedIndex = rowIndex;
                        }
                    }
                } else {
                    if (tr.hasClass("datagrid-row-selected")) {
                        dataGridClass.unselectRow(rowIndex);
                    } else {
                        dataGridClass.selectRow(rowIndex);
                    }
                }
            }
            dataGridClass.trigger("onClickRow", getRowParam(gridDom, [
                rowIndex, row]))

        }
    }

    function bodyCellDbClickEvent(e) {
        var tr = getGridRowDom(e.target);
        if (!tr) {
            return;
        }
        var gridDom = getGridDom(tr);
        var options = $.data(gridDom, "datagrid").options;
        var dataGridClass = $.data(gridDom, "datagridObj");

        var rowIndex = getRowIndex(tr);
        var row = options.finder.getRow(rowIndex);
        var td = $(e.target).closest("td[field]", tr);
        if (td.length) {
            var _ad = td.attr("field");

            dataGridClass.trigger("onDblClickCell", rowIndex, _ad,
                row[_ad]);
            // options.onDblClickCell.call(gridDom, rowIndex, _ad,
            // row[_ad]);
        }
        dataGridClass.trigger("onDblClickRow", getRowParam(gridDom, [
            rowIndex, row]));
        // options.onDblClickRow.apply(gridDom, getRowParam(gridDom, [
        // rowIndex, row ]));
    }

    function bodyContextmenuEvent(e) {
        var tr = getGridRowDom(e.target);
        if (!tr) {
            tr = getGridRowDom(e.target, ".datagrid-body");
        }
        if (!tr){
            return ;
        }

        var gridDom = getGridDom(tr);
        var options = $.data(gridDom, "datagrid").options;
        var dataGridClass = $.data(gridDom, "datagridObj");
        var rowIndex = getRowIndex(tr);
        var row = options.finder.getRow(rowIndex);
        dataGridClass.trigger("onRowContextMenu", e, rowIndex, row);


    }
    function getRowParam(gridDom, params) {
        return $.data(gridDom, "treegrid") ? params.slice(1) : params;
    }

    DataGrid.defaults = $.extend({}, Opts.appDefaults.Pane, {
        sharedStyleSheet : false,
        // 和列（column）属性一样，但是这些列将被冻结在左边
        frozenColumns : undefined,
        // 设置为 true，则会自动扩大或缩小列的尺寸以适应网格的宽度并且防止水平滚动
        columns : undefined,
        // 设置为 true，则会自动扩大或缩小列的尺寸以适应网格的宽度并且防止水平滚动
        fitColumns : false,
        // 调整列的位置，可用的值有：'left'、'right'、'both'。当设置为
        // 'right'
        // 时，用户可通过拖拽列头部的右边缘来调整列。
        resizeHandle : "right",
        // 定义是否设置基于该行内容的行高度。设置为 false，则可以提高加载性能。
        autoRowHeight : true,
        // 数据网格（datagrid）面板的头部工具栏。可能的值：
        // 1、数组，每个工具选项与链接按钮（linkbutton）一样。
        // 2、选择器，只是工具栏。
        toolbar : null,
        striped : false,
        method : "post",
        nowrap : true,
        idField : null,
        url : null,
        data : null,
        loadMsg : "数据加载中 ...",
        rownumbers : false,
        singleSelect : false,
        ctrlSelect : false,
        selectOnCheck : true,
        checkOnSelect : true,
        pagination : false,
        pagePosition : "bottom",
        pageNumber : 1,
        pageSize : 10,
        pageList : [10, 20, 30, 40, 50],
        queryParams : {},
        sortName : null,
        sortOrder : "asc",
        multiSort : false,
        remoteSort : false,
        showHeader : true,
        showFooter : false,
        scrollbarSize : 18,
        rowStyler : function(rowIndex, rowData) {
        },
        headerEvents : {
            mouseover : getHeaderOverEvent(true),
            mouseout : getHeaderOverEvent(false),
            click : headerClickEvent,
            dblclick : headerDblclick,
            contextmenu : headerContextmenuEvent
        },
        rowEvents : {
            mouseover : getCellOverEvent(true),
            mouseout : getCellOverEvent(false),
            click : bodyCellClickEvent,
            dblclick : bodyCellDbClickEvent,
            contextmenu : bodyContextmenuEvent
        },
        loader : function(param, success, error) {

            var opts = this.options();
            if (!opts.url) {
                return false;
            }
            $.ajax({
                type : opts.method,
                url : opts.url,
                data : param,
                dataType : "json",
                success : function(data) {
                    success(data);
                },
                error : function() {
                    error.apply(this, arguments);
                }
            });
        },

        loadFilter : function(data) {
            if (typeof data.length == "number"
                && typeof data.splice == "function") {
                return {
                    total : data.length,
                    rows : data
                };
            } else {
                return data;
            }
        },
        editors : editors,
        finder : {
            getTr : function(_227, _228, type, _229) {
                type = type || "body";
                _229 = _229 || 0;
                var _22a = $.data(_227, "datagrid");
                var dc = _22a.dc;
                var opts = _22a.options;
                if (_229 == 0) {
                    var tr1 = opts.finder.getTr(_227, _228, type, 1);
                    var tr2 = opts.finder.getTr(_227, _228, type, 2);
                    return tr1.add(tr2);
                } else {
                    if (type == "body") {
                        var tr = $("#" + _22a.rowIdPrefix + "-" + _229
                            + "-" + _228);
                        if (!tr.length) {
                            tr = (_229 == 1 ? dc.body1 : dc.body2)
                                .find(">table>tbody>tr[datagrid-row-index="
                                    + _228 + "]");
                        }
                        return tr;
                    } else {
                        if (type == "footer") {
                            return (_229 == 1 ? dc.footer1 : dc.footer2)
                                .find(">table>tbody>tr[datagrid-row-index="
                                    + _228 + "]");
                        } else {
                            if (type == "selected") {
                                return (_229 == 1 ? dc.body1 : dc.body2)
                                    .find(">table>tbody>tr.datagrid-row-selected");
                            } else {
                                if (type == "highlight") {
                                    return (_229 == 1
                                        ? dc.body1
                                        : dc.body2)
                                        .find(">table>tbody>tr.datagrid-row-over");
                                } else {
                                    if (type == "checked") {
                                        return (_229 == 1
                                            ? dc.body1
                                            : dc.body2)
                                            .find(">table>tbody>tr.datagrid-row-checked");
                                    } else {
                                        if (type == "last") {
                                            return (_229 == 1
                                                ? dc.body1
                                                : dc.body2)
                                                .find(">table>tbody>tr[datagrid-row-index]:last");
                                        } else {
                                            if (type == "allbody") {
                                                return (_229 == 1
                                                    ? dc.body1
                                                    : dc.body2)
                                                    .find(">table>tbody>tr[datagrid-row-index]");
                                            } else {
                                                if (type == "allfooter") {
                                                    return (_229 == 1
                                                        ? dc.footer1
                                                        : dc.footer2)
                                                        .find(">table>tbody>tr[datagrid-row-index]");
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
                var _22c = (typeof p == "object") ? p
                    .attr("datagrid-row-index") : p;
                return $.data(this.element, "datagrid").data.rows[parseInt(_22c)];
            },
            getRows : function() {
                return $(this.element).datagrid("getRows");
            }
        },
        // view : dataView,
        onBeforeLoad : function(_22e) {
        },
        onLoadSuccess : function() {
        },
        onLoadError : function() {
        },
        onClickRow : function(_22f, _230) {
        },
        onDblClickRow : function(_231, _232) {
        },
        onClickCell : function(_233, _234, _235) {
        },
        onDblClickCell : function(_236, _237, _238) {
        },
        onBeforeSortColumn : function(sort, _239) {
        },
        onSortColumn : function(sort, _23a) {
        },
        onResizeColumn : function(_23b, _23c) {
        },
        onResize : function() {

        },
        onSelect : function(_23d, _23e) {
        },
        onUnselect : function(_23f, _240) {
        },
        onSelectAll : function(rows) {
        },
        onUnselectAll : function(rows) {
        },
        onCheck : function(_241, _242) {
        },
        onUncheck : function(_243, _244) {
        },
        onCheckAll : function(rows) {
        },
        onUncheckAll : function(rows) {
        },
        onBeforeEdit : function(_245, _246) {
        },
        onBeginEdit : function(_247, _248) {
        },
        onEndEdit : function(_249, _24a, _24b) {
        },
        onAfterEdit : function(_24c, _24d, _24e) {
        },
        onCancelEdit : function(_24f, _250) {
        },
        onHeaderContextMenu : function(e, _251) {
        },
        onRowContextMenu : function(e, _252, _253) {
        }
    });

    DataGrid.parseOptions = function(gridDom) {
        var t = $(gridDom);
        return $.extend({}, Panel.parseOptions(gridDom), t
            .parseOptions(gridDom, ["url", "toolbar",
                "idField", "sortName",
                "sortOrder", "pagePosition",
                "resizeHandle", {
                    sharedStyleSheet : "boolean",
                    fitColumns : "boolean",
                    autoRowHeight : "boolean",
                    striped : "boolean",
                    nowrap : "boolean"
                }, {
                    rownumbers : "boolean",
                    singleSelect : "boolean",
                    ctrlSelect : "boolean",
                    checkOnSelect : "boolean",
                    selectOnCheck : "boolean"
                }, {
                    pagination : "boolean",
                    pageSize : "number",
                    pageNumber : "number"
                }, {
                    multiSort : "boolean",
                    remoteSort : "boolean",
                    showHeader : "boolean",
                    showFooter : "boolean"
                }, {
                    scrollbarSize : "number"
                }]), {
            pageList : (t.attr("pageList") ? eval(t
                .attr("pageList")) : undefined),
            loadMsg : (t.attr("loadMsg") != undefined ? t
                .attr("loadMsg") : undefined),
            rowStyler : (t.attr("rowStyler") ? eval(t
                .attr("rowStyler")) : undefined)
        });
    }

    $.fn.datagrid = function(options, param) {
        // console.log(arguments)
        var methodReturn;

        options = options || {};
        $set = this.each(function() {
            var $this = $(this);
            var state = $.data(this, 'datagrid');
            var gridObj = $this.data('datagridObj');
            if (state) {
                if (typeof options === 'object') {
                    opts = $.extend(state.options, options);
                }
            } else {
                options.element = this;
                gridObj = new DataGrid(this, options);
                $this.data('datagridObj', gridObj);
                // data._init(this);
            }
            if (typeof options === 'string')
                methodReturn = gridObj[options](param);
        });
        return (methodReturn === undefined) ? $set : methodReturn;
    };
    DataGrid.GridView = GridView;
    return DataGrid;
});
