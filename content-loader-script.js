
function loadInnerContent() {
    const content = document.getElementById("content");
    fetch("/vent/inner-body.html")
        .then(resp => resp.text())
        .then(text => content.innerHTML = text)
        .then(() => updateData());
}