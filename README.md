# Description

This is an image resizing service primarily used for the Stratpoint's Tala (Reimbursement) project.  
It triggers a lambda event after an S3 PUT or a Multipart Upload.  
Resizing is done primarily using the a Node.js image library called [Sharp](https://github.com/lovell/sharp).  
Processed images are then stored in a different directory for use by the app.

# Developer Guide

Create a ```secrets.env``` file and fill the ff details:

```
SLS_KEY=yourawskey
SLS_SECRET=yourawssecret
STAGE=dev
REGION=us-east-1
BUCKET=yourbucket
```

Run the deployment to AWS via ```docker-compose up --build```

As an additional utility for debugging/tracing, we can also enable the [serverless-plugin-tracing](https://www.npmjs.com/package/serverless-plugin-tracing) library which will allow us to see all executions handled by the lambda resize code thru [AWS X-ray](https://aws.amazon.com/xray/).

# Deployment Notes

* This implementation uses docker to build the sharp library inside a linux OS, amazonlinux to be precise
* In order to integrate to the existing S3 bucket used by the Tala application,
we relied on an npm package called [serverless-plugin-existing-s3](https://www.npmjs.com/package/serverless-plugin-existing-s3).  
This necessary primarily because of current [AWS CloudFormation limitations](https://serverfault.com/questions/610788/using-cloudformation-with-an-existing-s3-bucket) preventing us to attach events to an existing resource.

## Serverless Local

You can also opt to try the implementation locally. Listed below are the packages that will be needed:
* [serverless-offline](https://www.npmjs.com/package/serverless-offline)
* [serverless-s3-local](https://www.npmjs.com/package/serverless-s3-local)
* [serverless-dotenv-plugin](https://www.npmjs.com/package/serverless-dotenv-plugin)


# References

* [Lambda Event Sources](https://docs.aws.amazon.com/lambda/latest/dg/invoking-lambda-function.html)
* [AWS S3 Event Message Structure](https://docs.aws.amazon.com/AmazonS3/latest/dev/notification-content-structure.html)
* [AWS S3 Event Types](https://docs.aws.amazon.com/AmazonS3/latest/dev/NotificationHowTo.html#notification-how-to-event-types-and-destinations)


# Future Task/s

* Move some of the code as utils for import
* Support API Gateway Trigger
* Flexible resize parameters
