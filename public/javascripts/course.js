$(function(){
    var courseNames = [];
    $.ajax({
            url: '/course/getCourses',
            type: 'GET',
            success: function(data){
                courseNames = data.map(function(data){
                    return data.name;
                });
            }
    });

    $("body").autoComplete({
        source: courseNames,
        appendTo: '#autoSearchResults'
    });




});