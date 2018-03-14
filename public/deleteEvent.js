function deleteEvent(id){
    $.ajax({
        url: '/events/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};