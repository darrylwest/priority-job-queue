#!/usr/bin/env node

// dpw@alameda.local
// 2014.11.06
'use strict';

var PriorityJobQueue = require('../index'),
    log = require('simple-node-logger').createSimpleLogger(),
    queue = new PriorityJobQueue( { log:log } );

log.info('queue created');

queue.on( PriorityJobQueue.JOB_ADDED_EVENT, function(obj) {
    log.info('job added event: ', obj);
});

var looper = function(params, callback) {
    log.info('params: ', params);

    var loop = 0;
    var id = setInterval(function() {
        loop++;

        log.info('loop: ', loop);

        if (loop > 10) {
            clearInterval( id );

            return callback(null, loop);
        }
    }, 1000);
};

var job = queue.createJob();

job.description = 'my simple looper job';
job.fn = looper;
job.args = { one:1, two:2 };
job.callback = function() {
    log.info('job complete callback...');
};

queue.add( job );

// signal a timer tick...
queue.tickHandler();

