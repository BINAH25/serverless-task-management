import json
import boto3

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
task_table = dynamodb.Table('Tasks')

def lambda_handler(event, context):
    try:
        # Parse the request body if necessary
        if isinstance(event, str):
            event = json.loads(event)
        elif "body" in event and isinstance(event["body"], str):
            event = json.loads(event["body"])

        # Extract task details
        title = event.get('title')
        description = event.get('description')
        deadline = event.get('deadline')
        status = event.get('status', 'Pending')  # Default to 'Pending' if not provided
        task_id = event.get('id')
        # Task object
        task = {
            'id': task_id,
            'title': title,
            'description': description,
            'deadline': deadline,
            'status': status,
        }

        # Save the task in DynamoDB
        task_table.put_item(Item=task)

        return {
            'statusCode': 201,
            'body': json.dumps({"message": "Task created successfully", "task": task})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({"message": "Error creating task", "error": str(e)})
        }
