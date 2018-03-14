function updateContinent(id){
    $.ajax({
        url: '/continents/' + id,
        type: 'PUT',
        data: $('#update-continent').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};