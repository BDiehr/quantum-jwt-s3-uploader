'use strict';
var React = require('react')
  , S3Upload = require('./s3upload.js')
  , Dropzone = require('./Dropzone')
  , bootstrap = require('react-bootstrap')
  , ProgressBar = bootstrap.ProgressBar;


var ReactS3Uploader = React.createClass({
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
        console.log('=== Uploads ===');
        console.log(uploads);
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

        if(uploadIndex) {
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

    propTypes: {
        signingUrl: React.PropTypes.string.isRequired,
        onProgress: React.PropTypes.func,
        onFinish: React.PropTypes.func,
        token: React.PropTypes.string.isRequired,
        bucket: React.PropTypes.string.isRequired,
        onError: React.PropTypes.func
    },

    defaultProps: {
        onProgress: function(percent, message) {
            console.log('Upload progress: ' + percent + '% ' + message);
        },
        onFinish: function (signResult) {
            console.log("Upload finished: " + signResult.publicUrl);
        },
        onError: function (message) {
            console.log("Upload error: " + message);
        }
    },

    onProgress: function(percent, message, signResult, file, abort) {
        if(signResult) {
            var filename =  file.name;
            var currUpload = this.getUpload(filename);
            console.log(currUpload);
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

    uploadFile: function(e) {
        new S3Upload({
            token: this.props.token,
            fileElement: e.target,
            signingUrl: this.props.signingUrl,
            onProgress: this.onProgress,
            onFinishS3Put: this.onFinish,
            onError: this.props.onError
        });
    },

    onDrop: function(files) {
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
        var keyCoutner = 0;
        var uploads = this.state.uploads;

        for(var i = 0, len = uploads.length; i < len; i++) {
            keyCoutner = keyCoutner + 1;
            var upload = uploads[i];
            var filename = upload.filename;
            var file = upload.file;
            var percent = file.percent;

            if(percent < 100) {
                loaders.push(
                    React.createElement("div", {key: keyCoutner},
                        React.createElement("a", {onClick: this.abort(filename).bind(this)}, "cancel"),
                        " uploading ", filename,
                        React.createElement(ProgressBar, {active: true, now: percent, label: "%(percent)s%"})
                    )
                );
            }

        }
        return loaders;
    },

    render: function() {
        return (
            React.createElement("div", null,
                React.createElement(Dropzone, {onDrop: this.onDrop, style: this.props.style},
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