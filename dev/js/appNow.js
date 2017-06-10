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
        // fixme: different timezones causes events not to display at the correct intended timeline -000500-01-01
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


// add event listener
timeline.on('select', onSelect);

timeline.on('rangechanged', function (properties) {
    // console.log(timeline.getWindow());
});