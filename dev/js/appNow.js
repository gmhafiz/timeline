container = document.getElementById(visualizationId);
items = new vis.DataSet(getAllEvents());
options = {
    width: '100%',
    height: '50vh',
    selectable: true,
    autoResize: true,
    min: optionMin,
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
                console.log("removed item id: " + item.id);
                deleteItemDB(item.id);
            } else {
                callback(null);
            }
        });
    },

    onMove: function (item, callback) {
        console.log(item);
        var start = item.start;
        start = moment(start);
        start.add(moment.duration(1, 'days'));
        start.subtract(moment.duration(11, 'months'));
        start.subtract(moment.duration(30, 'days'));
        start.add(moment.duration(1, 'years'));
        start = moment(start).toISOString();
        item.start = start;

        callback(item);
        updateEvent(item);
    },

    onAdd: function (item, callback) {
        prettyPrompt('Add item', 'Enter text content for new item:', item.content, function (value) {
            if (value) {
                item.content = value;
                // todo: add option for range of date
                // item.group = "\"" + item.group + "\"";
                // item.subgroup = "\"" + item.subgroup + "\"";
                item.type = 'point'; // all events added by this is a point
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

// Create a Timeline
var timeline = new vis.Timeline(container, items, options);


/**
 * ==========================
 * Always listening to events
 * ==========================

jQuery(document).on('ready', function () {
    /**
     * Actions when submit button for the name 'addEvent' is clicked.

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

        var jsonData = ConvertFormToJSON(form);

        $.ajax({
            type: "POST",
            url: baseURL + "api/" + era + "Event",
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
            url: baseURL + "api/" + era + "Events",
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

    jQuery('form#searchEvents').bind('submit', function (ev) {
        ev.preventDefault();
        var jsonData = {};
        var searchString = document.getElementById("searchString").value;
        var searchResult = [];
        $.ajax({
            type: "GET",
            url: baseURL + "api/" + era + "Events",
            data: jsonData,
            dataType: "json",
            success: function (data) {
                var payload = JSON.stringify(data);
                console.log(payload);

                searchResult = searchContent(data, searchString);
                console.log(searchResult);
                for (var i = 0; i < searchResult.length; i++) {
                    displayResult(searchResult[i]);
                }

            },

            error: function (data) {
                console.log(data);
                console.log("error: " + jsonData);
            }
        })
    });

    jQuery('form#modifyEvent').bind('submit', function (ev) {
        ev.preventDefault();
        var form = this;
        // var itemId = form[5].value;
        var itemId = document.getElementById("itemIdS").value;

        // del form[5];
        var jsonData = ConvertFormToJSON(form);

        console.log(jsonData);
        console.log(itemId);

        $.ajax({
            type: "PUT",
            url: baseURL + "api/" + era + "Event/" + itemId,
            data: jsonData,
            dataType: "json",
            contentType: "application/json",
            success: function (data) {
                console.log(data);
                console.log(jsonData);
                // items.clear();
                items.add(data);
                timeline.redraw();
            },
            error: function (data) {
                console.log(data);
                console.log(jsonData);
            }

        });
    });

});

function addEvent(itemObject) {
    delete itemObject.id;
    var jsonData = JSON.stringify(itemObject);

    $.ajax({
        type: "POST",
        url: baseURL + "api/" + era + "Event",
        data: jsonData,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            console.log(data);
            console.log(jsonData);
            items.clear();
            items.add(data);
            timeline.redraw();
        },
        error: function (data) {
            console.log(data);
            console.log(jsonData);
        }
    });
}

function updateEvent(itemObject) {
    var itemID = itemObject.id;
    var jsonData = JSON.stringify(itemObject);
    $.ajax({
        type: "PUT",
        url: baseURL + "api/" + era + "Event/" + itemID,
        data: jsonData,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            console.log(data);
            console.log(jsonData);
            items.clear();
            items.add(data);
            timeline.redraw();
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
        url: baseURL + "api/" + era + "Events",
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

function getEvent(id) {
    var jsonData = {};
    $.ajax({
        type: "GET",
        url: baseURL + "api/" + era + "Event/" + id,
        data: jsonData,
        dataType: "json",
        success: function (data) {
            console.log("Returning: " + data);
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
        url: baseURL + "api/" + era + "Event/" + id,
        data: null,
        dataType: "json",
        contentType: "application/json",
        success: function () {
            console.log("Removed item :" + id);
            timeline.redraw();
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

function searchEvents () {
        var jsonData = {};
        var searchString = document.getElementById("searchString").value;
        var searchResult = [];
        $.ajax({
            type: "GET",
            url: baseURL + "api/" + era + "Events",
            data: jsonData,
            dataType: "json",
            success: function (data) {
                var payload = JSON.stringify(data);
                console.log(payload);

                searchResult = searchContent(data, searchString);
                console.log(searchResult);
                for (var i = 0; i < searchResult.length; i++) {
                    displayResult(searchResult[i]);
                }

            },
            error: function (data) {
                console.log(data);
                console.log("error: " + jsonData);
            }
        })
}
*/

// add event listener
timeline.on('select', onSelect);

timeline.on('rangechanged', function (properties) {
    // console.log(timeline.getWindow());
});