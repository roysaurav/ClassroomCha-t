$(function(){

    $('#addCourseButton').click(function(){
         $.ajax({
                url: "/course/getCourses?search='"+$("[name='courseSearch']").val()+"'",
                type: 'GET',
                success: function(data){
                    data.forEach(function(section){
                        $('#myCourseSection').append('<div>'+JSON.stringify(section)+'</div>');
                    })

                }
            });
    });

    $("[name='courseSearch']").autocomplete({

        source: function(request, response) {
            $.ajax({
                url: "/course/getCourses",
                type: 'GET',
                success: function(data){
                    response (data.map(function(data){
                        return data.name;
                    }));

                }
            });
        },
        autoFocus: true,
        minlength: 1,
        response: function(event, ui){
            event.preventDefault();

            ui.content = ui.content.filter(function(data){
                let length = $("[name='courseSearch']").val().length;
                return $("[name='courseSearch']").val().includes(data.value.toLowerCase().substring(0, length));
            });
        },
        open: function(event, ui){
            $('.ui-menu-item').hover(function(){
                $('#additionalInfo').empty();
                var whichCourse = $(this).find('.ui-menu-item-wrapper').text();
                $.ajax({
                url: "/course/getCourses?search='"+whichCourse+"'",
                type: 'GET',
                success: function(data){
                    data.forEach(function(sections){
                        sections['meeting_sections'].forEach(function(section){
                            $('#additionalInfo').append('<div>'+section.code+'</div>');
                        });

                    })

                }
                 });
            }, function(){
                $('#additionalInfo').empty();
            });
        },
        close : function(){
            $('#additionalInfo').empty();
        }
    });






});