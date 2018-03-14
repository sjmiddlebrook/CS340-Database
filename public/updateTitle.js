function updateTitle(id){
    $.ajax({
        url: '/titles/' + id,
        type: 'PUT',
        data: $('#update-title').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};