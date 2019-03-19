import ec2 = require('@aws-cdk/aws-ec2')
import ecs = require('@aws-cdk/aws-ecs')
import cdk = require('@aws-cdk/cdk')
import sqs = require('@aws-cdk/aws-sqs')

export class OpsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const queue = this.createQueue()

    const taskDefinition = this.createFargate(queue.queueName)

    this.grant(queue, taskDefinition)
  }

  grant(queue: sqs.Queue, taskDefinition: ecs.FargateTaskDefinition) {
    // grant actions required for Shoryuken
    // see https://github.com/phstc/shoryuken/wiki/Amazon-SQS-IAM-Policy-for-Shoryuken
    queue.grant(
      taskDefinition.taskRole,
      'sqs:ChangeMessageVisibility',
      'sqs:ChangeMessageVisibilityBatch',
      'sqs:DeleteMessage',
      'sqs:DeleteMessageBatch',
      'sqs:GetQueueAttributes',
      'sqs:GetQueueUrl',
      'sqs:ReceiveMessage',
      'sqs:SendMessage',
      'sqs:SendMessageBatch',
      'sqs:ListQueues'
    )
  }

  createFargate(queueName: string) {
    // https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/ecs/fargate-load-balanced-service/index.ts
    // Create VPC and Fargate Cluster
    // NOTE: Limit AZs to avoid reaching resource quotas
    const vpc = new ec2.VpcNetwork(this, 'MyVpc', { maxAZs: 2 })
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc })

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryMiB: '512',
      cpu: '256',
    })

    taskDefinition.addContainer('ShoryukenContainer', {
      image: ecs.ContainerImage.fromDockerHub('phstc/shoryuken-fargate'),
      environment: {
        'QUEUE_NAME': queueName
      }
    })

    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition
    })

    const scaling = service.autoScaleTaskCount({ maxCapacity: 10 })
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50
    })

    return taskDefinition
  }

  createQueue() {
    return new sqs.Queue(this, 'Queue')
  }
}
