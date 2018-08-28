function enhanceSelect(selectId,baseParam,key,value,url,fill) {
    var selectObj=$$(selectId)
    var more=document.createElement("option")
    more.text="点击加载"
    selectObj.add(more,null)
    selectObj.onclick=function () {
        var cnt=selectObj.length
        //index of more is (selectModel.length-1)
        cnt--

        //if more not be selected
        if(selectObj.selectedIndex!=cnt){

            return
        }


        //remove the item<more> for append items
        selectObj.remove(cnt)
        param=baseParam()
        value++
        param.append(key,value)


        var _json={
            processData:false,
            contentType:false,
            url:url,
            data:param,
            type:"post",
            success:function (list) {
                //turn json to object
                // var list=eval("("+data+")")
                //no items to load already
                if(list.length==0){
                    //remove the listener
                    selectObj.onclick=null
                    //reset the selectedIndex to the last one
                    selectObj.selectedIndex=selectObj.length-1
                    //notify user
                    alert("没有更多了~")
                    return
                }
                //foreach
                for(var i=0;i<list.length;i++){
                    var item=document.createElement("option")
                    fill(item,list[i])
                    //add new items
                    selectObj.add(item,null)
                }

                //add the more
                selectObj.add(more,null)
                selectObj.selectedIndex=cnt
            },
            error:function (error) {
                alert("error")
            }
        }
        $.ajax(_json)
    }
}
