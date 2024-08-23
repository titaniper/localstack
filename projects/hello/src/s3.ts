import AWS from 'aws-sdk';

// LocalStack 엔드포인트 설정
const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  s3ForcePathStyle: true,
  accessKeyId: 'test',
  secretAccessKey: 'test',
  region: 'us-east-1'
});

async function testS3() {
  const bucketName = 'my-test-bucket';
  const fileName = 'test-file.txt';
  const fileContent = 'Hello, LocalStack!';

  try {
    // 버킷 생성
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`Bucket created: ${bucketName}`);

    // 파일 업로드
    await s3.putObject({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent
    }).promise();
    console.log(`File uploaded: ${fileName}`);

    // 파일 다운로드
    const data = await s3.getObject({
      Bucket: bucketName,
      Key: fileName
    }).promise();

    

    console.log('File content:', data?.Body!.toString());

    const d = await s3.listBuckets().promise();
    console.log('File content:', d?.Buckets?.map(b => b.Name).join(', '));

  } catch (error) {
    console.error('Error:', error);
  }
}

testS3();