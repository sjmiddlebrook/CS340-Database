function updateKingdom(id){
    $.ajax({
        url: '/kingdoms/' + id,
        type: 'PUT',
        data: $('#update-kingdom').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};