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
    priority = params.priority || JobModel.MEDIUM_PRIORITY;

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
        };
    };

    this.getPriority = function() {
        return priority;
    };

    this.setStatus = function(value) {
        if (status !== value) {
            status = value;

            model.emit( JobModel.STATUS_CHANGE_EVENT, value );
        }
    };

    this.getStatus = function() {
        return status;
    };

    events.EventEmitter.call( this );
};

util.inherits( JobModel, events.EventEmitter );

JobModel.STATUS_CHANGE_EVENT = 'statusChange';
JobModel.PRIORITY_CHANGE_EVENT = 'priorityChange';

JobModel.LOW_PRIORITY = 'low';
JobModel.MEDIUM_PRIORITY = 'medium';
JobModel.HIGH_PRIORITY = 'high';

JobModel.NEW_STATUS = 'new';
JobModel.QUEUED = 'queued';
JobModel.RUNNING = 'running';
JobModel.COMPLETE = 'complete';

module.exports = JobModel;

