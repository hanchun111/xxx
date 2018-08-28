define(['app/core/app-class', 'app/core/app-jquery', 
        'app/core/app-core'], function(Class, $, App) {

    'use strict';
    var cellBorderWidth = 1;
    /**
     * 网格扩展
     * 1、表格列根据内容自适应
     * 2、根据勾选自动计算 合计值
     */
    var GridExt = Class.create({
        _fitWordColumn: function(){
            if(this.setting.fitColumns != 'Content'){
                return;
            }
            var fontSize = this.$tableBodyMain.css('font-size')
                ,fieldColumns = this._fieldColumns;
            var fields = getFields(fieldColumns);
            for(var field in fields){
                var colTexts = this.$table.find('[field=' + field + ']');
                colTexts.each(function(){
                    var text = $(this).text();
                    if(text){
                        var width = getWidth(text, fontSize);
                        if(width > fields[field]){
                            fields[field] = width;
                        }
                    }
                });
            }
            for(var field in fields){
                var $td = this.$tableHeader.find('td[field="' + field + '"]')
                    ,oriWidth = $td.outerWidth()
                    ,diff = fields[field] - oriWidth + 20;
                var cid = $td.attr('_cid');
                var tdWidth = $td.outerWidth() - cellBorderWidth + diff;
                this.$table.find('td[_cid=' + cid + ']>div:not(.app-wrapper)').css('width', tdWidth);
                this._column[cid].width = tdWidth;
            }
            this._resetViewWidth();
            this._footerFollow();
            this._fixHeight();
            fullBlankWidth(this);
            function fullBlankWidth(context){
                var freeWidth = context.$tableHeaderMain.width() - context.$tableHeaderMain.find('>div>table').width();
                if(freeWidth > 0){
                    var $lastTd = context._getLast$Td();
                    var cid = $lastTd.attr('_cid');
                    var tdWidth = $lastTd.outerWidth() - cellBorderWidth + freeWidth;
                    context.$table.find('td[_cid=' + cid + ']>div:not(.app-wrapper)').css('width', tdWidth);
                    context._column[cid].width = tdWidth;
                    var lastWidth = $lastTd.data('freeWidth');
                    if(lastWidth != undefined){
                        freeWidth = freeWidth + lastWidth
                    }
                    $lastTd.data('freeWidth', freeWidth);
                }
            }
            function getFields(fcs){
                var result = {};
                for(var field in fcs){
                    var col = fcs[field];
                    if(!col.sysCol && !col.hidden){
                        result[field] = 0;
                    }
                }
                return result;
            }
            function getWidth(str, fontSize){
                var $t = $('<div style="font-size:' + fontSize + ';display: none;">' + str + '</div>');
                $t.appendTo('body');
                var result = $t.width();
                $t.remove();
                return result;
            }
        },
        _onCheckSummary: function(){
            if(!this.setting.checkSummary){
                return;
            }
            this.$tableHeaderLeft.on('click.grid.api', 'td[field="_rownumbers"]', $.proxy(this._checkSummary, this));
            this.$tableHeaderLeft.on('click.grid.api', 'td[field="_checkbox"]', $.proxy(this._checkSummary, this));
            this.$tableHeaderLeft.on('click.grid.api', 'td[field="_checkbox"] input', $.proxy(this._checkSummary, this));
            this.$tableBodyLeft.on('click.grid.api', 'td[field="_checkbox"]', $.proxy(this._checkSummary, this));
            this.$tableBodyLeft.on('click.grid.api', 'td[field="_checkbox"] input', $.proxy(this._checkSummary, this));
            this.$tableBody.on('click.grid-row-check.api', 'tr.data-row td', $.proxy(this._checkSummary, this));
        },
        _checkSummary: function(){
            var rows = this.getSelections();
            if(rows.length == 0){
                rows = this.getRows();
            }
           	this.summaryRow = this._summary(rows);
            if(!$.isEmptyObject(this.summaryRow)){
                replaceFooter(this, this.summaryRow);
            }
        },
        resetSummary: function(){
             if(this.setting.checkSummary){
                this._checkSummary();
            }else{
               	this.summaryRow = this._summary(this.getRows());
                if(!$.isEmptyObject(this.summaryRow)){
                     replaceFooter(this, this.summaryRow);
                }
            }
        }
    });
    function replaceFooter(context, footer){
    	 context._setFooterRows(footer);
    	 for(var field in footer){
    	 	var col = context._fieldColumns[field];
    	 	if(col){
	    	 	var text = context._getFormatText(col, footer);
		    	context.$tableFooter.find('td[field="' + field + '"]>div').text(text);
    	 	}
    	 }
    }
    return GridExt;
});