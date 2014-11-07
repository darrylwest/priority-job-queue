/**
 * @class JobQueueDataset
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 10:29 AM
 */
var dash = require('lodash'),
    casual = require('casual' ),
    JobModel = require('../../lib/JobModel');

var JobQueueDataset = function() {
    'use strict';

    var dataset = this;

    this.createJobList = function(count) {
        if (!count) count = 25;

        var list = [];

        while (count > 0) {
            var params = {
                status: JobModel.QUEUED,
                priority:Math.round( Math.random() * 60 ) + JobModel.MEDIUM_PRIORITY,
                description:'job # ' + count
            };

            list.push( dataset.createJob( params ) );

            count--;
        }

        return list;
    };

    this.createJob = function(params) {
        if (!params) params = {};

        if (!params.callback) {
            params.callback = function(err, results) {

            };
        }

        if (!params.fn) {
            params.fn = function(args, callback) {
                // console.log( args );

                if (callback) {
                    dash.defer(function() {
                        callback(null, 'done');
                    });
                }
            };
        }

        return new JobModel( params );
    };
};

module.exports = JobQueueDataset;