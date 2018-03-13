function searchCharacter(search_text){
    $.ajax({
        url: '/characters?search=' + search_text,
        type: 'get',
        success: function(result){
            console.log(search_text);
            $("html").html(result);
            document.getElementById('searchText').value = search_text;
        },
        error: function(data) {
            console.log(data);
        }
    })
};

function clearSearch(){
    $.ajax({
        url: '/characters',
        type: 'get',
        success: function(result){
            console.log("clear");
            document.getElementById('searchText').value = "";
            window.location.reload(true);
        }
    })
};