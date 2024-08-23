import AWS from 'aws-sdk';

const ses = new AWS.SES({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test'
});

const senderEmail = 'sender@example.com';
const recipientEmail = 'recipient@example.com';

async function sendEmail(): Promise<string | undefined> {
  const params: AWS.SES.SendEmailRequest = {
    Destination: { ToAddresses: [recipientEmail] },
    Message: {
      Body: { Text: { Data: "This is a test email from LocalStack SES." } },
      Subject: { Data: "Test Email" }
    },
    Source: senderEmail
  };

  try {
    const data = await ses.sendEmail(params).promise();
    console.log("Email sent successfully:", data.MessageId);
    return data.MessageId;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function getSendStatistics(): Promise<AWS.SES.GetSendStatisticsResponse | undefined> {
  try {
    const data = await ses.getSendStatistics().promise();
    console.log("Send Statistics:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Error getting send statistics:", error);
  }
}

async function listSentMessages(startTime: Date, endTime: Date): Promise<void> {
  try {
    const stats = await getSendStatistics();
    if (stats && stats.SendDataPoints) {
      const relevantDataPoints = stats.SendDataPoints.filter(point => {
        const timestamp = new Date(point.Timestamp!);
        return timestamp >= startTime && timestamp <= endTime;
      });

      console.log("Sent messages in the specified time range:");
      relevantDataPoints.forEach(point => {
        console.log(`Timestamp: ${point.Timestamp}`);
        console.log(`Delivery Attempts: ${point.DeliveryAttempts}`);
        console.log(`Bounces: ${point.Bounces}`);
        console.log(`Complaints: ${point.Complaints}`);
        console.log(`Rejects: ${point.Rejects}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error("Error listing sent messages:", error);
  }
}

async function runTest(): Promise<void> {
  console.log("Starting SES test...");

  const startTime = new Date();
  const messageId = await sendEmail();
  if (messageId) {
    console.log(`Message sent with ID: ${messageId}`);
  }
  
  // 잠시 대기하여 통계가 업데이트될 시간을 줍니다
  await new Promise(resolve => setTimeout(resolve, 1000));

  const endTime = new Date();
  await listSentMessages(startTime, endTime);

  console.log("SES test completed.");
}

runTest();