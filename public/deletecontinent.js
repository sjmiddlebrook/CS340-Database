function deleteContinent(id){
    $.ajax({
        url: '/continents/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};