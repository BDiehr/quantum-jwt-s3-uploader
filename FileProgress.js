'use strict';
var React = require('react');
var bootstrap = require('react-bootstrap');
var ProgressBar = bootstrap.ProgressBar;

var FileProgress = React.createClass({
    propTypes: {
        filename: React.PropTypes.string.isRequired,
        percent: React.PropTypes.number.isRequired,
        onCancel: React.PropTypes.func.isRequired
    },

    render: function(){
        return (
            React.createElement("div", null,
                React.createElement("a", {onClick: this.props.onCancel}, "cancel"),
                " uploading ", this.props.filename,
                React.createElement(ProgressBar, {active: true, now: this.props.percent, label: "%(percent)s%"})
            )
        );
    }
});

module.exports = FileProgress;