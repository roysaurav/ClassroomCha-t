$(function(){
    // got this code snippet from
    // http://stackoverflow.com/questions/31337370/how-to-convert-seconds-to-hhmmss-in-moment-js
    // responsible for converting secdonds to nice hh: mm : ss format
    function pad(num) {
        return ("0"+num).slice(-2);
    }
    function hhmmss(secs) {
        var minutes = Math.floor(secs / 60);
        secs = secs%60;
        var hours = Math.floor(minutes/60)
        minutes = minutes%60;

        return pad(hours)+":"+pad(minutes)+":"+pad(secs);
    }
    function addCourse(info){
        $('.sectionInfo').click(function(){
            $('#myCourseSection').append('<div>'+info.course+' '+info.section'</div>');
        });
    }
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
                            if (section.code.substring(0,1)==='L'){
                                let day;
                                let startTime;
                                let endTime;
                                section.times.forEach(function(time){
                                    day = time.day;
                                    startTime = hhmmss(time.start);
                                    endTime = hhmmss(time.end);
                                });
                                $('#additionalInfo').append('<div class="sectionInfo">'+section.code+' - '+day+' '+startTime+':'+endTime+'</div>');
                                addCourse({course: whichCourse, section:section.code});
                            }
                        });

                    })

                }
                 });
            }, function(){

            });
        },
        close : function(){
            $('#additionalInfo').empty();
        }
    });






});