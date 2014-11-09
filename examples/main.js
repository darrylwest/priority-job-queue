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
            div.innerHTML = 'local time is: ' + dt.toString().substr(16,8) + ', job queue size: ' + queue.getJobList().length;
        }

        callback( err, result );
    };

    return job;
};

var createRandomJob = function() {
    var job = queue.createJob();

    job.description = 'create and display a random number';

    job.fn = function(opts, callback) {
        var err,
            result,
            div = document.getElementById( 'random' );

        if (!div) {
            err = new Error('unable to locate random element by id...');
        } else {
            result = Math.random();
            div.innerHTML = 'random: ' + result;
        }

        job.canDelete = true;

        callback( err, result );
    };

    return job;
};

var createCleanQueue = function() {
    var job = queue.createJob();

    job.setPriority( JobModel.LOW_PRIORITY );
    job.setStatus( JobModel.IDLE );
    job.scheduledTime = new Date( Date.now() + 2000 );
    job.scheduledIdleTime = 15000;

    job.fn = function(opts, callback) {
        var list = queue.getJobList(),
            div = document.getElementById( 'clean' ),
            buf = [];

        buf.push('<br/>job list size: ' + list.length + ', remove:');

        list.forEach(function(item) {
            if (item.getStatus() === JobModel.COMPLETE && item.canDelete) {
                buf.push( '<br/>' + item.id );
                queue.remove( item );
            }
        });

        buf.push('<br/>job list size: ' + queue.getJobList().length);

        div.innerHTML = buf.join('');

        callback( null, list.length );
    };

    return job;
};

// TODO : create cleanup job to remove completed jobs
// create prime number job to calculate in blocks of 1000
// use one second ticker to create a new random job each 5 seconds

jobs = [ createClock, createRandomJob, createCleanQueue ];

if (window) {
    window.bootstrapApplication = function() {
        queue = PriorityJobQueue.createInstance();

        queue.startRealTimeTicker();

        jobs.forEach(function(item) {
            queue.add( item() )
        });

        window.queue = queue;

        queue.on( PriorityJobQueue.ONE_SECOND_TICK_EVENT, function() {
            var now = Date.now();
            // console.log( now, ' ', now % 3 );
            if (now % 2 === 0) {
                var job = createRandomJob();
                // console.log('create job: ', job);
                queue.add( job );
            }
        });
    };
}

