'use strict';
var React = require('react')
  , S3Upload = require('./s3upload.js')
  , Dropzone = require('../react-dropzone');
import bootstrap from 'react-bootstrap';
let ProgressBar = bootstrap.ProgressBar;

export default class ReactS3Uploader extends React.Component {

    constructor(props) {
        super(props);
        this.state = { uploads: new Map() };
    }

    onProgress(percent, message, signResult, file, abort) {
        if(signResult) {
            let filename =  file.name;
            let uploadMap = this.state.uploads;
            let currUpload = uploadMap.get(filename);

            if(currUpload) {
                currUpload.percent = percent;
                uploadMap.set(filename, currUpload);
            }
            else {
                uploadMap.set(filename, {
                    percent: percent,
                    abort: abort
                });
            }

            this.setState({
                uploads: uploadMap
            });
        }

        if(this.props.onProgress) {
            this.props.onProgress(percent, message, signResult);
        }
    }

    abort(filename) {
        return function() {
            let uploads = this.state.uploads;
            uploads.get(filename).abort();
            uploads.delete(filename);
            this.setState({uploads: uploads});
        };
    }

    onFinish(signResult) {
        let filename =  signResult.filename;
        let uploadMap = this.state.uploads;
        uploadMap.delete(filename);

        this.setState({
            uploads: uploadMap
        });

        if(this.props.onFinish) {
            this.props.onFinish(signResult);
        }
    }

    uploadFile(e) {
        new S3Upload({
            token: this.props.token,
            fileElement: e.target,
            signingUrl: this.props.signingUrl,
            onProgress: this.onProgress.bind(this),
            onFinishS3Put: this.onFinish.bind(this),
            onError: this.props.onError
        });
    }

    onDrop(files) {
        new S3Upload({
            token: this.props.token,
            fileElement: files,
            signingUrl: this.props.signingUrl,
            onProgress: this.onProgress.bind(this),
            onFinishS3Put: this.onFinish.bind(this),
            onError: this.props.onError,
            bucket: this.props.bucket
        });
    }

    displayLoaders() {
        let loaders = [];

        for(let upload of this.state.uploads.entries()) {
            const filename = upload[0];   // Map key
            const status = upload[1];     // Map value
            const percent = status.percent;

            if(percent < 100) {
                loaders.push(
                    <div>
                         <a onClick={this.abort(filename).bind(this)}>cancel</a>
                        &#160;&#160; uploading {filename}

                        <ProgressBar active now={percent} label='%(percent)s%' />
                    </div>
                );
            }

        }
        return loaders;
    }

    render() {
        return (
            <div>
                <Dropzone onDrop={this.onDrop.bind(this)} size={160} style={{width: "100%", height: "130px"}}>
                </Dropzone>
                <div>
                    {this.displayLoaders()}
                </div>
            </div>
        );
    }
}

ReactS3Uploader.propTypes = {
    signingUrl: React.PropTypes.string.isRequired,
    onProgress: React.PropTypes.func,
    onFinish: React.PropTypes.func,
    token: React.PropTypes.string.isRequired,
    bucket: React.PropTypes.string.isRequired,
    onError: React.PropTypes.func
};

ReactS3Uploader.defaultProps = {
    onProgress: function(percent, message) {
        console.log('Upload progress: ' + percent + '% ' + message);
    },
    onFinish: function(signResult) {
        console.log("Upload finished: " + signResult.publicUrl);
    },
    onError: function(message) {
        console.log("Upload error: " + message);
    }
}