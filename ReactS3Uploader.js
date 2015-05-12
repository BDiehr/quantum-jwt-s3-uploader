'use strict';
var React = require('react')
    , S3Upload = require('./s3upload.js')
    , FileProgress = require('./FileProgress.js')
    , Dropzone = require('./Dropzone');

var ReactS3Uploader = React.createClass({

    propTypes: {
        signingUrl: React.PropTypes.string.isRequired,
        onProgress: React.PropTypes.func,
        onFinish: React.PropTypes.func,
        token: React.PropTypes.string.isRequired,
        bucket: React.PropTypes.string.isRequired,
        onError: React.PropTypes.func
    },

    defaultProps: {
        onProgress: function(percent, message){},
        onFinish: function(signResult){},
        onError: function(message){}
    },

    getInitialState: function() {
        return { uploads: [] };
    },

    addUpload: function(filename, file)  {
        var uploads = this.state.uploads.concat({filename: filename, file: file});
        this.setState({
            uploads: uploads
        });
    },

    /***
     * Returns the upload in progress with the given filename. Returns null if no such upload exists.
     */
    getUpload: function(filename) {
        var upload = null;
        var uploads = this.state.uploads;
        for(var i = 0, len = uploads.length; i < len; i ++) {
            var currUpload = uploads[i];
            if(currUpload.filename === filename) {
                upload = currUpload;
                break;
            }
        }

        return upload && upload.file || null;
    },

    deleteUpload: function(filename) {
        var uploadIndex = null;
        var uploads = this.state.uploads;
        for(var i = 0, len = uploads.length; i < len; i++) {
            var currUpload = uploads[i];
            if(currUpload.filename === filename) {
                uploadIndex = i;
                break;
            }
        }

        if(uploadIndex >= 0) {
            uploads.splice(uploadIndex, 1);
            this.setState({
                uploads: uploads
            })
        }
    },

    updateUpload: function(filename, file) {
        var upload = null;
        var uploads = this.state.uploads;
        for(var i = 0, len = uploads.length; i < len; i ++) {
            var currUpload = uploads[i];
            if(currUpload.filename === filename) {
                upload = currUpload;
                break;
            }
        }

        if(upload) {
            upload.file = file;
            this.setState({
                uploads: uploads
            });
        }
    },

    onProgress: function(percent, message, signResult, file, abort) {
        if(signResult) {
            var filename =  file.name;
            var currUpload = this.getUpload(filename);
            if(currUpload) {
                currUpload.percent = percent;
                this.updateUpload(filename, currUpload);
            }

            else {
                this.addUpload(filename, {
                    percent: percent,
                    abort: abort
                });
            }
        }

        if(this.props.onProgress) {
            this.props.onProgress(percent, message, signResult);
        }
    },

    abort: function(filename) {
        return function() {
            this.getUpload(filename).abort();
            this.deleteUpload(filename);
        };
    },


    onFinish: function(signResult) {
        var filename =  signResult.filename;
        this.deleteUpload(filename);

        if(this.props.onFinish) {
            this.props.onFinish(signResult);
        }
    },


    uploadFile: function(files) {
        new S3Upload({
            token: this.props.token,
            fileElement: files,
            signingUrl: this.props.signingUrl,
            onProgress: this.onProgress,
            onFinishS3Put: this.onFinish,
            onError: this.props.onError,
            bucket: this.props.bucket
        });
    },

    displayLoaders: function() {
        var loaders = [];
        var uploads = this.state.uploads;
        for(var i = 0, len = uploads.length; i < len; i++) {
            var upload = uploads[i];
            var filename = upload.filename;
            var file = upload.file;
            var percent = file.percent;
            if(percent < 100) {
                loaders.push(
                    React.createElement(FileProgress, {key: filename,
                        onCancel: this.abort(filename).bind(this),
                        percent: percent,
                        filename: filename})
                );
            }

        }
        return loaders;
    },

    render: function() {
        return (
            React.createElement("div", null,
                React.createElement(Dropzone, {onDrop: this.uploadFile, style: this.props.style},
                    this.props.children
                ),
                React.createElement("div", null,
                    this.displayLoaders()
                )
            )
        );
    }
});


module.exports = ReactS3Uploader;