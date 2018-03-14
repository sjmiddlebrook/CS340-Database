function deleteRelationship(id){
    $.ajax({
        url: '/relationships/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};