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
        jobs = dash.isArray( options.jobs ) ? options.jobs : [],
        rttid;

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
            job.setStatus( JobModel.QUEUED );

            jobs.push( job );

            return true;
        } else {
            return false;
        }
    };

    /**
     * remove the job
     *
     * @param job
     */
    this.remove = function(job) {
        log.info('remove the job: ', job);

        var removed = false;

        jobs = dash.remove( jobs, function(item) {
            if (job.id === item.id) {
                removed = true;
                return true;
            } else {
                return false;
            }
        });

        if (removed) {
            queue.emit( PriorityJobQueue.JOB_REMOVED_EVENT, job );
        }
    };

    /**
     * external real time tick to find and run queued jobs, one at a time.
     */
    this.tickHandler = function() {
        var job = dash.find(jobs, function(item) {
            return item.getStatus() === JobModel.RUNNING;
        });

        if (!job) {
            job = queue.findNextJob();

            if (job) {
                job.run();
            } else {
                // purge the job list
            }
        }
    };

    /**
     * find queued jobs; sort by priority and date created; return the highest priority
     *
     * @returns next job or undefined if no jobs are available
     */
    this.findNextJob = function() {
        var queued = jobs.filter(function(item) {
            return item.getStatus() === JobModel.QUEUED;
        });

        queued.sort(function(a, b) {
            var ka = [ a.getPriority(), a.dateCreated.getTime() ].join( '' ),
                kb = [ b.getPriority(), b.dateCreated.getTime() ].join( '' );

            if (ka < kb) {
                return -1;
            }

            if (kb < ka) {
                return 1;
            }

            return 0;
        });

        return queued.shift();
    };

    /**
     * create a job model
     *
     * @param params
     * @returns {JobModel}
     */
    this.createJob = function(params) {
        var job = new JobModel(params);

        return job;
    };

    /**
     * start the real time ticker;
     *
     * @returns the ticker interval id
     */
    this.startRealTimeTicker = function() {
        var count = 0;

        rttid = setInterval(function() {
            count++;

            if (count % 10 === 0) {
                queue.emit( PriorityJobQueue.ONE_SECOND_TICK_EVENT );

                if (count > 10000000) {
                    count = 0;
                }
            }

            queue.tickHandler();
        }, 100);

        return rttid;
    };

    /**
     * stop the real time interval ticker
     */
    this.stopRealTimeTicker = function() {
        if (rttid) {
            clearInterval( rttid );
            rttid = null;
        }
    };

    if (!log) throw new Error('job queue must be constructed with a logger');
};

PriorityJobQueue.JOB_ADDED_EVENT = 'jobadded';
PriorityJobQueue.JOB_REMOVED_EVENT = 'jobremoved';
PriorityJobQueue.ONE_SECOND_TICK_EVENT = 'oneSecondTick';

util.inherits( PriorityJobQueue, events.EventEmitter );

module.exports = PriorityJobQueue;
