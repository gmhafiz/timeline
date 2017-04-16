// DOM element where the Timeline will be attached
var container = document.getElementById('visualization');

// Create a DataSet (allows two way data-binding)
var items = new vis.DataSet([
    {id: 1, content: 'item 1', start: '2017-04-20'},
    {id: 2, content: 'item 2', start: '2017-04-14'},
    {id: 3, content: 'item 3', start: '2017-04-18'},
    {id: 4, content: 'item 4', start: '2017-04-16', end: '2017-04-19'},
    {id: 5, content: 'item 5', start: '2017-04-25'},
    {id: 6, content: 'item 6', start: '2017-04-27'}
]);

// Configuration for the Timeline
var options = {
    width: '100%',
    height: '500px'
};

// Create a Timeline
var timeline = new vis.Timeline(container, items, options);



function ConvertFormToJSON(form){
    var array = jQuery(form).serializeArray();
    var json = {};

    jQuery.each(array, function() {
        json[this.name] = this.value || '';
    });

    return JSON.stringify(json);
}

jQuery(document).on('ready', function () {
    jQuery('form#addEvent').bind('submit', function (ev) {
        ev.preventDefault();
        var form = this;
        var jsonData = ConvertFormToJSON(form);

        $.ajax({
            type: "POST",
            url: "http://localhost:8080/api/event",
            data: jsonData,
            dataType: "json",
            contentType: "application/json",
            success : function(data) {
                console.log(data);
                console.log(jsonData);
            },
            error : function (data) {
                console.log(data);
                console.log(jsonData);
            }

        });
        $('form#addEvent')[0].reset();
        return true;
    });


    jQuery('form#getAllEvents').bind('submit', function (ev) {
        ev.preventDefault();
        var jsonData = {};
        var payloadTextArea = document.getElementById("payload");
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/api/events",
            data: jsonData,
            dataType: "json",
            success: function (data) {
                var payload = JSON.stringify(data);
                console.log(payload);
                payloadTextArea.value = payload;
            },
            error: function (data) {
                console.log(data);
                console.log("error: " + jsonData);
            }
        })
    });
});