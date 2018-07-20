# aws-lambda-sharp

## Install Dependencies
```
npm install
```

## Prepare for lambda
1. Remove sharp npm package
```
rm -rf node_modules/sharp/
```
2. Prepare sharp package properly
```
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs6.10 npm install
```
3. Archive `node_modules` and `index.js`