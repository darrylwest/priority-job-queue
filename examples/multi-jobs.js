#!/usr/bin/env node

// dpw@alameda.local
// 2014.11.07
'use strict';

var PriorityJobQueue = require('../index').PriorityJobQueue,
    JobModel = require('../index').models.JobModel,
    dash = require('lodash'),
    log = require('simple-node-logger').createSimpleLogger(),
    queue = new PriorityJobQueue( { log:log } ),
    loops = 10;

log.info('queue created');

queue.on( PriorityJobQueue.JOB_ADDED_EVENT, function(obj) {
    log.info('job added event: ', obj);
});

// standard runner with opts and callback; params has a timeout value
var runner = function(opts, callback) {
    setTimeout(function() {
        callback( null, 'ok' );
    }, opts.timeout );
};

var createStopJob = function() {
    var job = queue.createJob({
        description:'stop the queue',
        priority:99
    });

    job.fn = function(opts, callback) {
        dash.defer(function() {
            log.info("StopJob: stop the read time ticker to kill the queue...");
            queue.stopRealTimeTicker();

            if (callback) {
                callback(null, 'ok');
            }
        });
    };

    return job;
};

while (loops > 0) {
    loops--;

    var createJob = function() {
        var job = queue.createJob();

        job.setPriority( Math.round( Math.random() * 90 ) + 10 );

        job.description = 'job # ' + loops + ', priority: ' + job.getPriority();

        job.fn = runner;
        job.opts = { timeout:Math.round( Math.random() * 1000 ) };
        job.callback = function() {
            log.info('job complete callback: ', job.description);
        };

        job.on( JobModel.STATUS_CHANGE_EVENT, function(status) {
            log.info('status change: ', status);
            if (status === JobModel.COMPLETE) {
                log.info('job complete event: ', job.id, ' : ', job.description);
            }
        });

        job.on( JobModel.PROGRESS_EVENT, function(percentage) {
            log.info('progress : ', percentage, ' : ', job.id );
        });

        return job;
    };

    // this will fire a job added event
    queue.add( createJob() );
}

var list = queue.getJobList();
log.info('total jobs: ', list.length);
list.forEach(function(job) {
    log.info('job: ', job.id, ' p: ', job.getPriority(), ' s: ', job.getStatus());
});

setTimeout(function() {
    var job = queue.findNextJob();
    log.info('first job: ', job.id, ' p: ', job.getPriority());

    queue.add( createStopJob() );

    log.info('start the ticker...');
    queue.startRealTimeTicker();

}, 1000);

