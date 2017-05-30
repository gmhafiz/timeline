var baseURL = "http://localhost:8080/";
// var baseURL =  "https://www.gmhafiz.com/";

// from -1,000,000 to -100,000
var container = document.getElementById('visualizationA');
var items = new vis.DataSet(getAllEvents());
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
    max: "-000100-12-31",
    min: "-001000-01-01",
    showCurrentTime: false,
    zoomMin: 220752000000,
    format: {// https://github.com/almende/vis/issues/307
        minorLabels: {
            year: 'Y,SSS'
        },
        majorLabels: {
            // year: 'Y,SSS' // xxx,xxx years ago -200,000
        }
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
        // prettyConfirm('Move Item', 'Do you really want to move the item to\n' +
        // 'start: ' + item.start + '\n' +
        // 'end: ' + item.end + '?', function (ok) {
        //     if (ok) {
        callback(item);
        updateEvent(item);
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
var timeline = new vis.Timeline(container, items, options);

/**
 * Gets the current time range for the current window timeline. Used for Top Timeline Bar.
 */
timeline.on('rangechanged', function (properties) {
    console.log(timeline.getWindow());
});

/**
 * Always listening to events
 */
jQuery(document).on('ready', function () {
    /**
     * Actions when submit button for the name 'addEvent' is clicked.
     */
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
            url: baseURL + "api/ancientEvent",
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
            url: baseURL + "api/ancientEvents",
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
            url: baseURL + "api/ancientEvents",
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
});

/**
 * Search JSON objects for a string inside content field
 *
 * @param data: JSON object
 * @param searchString: string
 * @returns Array: of object(s)
 */
function searchContent (data, searchString) {
    var escaped = escapeRegex(searchString);
    var regexString = new RegExp(escaped, "gi");
    var result = [];

    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        var arr = obj["content"];
        // for (var j = 0; j < arr.length; j++) {
        //     if (arr === searchString) {
        if (regexString.test(arr)) {
            console.log(obj);
            result.push(obj);
            // return obj;
        }
        // if (arr[j] === searchString) {
        //     console.log(obj);
        //     return obj;
        // }
        // }
    }
    return result;
}

/**
 * Prints out html for one JSON object result
 *
 * @param searchResult One JSON object
 */
function displayResult(searchResult) {
    var searchResultDiv = document.getElementById("searchResult");
    var startDateIs = searchResult["start"];
    var startDateIsQuotes = "'"+startDateIs+"'"; // need to put single quote around this date for link to work

    // todo: format start date to a more human readable format
    // todo: check if string is longer than substring length ? put ... : don't put ...
    // https://stackoverflow.com/questions/1265887/call-javascript-function-on-hyperlink-click?rq=1
    searchResultDiv.insertAdjacentHTML('afterend', "<p>Date: "+ startDateIs +"<br />Event: <a href=javascript:moveWindow("+startDateIsQuotes+")>" + searchResult["content"].substring(0, 25) + "...</a></p>");
}

/**
 * Move vis window according to date
 *
 * @param startDate: a string surrounded by single quotes
 */
function moveWindow(startDate) {
    var moveToOptions = {
        animation: {
            duration: 500,
            easingFunction: "easeInOutQuad"
        }
    };
    timeline.moveTo(startDate, moveToOptions);
}

/**
 * Timeline  Navigation
 *
 * @param when: date to move which can be absolute or relative
 */
function gotoWhen(when) {
    var moveToOptions = {
        animation: {
            duration: 500,
            easingFunction: "easeInOutQuad"
        }
    };
    var currentWindowTime = timeline.getWindow();
    var start = currentWindowTime.start;
    var date = moment(start);
    var toAdd;
    var toSubtract;
    console.log(timeline.getWindow());
    if (when === 'today') {
        date = new Date();
    } else if (when === 'tenYearsB') {
        toSubtract = moment.duration(10, 'years');
        date.subtract(toSubtract);
    } else if (when === 'tenYearsF') {
        toAdd = moment.duration(10, 'years');
        date.add(toAdd);
    } else if (when === 'hundredYearsB') {
        toSubtract = moment.duration(100, 'years');
        date.subtract(toSubtract);
    } else if (when === 'hundredYearsF') {
        toAdd = moment.duration(100, 'years');
        date.add(toAdd);
    } else if (when === 'thousandYearsB') {
        toSubtract = moment.duration(1000, 'years');
        date.subtract(toSubtract);
    } else if (when === 'thousandYearsF') {
        toAdd = moment.duration(1000, 'years');
        date.add(toAdd);
    } else if (when === 'tenThousandYearsB') {
        toSubtract = moment.duration(10000, 'years');
        date.subtract(toSubtract);
    } else if (when === 'tenThousandYearsF') {
        toAdd = moment.duration(10000, 'years');
        date.add(toAdd);
    } else if (when === 'hundredThousandYearsB') {
        toSubtract = moment.duration(100000, 'years');
        date.subtract(toSubtract);
    } else if (when === 'hundredThousandYearsF') {
        toAdd = moment.duration(100000, 'years');
        date.add(toAdd);
    } else if (when === 'millionYearsB') {
        // fixme: million years not supported in momentjs/javascript/visjs?
        // https://stackoverflow.com/questions/8860297/can-you-create-dates-that-are-lower-than-271800-bc-like-dinosaur-time
        toSubtract = moment.duration(1000000, 'years');
        date.subtract(toSubtract);
        console.log(toSubtract);
    } else if (when === 'millionYearsF') {
        toAdd = moment.duration(1000000, 'years');
        date.add(toAdd);
        console.log(toAdd);
    }
    timeline.moveTo(date, moveToOptions);
}

/**
 * Serialize form data to JSON object and stringify
 *
 * @param form
 * @constructor
 */
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
        url: baseURL + "api/ancientEvent",
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

function updateEvent(itemObject) {
    var itemID = itemObject.id;
    var jsonData = JSON.stringify(itemObject);
    $.ajax({
        type: "PUT",
        url: baseURL + "api/ancientEvent/" + itemID,
        data: jsonData,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            console.log(data);
            console.log(jsonData);
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
        url: baseURL + "api/ancientEvents",
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
        url: baseURL + "api/ancientEvent/" + id,
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

/**
 * jQuery Date Time Picker
 *
 * http://xdsoft.net/jqplugins/datetimepicker/
 */
var dateTimePickerOptions = {
    format: 'Y-m-d',
    timepicker: false,
    allowBlack: false
};
jQuery('#startDate').datetimepicker(dateTimePickerOptions);
jQuery('#endDate').datetimepicker(dateTimePickerOptions);


/**
 * Log all visjs events
 */
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


/**
 * Pretty Prompts
 *
 * @param title
 * @param text
 * @param callback
 */
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

/**
 * Generate png file for the current visjs window
 */
function generateImage() {
    html2canvas(document.getElementById("visualizationA"), {
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

/**
 * Escape string for use in dynamically generated regex
 *
 * @param s
 *
 * https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
 */
function escapeRegex (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

