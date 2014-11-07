#!/usr/bin/env node

// dpw@alameda.local
// 2014.11.06
'use strict';

var PriorityJobQueue = require('../index'),
    JobModel = require('../index').models.JobModel,
    log = require('simple-node-logger').createSimpleLogger(),
    queue = new PriorityJobQueue( { log:log } );

log.info('queue created');

queue.on( PriorityJobQueue.JOB_ADDED_EVENT, function(obj) {
    log.info('job added event: ', obj);
});

queue.startRealTimeTicker();

var looper = function(params, callback) {
    log.info('params: ', params);

    var loop = 0,
        maxLoops = params.maxLoops;

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
job.args = { maxLoops:5 };
job.callback = function() {
    log.info('job complete callback...');
    queue.stopRealTimeTicker();
};

job.on( JobModel.STATUS_CHANGE_EVENT, function(status) {
    log.info('status change: ', status);
});

job.on( JobModel.PROGRESS_EVENT, function(percentage) {
    log.info('progress : ', percentage);
});

// the real-time ticker means that adding it to the queue will auto-start the job
queue.add( job );

