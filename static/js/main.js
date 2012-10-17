
var subscription
$(document).ready(function() {
    var tags = [];
    var highlights = [];

    if(localStorage) {
        if(localStorage.getItem('tags')) {
            tags = localStorage.getItem('tags').split(',');
        }
        if(localStorage.getItem('highlights')) {
            highlights = localStorage.getItem('highlights').split(',');
        }

        $('#tags').val(tags.join(','));
        $('#highlight').val(highlights.join(','));
    }

    subscription = new Subscription({ tags: tags });
    
    $('#highlight').select2({ tags: tags });

    $('#tags').select2({ tags:[] }).bind('change', function() {
        var tags = $(this).val().split(',');
        subscription.set({ tags: tags });
        if(localStorage) {
            localStorage.setItem('tags', tags);
        }
        $('#highlight').select2({ tags: tags });
    });

    $('#highlight').bind('change', function() {
        $('.event').each(function() {
            highlight(this);
        });
        if(localStorage) {
            localStorage.setItem('highlights', $(this).val().split(','));
        }
    });

    subscription.bind('event', newEvent);

    matches_generated = new EventGroup({
        tag: 'generated',
        label: '<%= count %> matches generated',
        detail: '<%= username %>'
    });

    matches_acknowledged = new EventGroup({
        tag: 'ack',
        label: '<%= count %> matches acknowledged by clients',
        detail: '<%= username %>'
    });

    matches_complete = new EventGroup({
        tag: 'complete',
        label: '<%= count %> matches completed by clients',
    });

    tournament_events = new NestedGroup({
        tag: 'tournament',
        label: 'Tournament',
    });

    round_group = new NestedGroup({
        label: 'Round <%= id %>'
    });

    round_group.get('groups').add([
        matches_generated,
        matches_acknowledged,
        matches_complete
    ]);

    round_iterator = new EventGroupIterator({
        key: 'round_num',
        template: round_group,
    });

    online_group = new EventGroup({
        tag: 'online',
        label: '<%= count %> online',
        detail: '<%= username %>'
    });

    tournament_group = new NestedGroup({
        label: 'Tournament <%= id %>'
    });

    tournament_group.get('groups').add([
        online_group,
        round_iterator
    ]);

    tournament_iterator = new EventGroupIterator({
        key: 'tournament_id',
        template: tournament_group,
    });

    runTests()
    tournament_iterator.add(event)
    tournament_iterator.add(event2)

})

var newEvent = function(event) {
    var eventEl = $('<div></div>').text(JSON.stringify(event));
    eventEl.addClass('event');
    eventEl.attr('tags', event.tags.join(','));
    $('#chart').prepend(eventEl)
    highlight(eventEl);
}

var highlight = function(event) {
    var eventTags = $(event).attr('tags').split(',');
    var highlightedTags = $('#highlight').val().split(',');

    $(event).removeClass('quiet').removeClass('loud');
    
    if(highlightedTags.length == 0) { 
        return;
    }

    // if none of the highlighted tags are present, add the 'quiet' class
    // if all of the highlighted tags are present, add the 'loud' class
    var loud = true, quiet = true;
    _.each(highlightedTags, function(tag) {
        if(!_.include(eventTags, tag)) {
            loud = false;
        } else {
            quiet = false;
        }
    });

    if(quiet) {
        $(event).addClass('quiet');
    } else if(loud) {
        $(event).addClass('loud');
    }
}