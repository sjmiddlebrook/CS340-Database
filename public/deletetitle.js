function deleteTitle(id){
    $.ajax({
        url: '/titles/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};