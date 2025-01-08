import json
import boto3

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
task_table = dynamodb.Table('Tasks')

def lambda_handler(event, context):
    try:
        # Fetch all tasks from the DynamoDB table
        response = task_table.scan()
        tasks = response.get('Items', [])

        return {
            'statusCode': 200,
            'body': json.dumps({"message": "Tasks retrieved successfully", "tasks": tasks})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({"message": "Error retrieving tasks", "error": str(e)})
        }
