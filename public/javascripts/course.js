$(function(){

    $.ajax({
        url: '/courses',
        type: 'GET',
        success: function(data){
            console.log(data);
        }
    })

});