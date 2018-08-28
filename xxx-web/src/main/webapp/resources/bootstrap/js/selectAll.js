function selectAll(loadBy, url, selectObj, msg, getItem){
    selectObj.empty()
    $.ajax({
        url:url,
        data:loadBy,
        type:"post",
        processData:false,
        contentType:false,
        success:function (data) {
            var l = data.length
            if(l == 0){
                //alert(msg)
                $("#modalTitle").text("ERROR!")
                $("#modalBody").text(msg)
                $("#modal").modal("show")
            }

            else for(var i=0; i<l; i++)
                selectObj.append(getItem(data[i]))
        }
    })

}