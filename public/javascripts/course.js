$(function(){

    $.ajax({
        url: '/courses/getcourses',
        type: 'GET',
        success: function(data){
            console.log(data);
        }
    });

});