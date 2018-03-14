function deleteKingdom(id){
    $.ajax({
        url: '/kingdoms/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};