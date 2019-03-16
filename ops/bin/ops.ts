#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/cdk');
import { OpsStack } from '../lib/ops-stack';

const app = new cdk.App();
new OpsStack(app, 'OpsStack');
app.run();
