function updateRelationship(id){
    $.ajax({
        url: '/relationships/' + id,
        type: 'PUT',
        data: $('#update-relationship').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};