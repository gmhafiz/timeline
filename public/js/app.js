var baseURL = "http://localhost:8080/";
// var baseURL =  "https://www.gmhafiz.com/";

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
    height: '40vh',
    selectable: true,
    autoResize: true,
    editable: {
        add: true,
        updateTime: true,
        updateGroup: true,
        remove: true,
        overrideItems: false
    },

    onRemove: function (item, callback) {
        prettyConfirm('Remove item', 'Do you really want to remove item ' + item.content + '?', function (ok) {
            if (ok) {
                callback(item);
                // todo: update db
                console.log("removed item id: " + item.id);
                deleteItemDB(item.id);
            } else {
                callback(null);
            }
        });
    },

    onMove: function (item, callback) {
        // prettyConfirm('Move Item', 'Do you really want to move the item to\n' +
        // 'start: ' + item.start + '\n' +
        // 'end: ' + item.end + '?', function (ok) {
        //     if (ok) {
        callback(item);
        // todo: update db
        //     } else {
        //         callback(null);
        //     }
        // });
    },

    onAdd: function (item, callback) {
        prettyPrompt('Add item', 'Enter text content for new item:', item.content, function (value) {
            if (value) {
                item.content = value;
                // todo: add option for range of date
                // item.group = "\"" + item.group + "\"";
                // item.subgroup = "\"" + item.subgroup + "\"";
                addEvent(item);
                // callback(item); // send back adjusted new item
            }
            else {
                callback(null); // cancel item creation
            }
        });
    },

    onUpdate: function (item, callback) {
        // prettyPrompt('Update item', 'Edit items text:', item.content, function (value) {
        //     if (value) {
        //         item.content = value;
        //         callback(item); // send back adjusted item
        //     }
        //     else {
        //         callback(null); // cancel updating the item
        //     }
        // });
    }
};


// Individual's Name
var group = [
    {
        id: '0',
        content: '<div class="media"><img class="d-flex mr-3" src="images/100x100.png" width=100 height=100 alt=""><div class="media-body"><h5>NEL, Pieter</h5>Position : Director SMO<br />Payroll ID: 110334<br />FTE: 1.00</div></div>'
    },
    {
        id: '1',
        content: '<div class="media"><img class="d-flex mr-3" src="images/100x100.png" width=100 height=100 alt=""><div class="media-body"><h5>BOES Sabine</h5>Position : FACEM<br />Payroll ID: 326684<br />FTE: 1.00</div></div>'
    },
    {
        id: '2',
        content: '<div class="media"><img class="d-flex mr-3" src="images/100x100.png" width=100 height=100 alt=""><div class="media-body"><h5>WEARNE, Jack</h5>Position : FACEM<br />Payroll ID: 10.04.17-14.04.17<br />FTE: 0.30</div></div>'
    },
    {
        id: '3',
        content: 'Giles, Andre'
    },
    {
        id: '4',
        content: 'NG, Lesley'
    },
    {
        id: '5',
        content: 'Mahani, Abbas'
    },
    {
        id: '6',
        content: 'Thornton, Neale'
    }

];


var subGroup = [
    {
        id: '100',
        content: 'RL'
    },
    {
        id: '101',
        content: 'ADMIN'
    },
    {
        id: '102',
        content: 'MC'
    },
    {
        id: '103',
        content: 'PIT A'
    },
    {
        id: '104',
        content: 'PIT B'
    },
    {
        id: '105',
        content: 'Fast Track'
    },
    {
        id: '106',
        content: 'NC'
    }
];

// Create a Timeline
var timeline = new vis.Timeline(container, items, options);




