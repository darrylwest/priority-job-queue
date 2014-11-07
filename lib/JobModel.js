/**
 * @class JobModel
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 9:34 AM
 */
var dash = require('lodash'),
    uuid = require('node-uuid' ),
    util = require( 'util' ),
    events = require( 'events' );

var JobModel = function(params) {
    'use strict';

    if (!params) params = {};

    var model = this,
        status,
        priority;

    status = params.status || JobModel.NEW_STATUS;
    priority = params.priority || JobModel.NORMAL_PRIORITY;

    this.id = params.id || uuid.v4();
    this.dateCreated = params.dateCreated || new Date();
    this.description = params.description;

    this.fn = params.fn;
    this.args = params.args;
    this.callback = params.callback;

    this.setPriority = function(p) {
        if (priority !== p) {
            priority = p;

            model.emit( JobModel.PRIORITY_CHANGE_EVENT, priority );
        }
    };

    this.getPriority = function() {
        return priority;
    };

    this.setStatus = function(value) {
        if (status !== value) {
            status = value;

            model.emit( JobModel.STATUS_CHANGE_EVENT, status );
        }
    };

    this.getStatus = function() {
        return status;
    };

    /**
     * run the job
     */
    this.run = function() {
        model.setStatus( JobModel.RUNNING );
        model.fn.call( null, model.args, function(err, result) {
            model.setStatus( JobModel.COMPLETE );

            if (model.callback) {
                model.callback( err, result );
            }
        });
    };

    events.EventEmitter.call( this );
};

util.inherits( JobModel, events.EventEmitter );

JobModel.STATUS_CHANGE_EVENT = 'statusChange';
JobModel.PRIORITY_CHANGE_EVENT = 'priorityChange';
JobModel.PROGRESS_EVENT = 'progress';
JobModel.ERROR_EVENT = 'error';

JobModel.LOW_PRIORITY = 90;
JobModel.NORMAL_PRIORITY = 60;
JobModel.MEDIUM_PRIORITY = 50;
JobModel.HIGH_PRIORITY = 10;
JobModel.CRITICAL = 1;

JobModel.NEW_STATUS = 'new';
JobModel.QUEUED = 'queued';
JobModel.RUNNING = 'running';
JobModel.COMPLETE = 'complete';

module.exports = JobModel;

