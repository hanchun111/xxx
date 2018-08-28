function $$(id) {
    return document.getElementById(id)
}

function replaceChildren(parent,child){
    while(parent.hasChildNodes())
        parent.removeChild(parent.firstChild)
    parent.appendChild(child)
}

function clearChildren(parent) {
    while(parent.hasChildNodes())
        parent.removeChild(parent.firstChild)
}

function setFormAttr(form,json) {
    if(json.action!=null)
        form.action=json.action
    if(json.method!=null)
        form.method=json.method
    if(json.name!=null)
        form.name=json.name
    if(json.id!=null)
        form.id=json.id
    if(json.enctype!=null)
        form.enctype=json.enctype

}

function createFormElm(json) {
    form=document.createElement("form")
    setFormAttr(form,json)
    return form
}



function setInputAttr(input,json) {
    if(json.id!=null)
        input.id=json.id
    if(json.name!=null)
        input.name=json.name
    if(json.type!=null)
        input.type=json.type
    if(json.value!=null)
        input.value=json.value
    if(json.style!=null)
        input.style=json.style
}

function createInputElm(json) {
    input=document.createElement("input")
    setInputAttr(input,json)
    return input
}

function appendTextNode(el,text) {
    textNd=document.createTextNode(text)
    el.appendChild(textNd)
}

function appendInput(form,json) {
    input=createInputElm(json)
    form.appendChild(input)
}
function appendBr(el) {
    br=document.createElement("br")
    el.appendChild(br)
}
function appendInputWithLabel(form,json){
    if(json.pre!=null)
        appendBr(form)
    if(json.label!=null)
        appendTextNode(form,json.label)
    if(json.mid!=null)
        appendBr(form)
    appendInput(form,json)
    if(json.aft!=null)
        appendBr(form)
}







