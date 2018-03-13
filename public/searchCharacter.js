function searchCharacter(search_text){
    $.ajax({
        url: '/characters?search=' + search_text,
        type: 'get',
        success: function(result){
            $("html").html(result);
            document.getElementById('searchText').value = search_text;
        }
    })
};

function clearSearch(){
    $.ajax({
        url: '/characters',
        type: 'get',
        success: function(result){
            document.getElementById('searchText').value = "";
            window.location.reload(true);
        }
    })
};