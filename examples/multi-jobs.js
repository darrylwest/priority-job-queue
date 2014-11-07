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

var runner = function(params, callback) {
    setTimeout(function() {
        callback( null, 'ok' );
    }, params.timeout );
};

while (loops > 0) {
    loops--;

    var job = queue.createJob();

    job.setPriority( Math.round( Math.random() * 90 ) + 10 );

    job.description = 'job # ' + loops + ', priority: ' + job.getPriority();

    job.fn = runner;
    job.args = { timeout:Math.round( Math.random() * 1000 ) };
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

    // the real-time ticker means that adding it to the queue will auto-start the job
    queue.add( job );
}

log.info('total jobs: ', queue.getJobList().length);

setTimeout(function() {
    log.info('start the ticker...');
    queue.startRealTimeTicker();
}, 2000);

