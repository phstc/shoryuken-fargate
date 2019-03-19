
# Shoryuken Fargate

This is a PoC for running [Shoryuken](https://github.com/phstc/shoryuken) on [AWS Fargate](https://aws.amazon.com/fargate/).

#### Deploy with [aws-cdk](https://github.com/awslabs/aws-cdk)

Export your AWS credentials then:

```sh
cd ops
./deploy.sh
```

### TODO: Replace Docker Hub with ECR

For some reason (most likely permissions) ECR didn't work. A quick change to Docker Hub did the trick. But the idea is to use ECR.

Replace this:

```typescript
taskDefinition.addContainer('ShoryukenContainer', {
  image: ecs.ContainerImage.fromDockerHub('phstc/shoryuken-fargate'),
  environment
})
```

With:

```typescript
import ecr = require('@aws-cdk/aws-ecr')

// ...
const ecrRepository = new ecr.Repository(this, 'phstc/shoryuken-fargate')

taskDefinition.addContainer('ShoryukenContainer', {
  image: ecs.ContainerImage.fromEcrRepository(ecrRepository, 'latest')
  environment
})
```