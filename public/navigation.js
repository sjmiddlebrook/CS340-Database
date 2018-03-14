var top_nav = document.getElementById("top-navigation");
var nav_list_items = top_nav.children;
var current_page = window.location.pathname.slice(1,-1);
if (current_page === "") {
    current_page = "home";
}
for (var i = 0; i < nav_list_items.length; i++) {
    var nav_item_name = nav_list_items[i].innerText.toLowerCase().trim();
    if (current_page === nav_item_name) {
        var class_list = nav_list_items[i].className.split(" ");
        if (class_list.indexOf("active") === -1) {
            nav_list_items[i].className += " active"
        }
    }
}

