// function searchCharacter(search_text){
//     console.log("Seaching for character ".concat(search_text));
// }

function searchCharacter(search_text){
    $.ajax({
        url: '/characters?search=' + search_text,
        type: 'get',
        success: function(result){
            document.write(result);
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