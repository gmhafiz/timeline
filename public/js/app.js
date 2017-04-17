
// DOM element where the Timeline will be attached
var container = document.getElementById('visualization');

// Create a DataSet (allows two way data-binding)




var items = new vis.DataSet(getAllEvents()
//     [
//     {id: 1, content: 'item 1', start: '2017-04-20'},
//     {id: 2, content: 'item 2', start: '2017-04-14'},
//     {id: 3, content: 'item 3', start: '2017-04-18'},
//     {id: 4, content: 'item 4', start: '2017-04-16', end: '2017-04-19'},
//     {id: 5, content: 'item 5', start: '2017-04-25'},
//     {id: 6, content: 'item 6', start: '2017-04-27'}
// ]

//     [{"id":4,"content":"t1","start":"2017-04-16","end":"2017-04-19","type":"","title":"","group":"","subgroup":"","style":"","createdAt":"2017-04-17T02:14:44.166869942+10:00","updatedAt":"2017-04-17T02:14:44.166869942+10:00"},{"id":5,"content":"t1","start":"2017-04-16","end":"2017-04-19","type":"","title":"","group":"","subgroup":"","style":"","createdAt":"2017-04-17T02:14:46.095823387+10:00","updatedAt":"2017-04-17T02:14:46.095823387+10:00"},{"id":6,"content":"t1sfaf","start":"2017-04-16","end":"2017-04-19","type":"","title":"","group":"","subgroup":"","style":"","createdAt":"2017-04-17T02:15:17.604591386+10:00","updatedAt":"2017-04-17T02:15:17.604591386+10:00"},{"id":7,"content":"t1","start":"2017-04-16","end":"2017-04-19","type":"","title":"","group":"","subgroup":"","style":"","createdAt":"2017-04-17T02:18:58.109212081+10:00","updatedAt":"2017-04-17T02:18:58.109212081+10:00"},{"id":8,"content":"t1","start":"2017-04-16","end":"2017-04-19","type":"","title":"","group":"","subgroup":"","style":"","createdAt":"2017-04-17T02:23:13.554703373+10:00","updatedAt":"2017-04-17T02:23:13.554703373+10:00"},{"id":9,"content":"t1","start":"2017-04-17","end":"2017-04-20","type":"","title":"","group":"","subgroup":"","style":"","createdAt":"2017-04-17T02:23:22.393150852+10:00","updatedAt":"2017-04-17T02:23:22.393150852+10:00"}]
);



// Configuration for the Timeline
var options = {
    width: '100%',
    height: '500px',
    selectable: true,
    editable: {
        add: true,
        updateTime: true,
        updateGroup: true,
        remove: true,
        overrideItems: false
    },

    onRemove: function(item, callback)  {
        prettyConfirm('Remove item', 'Do you really want to remove item ' + item.content + '?', function (ok) {
            if (ok) {
                callback(item);
                // todo: update db
                console.log("removed item id: " + item.id);
                deleteItemDB(item.id);
            } else {
                callback (null);
            }
        });
    }
};

// Create a Timeline
var timeline = new vis.Timeline(container, items, options);





jQuery(document).on('ready', function () {
    jQuery('form#addEvent').bind('submit', function (ev) {
        ev.preventDefault();
        var form = this;
        // todo: check if end is entered ? type=range : type=point

        var eventType = document.getElementsByName("type");
        console.log(eventType[0].value); // range
        console.log(eventType[1].value); // point

        var endDate = document.getElementById("endDate");
        console.log(endDate.value);

        if (endDate.value === '') {
            this.type = 'point';
            eventType[1].checked = true;
        } else {
            this.type = 'range';
            eventType[0].checked = true;
        }

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
                items.add(data);
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

                items.clear();
                items.add(data);
                timeline.redraw();
            },
            error: function (data) {
                console.log(data);
                console.log("error: " + jsonData);
            }
        })
    });
});

function ConvertFormToJSON(form){
    var array = jQuery(form).serializeArray();
    var json = {};

    jQuery.each(array, function() {
        json[this.name] = this.value || '';
    });

    return JSON.stringify(json);
}

function getAllEvents()  {
    var jsonData = {};
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/api/events",
        data: jsonData,
        dataType: "json",
        success: function (data) {

            items.clear();
            items.add(data);
            timeline.redraw();
        },
        error: function (data) {
            console.log(data);
            console.log("error: " + jsonData);
        }
    });

    return jsonData;
}

function deleteItemDB(id) {
    $.ajax({
        type: "DELETE",
        url: "http://localhost:8080/api/event/" + id,
        data: null,
        dataType: "json",
        contentType: "application/json",
        success: function() {
            console.log("Removed item :" + id);
        },
        error: function (data) {
            console.log("Unsuccessful removal of item " + id);
            console.log(data);
        }
    })
}

// todo: onBlur for end date label, switch the radio button type to be for range or point. adjust json data too?

function hideEndDateDiv() {
    var endDateDiv = document.getElementById("endDateDiv");
    var startDateLabel = document.getElementById("startDateLabel");
    endDateDiv.style.display = 'none';
    startDateLabel.innerHTML = 'Date';
}
function showEndDateDiv() {
    var endDateDiv = document.getElementById("endDateDiv");
    var startDateLabel = document.getElementById("startDateLabel");
    endDateDiv.style.display = 'block';
    startDateLabel.innerHTML = 'Start Date';
}
function checkPoint() {
    var eventType = document.getElementsByName("type");
    eventType[1].checked = true;
    hideEndDateDiv();
}

items.on('*', function (event, properties) {
    logEvent(event, properties);
});

function logEvent(event, properties) {
    var log = document.getElementById('log');
    var msg = document.createElement('div');
    msg.innerHTML = 'event=' + JSON.stringify(event) + ', ' +
        'properties=' + JSON.stringify(properties);
    log.firstChild ? log.insertBefore(msg, log.firstChild) : log.appendChild(msg);
}

function prettyConfirm(title, text, callback) {
    swal({
        title: title,
        text: text,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: "#DD6B55"
    }, callback);
}

function prettyPrompt(title, text, inputValue, callback) {
    swal({
        title: title,
        text: text,
        type: 'input',
        showCancelButton: true,
        inputValue: inputValue
    }, callback);
}