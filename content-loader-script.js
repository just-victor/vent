
function loadInnerContent() {
    const content = document.getElementById("content");
    fetch("https://just-victor.github.io/vent/inner-body.html")
        .then(resp => resp.text())
        .then(text => content.innerHTML = text)
        .then(() => afterLoad());
}