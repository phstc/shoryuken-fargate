import ec2 = require('@aws-cdk/aws-ec2')
import ecs = require('@aws-cdk/aws-ecs')
// import ecr = require('@aws-cdk/aws-ecr')
import cdk = require('@aws-cdk/cdk')

export class OpsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/ecs/fargate-load-balanced-service/index.ts
    // Create VPC and Fargate Cluster
    // NOTE: Limit AZs to avoid reaching resource quotas
    const vpc = new ec2.VpcNetwork(this, 'MyVpc', { maxAZs: 2 })
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc })

    // const ecrRepository = new ecr.Repository(this, 'phstc/shoryuken-fargate')

    // Instantiate Fargate Service with just cluster and image
    const fargateService = new ecs.LoadBalancedFargateService(
      this,
      'FargateService',
      {
        cluster,
        // image: ecs.ContainerImage.fromDockerHub('amazon/amazon-ecs-sample'),
        // image: ecs.ContainerImage.fromEcrRepository(ecrRepository, 'latest'),
        image: ecs.ContainerImage.fromDockerHub('phstc/shoryuken-fargate'),
        desiredCount: 0,
        containerPort: 3000,
        cpu: '1024',
        memoryMiB: '2GB'
      }
    )

    // // Output the DNS where you can access your service
    new cdk.Output(this, 'LoadBalancerDNS', {
      value: fargateService.loadBalancer.dnsName
    })
  }
}
