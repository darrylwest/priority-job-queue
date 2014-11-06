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

    this.id = params.id || uuid.v4();
    this.dateCreated = params.dateCreated || new Date();
    this.description = params.description;

    this.fn = params.fn;
    this.args = params.args;
    this.callback = params.callback;

    this.priority = params.priority || 'medium';

    this.status = params.status || 'new'; // queued, running, complete

    events.EventEmitter.call( this );
};

util.inherits( JobModel, events.EventEmitter );

module.exports = JobModel;
