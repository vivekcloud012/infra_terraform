# Infrastructure as Code Deployment

## Prerequisites
- Terraform v1.0+
- AWS CLI configured
- SSH key pair in AWS

## Deployment Steps

1. Clone the repository
2. Configure variables in `terraform.tfvars`
3. Initialize Terraform:
   ```bash
   terraform init

## Architecture Overview
VPC Structure:

- VPC (10.0.0.0/16) spanning two Availability Zones
- Availability Zone A: Public Subnet (10.0.0.0/24) and Private Subnet (10.0.2.0/24)
- Availability Zone B: Public Subnet (10.0.1.0/24) and Private Subnet (10.0.3.0/24)

Key Components:

- Internet Gateway - Connects to the internet
- Application Load Balancer - Distributes traffic across availability zones
- NAT Gateway - Provides outbound internet access for private subnets
- Bastion Host - Secure SSH access to private resources
- ECS Fargate Services - Container services in both private subnets
- RDS PostgreSQL - Managed database service
- External Services: CloudWatch (monitoring), SSM Parameter Store (configuration), ECR (container registry)

Security Groups:

- SG-ALB: Allows HTTP/HTTPS from Internet
- SG-Bastion: SSH access from specific IP
SG-EC2: Traffic from ALB + SSH from Bastion
SG-RDS: Database access from EC2 only
