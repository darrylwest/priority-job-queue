/**
 * @class PriorityJobQueue
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 8:59 AM
 */
var should = require('chai').should(),
    dash = require('lodash' ),
    MockLogger = require('simple-node-logger' ).mocks.MockLogger,
    PriorityJobQueue = require('../lib/PriorityJobQueue');

describe('ServiceFactory', function() {
    'use strict';

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('PriorityJobQueue');

        return opts;
    };

    describe('#instance', function() {
        var jobs = new PriorityJobQueue( createOptions() ),
            methods = [
                'getJobList'
            ];

        it('should create an instance of ServiceFactory', function() {
            should.exist( jobs );
            jobs.should.be.instanceof( PriorityJobQueue );
        });

        it('should have all known methods by size and type', function() {
            dash.methods( jobs ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                jobs[ method ].should.be.a( 'function' );
            });
        });
    });
});