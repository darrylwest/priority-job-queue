#!/usr/bin/env node

// dpw@alameda.local
// 2014.11.06
'use strict';

var PriorityJobQueue = require('../index').PriorityJobQueue,
    JobModel = require('../index').models.JobModel,
    JobModelEvent = require('../index').events.JobModelEvent,
    log = require('simple-node-logger').createSimpleLogger(),
    queue = new PriorityJobQueue( { log:log } );

log.info('queue created');

queue.on( PriorityJobQueue.JOB_ADDED_EVENT, function(obj) {
    log.info('job added event: ', obj);
});

queue.startRealTimeTicker();

var looper = function(opts, callback) {
    log.info('options: ', opts);

    var loop = 0,
        maxLoops = opts.maxLoops;

    var id = setInterval(function() {
        loop++;

        log.info('loop: ', loop);

        if (loop >= maxLoops) {
            clearInterval( id );

            return callback(null, loop);
        }
    }, 500);
};

var job = queue.createJob();

job.description = 'my simple looper job';
job.fn = looper;
job.opts = { maxLoops:5 };
job.callback = function() {
    log.info('job complete callback...');
    queue.stopRealTimeTicker();
};

job.on( JobModelEvent.STATUS_CHANGE_EVENT, function(status) {
    log.info('status change: ', status);
});

job.on( JobModelEvent.PROGRESS_EVENT, function(percentage) {
    log.info('progress : ', percentage);
});

// the real-time ticker means that adding it to the queue will auto-start the job
queue.add( job );

