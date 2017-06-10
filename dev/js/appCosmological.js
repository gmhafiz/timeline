container = document.getElementById(visualizationId);
items = new vis.DataSet(getAllEvents());
options = {
    width: '100%',
    height: '50vh',
    selectable: true,
    autoResize: true,
    editable: {
        add: true,
        updateTime: true,
        updateGroup: true,
        remove: true,
        overrideItems: false
    },
    max: optionMax,
    min: optionMin,
    showCurrentTime: false,
    zoomMin: optionZoomMin,
    format: {// https://github.com/almende/vis/issues/307
        minorLabels: {
            year: 'Y'
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
                item.type = 'box'; // all events added by this is a point
                console.log(item.start);
                var year = moment(item.start, 'YYYY');
                year = moment().format('YYYY');
                item.start = year + "-01-01";
                if (item.end !== null) {
                    year = moment(item.end, 'YYYY');
                    year = moment().format('YYYY');
                    item.end = year + "-01-01";
                }

                console.log(year);
                console.log(item.start);
                addEvent(item);
                // callback(item); // send back adjusted new item
            }
            else {
                callback(null); // cancel item creation
            }
        });
    }
};
var timeline = new vis.Timeline(container, items, options);
timeline.setWindow("-000015-01-01", "-000001-12-31"); // re-render after loading. But gives some animations to user.


// add event listener
timeline.on('select', onSelect);

timeline.on('rangechanged', function (properties) {
    // console.log(timeline.getWindow());
});