# deploy.sh

# variables
stage=${STAGE}
region=${REGION}
bucket=${BUCKET}
secrets='/deploy/secrets/secrets.json'

# config sls profile
sls config credentials \
  --provider aws \
  --key ${SLS_KEY} \
  --secret ${SLS_SECRET} \
  --profile serverless-admin

echo "------------------"
echo 'Deploying function...'
echo "------------------"
cd /deploy/src
sls deploy

echo "------------------"
echo "Service deployed. Press CTRL+C to exit."
