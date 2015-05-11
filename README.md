fancy-react-s3-uploader
===========================

This is a bells-and-whistles version of this react component: https://www.npmjs.com/package/react-s3-uploader.
Please refer to his documentation for the time being. This is **under construction**

Install
-----------

    $ npm install fancy-react-s3-uploader


Features
-----------
 - Accepts a JWT token which gets passed onto server calls for signing URLs. This is useful for using this uploader if you would like to authorize the signing request.
 - Takes signing URL to pass uploaded file to Amazon S3
 - Incorporated drag-and-drop out of box (thank you react-dropzone!)
 - Included an abort mechanism for in-progress files
 - Included a simple bootstrap UX for the upload button, as well as for progerss bars.
 
 