jQuery(document).on('ready', function () {
    jQuery('form#addEvent').bind('submit', function (ev) {
        ev.preventDefault();
        var form = this;

        // Show / Hide range or point
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


        // Modify item content to reflect style
        // var styleUsed = form.className.value.toUpperCase();
        // console.log(styleUsed);

        // Add item content to be the shift name
        // var shiftName = form.shiftName.value;
        // form.content.value = shiftName.toUpperCase();

        // todo: based on shift name, automatically select time range


        var jsonData = ConvertFormToJSON(form);
        // var jsonData = ConvertFormToJSON(array);


        $.ajax({
            type: "POST",
            url: baseURL + "api/event",
            data: jsonData,
            dataType: "json",
            contentType: "application/json",
            success: function (data) {
                console.log(data);
                console.log(jsonData);
                items.add(data);
            },
            error: function (data) {
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
            url: baseURL + "api/events",
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


    // Search
    jQuery('form#searchEvents').bind('submit', function (ev) {
        ev.preventDefault();
        var jsonData = {};
        var searchString = document.getElementById("searchString").value;
        var searchResult = [];
        // var patt = /w3schools/i;
        $.ajax({
            type: "GET",
            url: baseURL + "api/events",
            data: jsonData,
            dataType: "json",
            success: function (data) {
                var payload = JSON.stringify(data);
                console.log(payload);

                searchResult = searchContent(data, searchString);
                console.log(searchResult);

                displayResult(searchResult);

            },

            error: function (data) {
                console.log(data);
                console.log("error: " + jsonData);
            }
        })
    });
});

/**
 *
 * @param data JSON object
 * @param searchString string
 * @returns {*} object
 */
function searchContent (data, searchString) {
    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        var arr = obj["content"];
        // for (var j = 0; j < arr.length; j++) {
            if (arr === searchString) {
                console.log(obj);
                return obj;
            }
            // if (arr[j] === searchString) {
            //     console.log(obj);
            //     return obj;
            // }
        // }
    }
}

/**
 *
 * @param searchResult One JSON object
 */
function displayResult(searchResult) {
    var searchResultDiv = document.getElementById("searchResult");
    var startDate = searchResult["start"];

    timeline.moveTo(startDate);
    searchResultDiv.innerHTML = JSON.stringify(searchResult);
}

function ConvertFormToJSON(form) {
    var array = jQuery(form).serializeArray();
    var json = {};

    jQuery.each(array, function () {
        json[this.name] = this.value || '';
    });

    return JSON.stringify(json);
}

function addEvent(itemObject) {
    delete itemObject.id;
    var jsonData = JSON.stringify(itemObject);

    $.ajax({
        type: "POST",
        url: baseURL + "api/event",
        data: jsonData,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            console.log(data);
            console.log(jsonData);
            items.add(data);
        },
        error: function (data) {
            console.log(data);
            console.log(jsonData);
        }

    });
}

function getAllEvents() {
    var jsonData = {};
    $.ajax({
        type: "GET",
        url: baseURL + "api/events",
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
        url: baseURL + "api/event/" + id,
        data: null,
        dataType: "json",
        contentType: "application/json",
        success: function () {
            console.log("Removed item :" + id);
        },
        error: function (data) {
            if (data.status !== 200) {
                // the api returns nothing after deletion. So we check if the return status is OK
                console.log("Unsuccessful removal of item " + id);
                console.log(data);
            }
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
    endDateDiv.style.display = '';
    startDateLabel.innerHTML = 'Start Date';
}
function checkPoint() {
    var endDateDiv = document.getElementById("endDateDiv");
    var endDate = document.getElementById("endDate");
    if (endDate.value === '') {
        var eventType = document.getElementsByName("type");
        eventType[1].checked = true;
        hideEndDateDiv();
    }
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

function generateImage() {
    html2canvas(document.getElementById("visualization"), {
        background: '#fff',
        onrendered: function (canvas) {
            // var img = canvas.toDataURL('image/jpeg');
            // $('#saveImage').attr('href', img);

            // document.body.appendChild(canvas);

            var a = document.createElement('a');
            a.href = canvas.toDataURL("image/png");
            a.download = 'timetable.png'; // todo: generate filename with week/date
            a.click(); // todo: preview first before another button to download
        }
    });

}
