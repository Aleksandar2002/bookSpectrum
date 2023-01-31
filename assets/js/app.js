$(document).ready(function() {
    let data;
    $.ajax({
        type: "GET",
        url: "data.json",
        contentType: "application/json",
        dataType : 'json',
        error: function(error) {
            alert("Json file cannot be found!")
        },
        success: function (response) {
            console.log(response);    
        }
    });
})