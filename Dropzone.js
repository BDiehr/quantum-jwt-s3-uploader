'use strict';
var React = require('react');
var _ = require('lodash');
var bootstrap = require('react-bootstrap');
var Button = bootstrap.Button;

var Dropzone = React.createClass({
  getInitialState: function() {
    return {
      isDragActive: false
    };
  },

  propTypes: {
    onDrop: React.PropTypes.func.isRequired,
    size: React.PropTypes.number,
    style: React.PropTypes.object
  },

  onDragLeave: function(e) {
    this.setState({
      isDragActive: false
    });
  },

  onDragOver: function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";

    this.setState({
      isDragActive: true
    });
  },

  onDrop: function(e) {
    e.preventDefault();

    this.setState({
      isDragActive: false
    });

    var files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }

    if (this.props.onDrop) {
      files = Array.prototype.slice.call(files);
      this.props.onDrop(files);
    }
  },

  onClick: function () {
    this.refs.fileInput.findDOMNode().click();
  },

  render: function() {

    var className = this.props.className || 'dropzone';
    if (this.state.isDragActive) {
      className += ' active';
    }

    var dashedBoarderDragStyle = {
      borderStyle: this.state.isDragActive ? "solid" : "dashed"
    };

    var style = {};

    _.merge(style, dashedBoarderDragStyle, this.props.style);

    return (
        React.createElement(Button, {bsSize: "large", style: style, onClick: this.onClick, onDrop: this.onDrop, onDragLeave: this.onDragLeave, onDragOver: this.onDragOver},

            React.createElement("div", {className: className},
                React.createElement("input", {style: {display: 'none'}, type: "file", multiple: true, ref: "fileInput", onChange: this.onDrop}),
                this.props.children
            )
        )
    );
  }

});

module.exports = Dropzone;
