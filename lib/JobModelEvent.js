/**
 * @class JobModelEvent
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/14/14 3:49 PM
 */
var JobModelEvent = {};

JobModelEvent.STATUS_CHANGE_EVENT = 'statusChange';
JobModelEvent.PRIORITY_CHANGE_EVENT = 'priorityChange';
JobModelEvent.PROGRESS_EVENT = 'progress';
JobModelEvent.ERROR_EVENT = 'errorEvent';

module.exports = JobModelEvent;