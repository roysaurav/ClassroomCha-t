$(function(){

    var response = $.ajax({
        url: 'https://cobalt.qas.im/api/1.0/courses?key=A7IzHY2bIqalKTYlmnuok3LIYTPpUTWV&limit=10',
        type: 'GET',
        crossDomain: true
    });

    console.log(response);

});