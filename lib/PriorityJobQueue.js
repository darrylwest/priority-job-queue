/**
 * @class PriorityJobQueue
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 8:57 AM
 */
var dash = require('lodash' ),
    util = require( 'util' ),
    events = require( 'events' ),
    JobModel = require( './JobModel' );

var PriorityJobQueue = function(options) {
    'use strict';

    var queue = this,
        log = options.log,
        jobs = dash.isArray( options.jobs ) ? options.jobs : [];

    events.EventEmitter.call( this );

    /**
     * get the job list
     *
     * @returns a clone of the current job list
     */
    this.getJobList = function() {
        return dash.clone( jobs );
    };

    /**
     * add one or more jobs (either an array or a single job model)
     *
     * @param obj - array or single model
     */
    this.add = function(obj) {
        log.debug('add the job(s): ', obj);

        var changed = false;

        if (dash.isArray( obj )) {
            obj.forEach(function(job) {
                if (addJob( job )) {
                    changed = true;
                }
            });
        } else {
            if (addJob( obj )) {
                changed = true;
            }
        }

        // emit a queue change event
        if (changed) {
            queue.emit( PriorityJobQueue.JOB_ADDED_EVENT, obj );
        }
    };

    var addJob = function(job) {
        if (!dash.find( jobs, { id:job.id })) {
            job.status = JobModel.QUEUED;

            jobs.push( job );

            return true;
        } else {
            return false;
        }
    };

    this.remove = function(job) {
        log.info('remove the job: ', job);

        // emit a queue change event
    };

    this.createJob = function(params) {
        var job = new JobModel(params);

        return job;
    };

    if (!log) throw new Error('job queue must be constructed with a logger');
};

PriorityJobQueue.JOB_ADDED_EVENT = 'jobadded';
PriorityJobQueue.JOB_REMOVED_EVENT = 'jobremoved';

util.inherits( PriorityJobQueue, events.EventEmitter );

module.exports = PriorityJobQueue;
