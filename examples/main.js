// dpw@alameda.local
// 2014.11.08
'use strict';

var PriorityJobQueue = require('../lib/PriorityJobQueue'),
    JobModel = require('../lib/JobModel' ),
    queue,
    jobs;

var createClock = function() {
    var job = queue.createJob();

    job.scheduledIdleTime = 1000;
    job.fn = function(opts, callback) {
        var err,
            result,
            dt = new Date(),
            div = document.getElementById( 'clock' );

        if (!div) {
            err = new Error('unable to locate clock element by id...');
        } else {
            result = [ dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getTime() ];
            div.innerHTML = 'local time is: ' + dt.toString().substr(16,8);
        }

        callback( err, result );
    };

    return job;
};

jobs = [ createClock ];

if (window) {
    window.bootstrapApplication = function() {
        queue = PriorityJobQueue.createInstance();

        queue.startRealTimeTicker();

        jobs.forEach(function(item) {
            queue.add( item() )
        });

        window.queue = queue;
    };
}

