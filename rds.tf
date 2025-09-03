resource "aws_db_instance" "main" {
  # ... existing configuration ...

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  skip_final_snapshot     = false
  final_snapshot_identifier = "${var.project_name}-final-snapshot"

  # Enable automated backups
  enabled_cloudwatch_logs_exports = ["postgresql"]
}

# Additional backup policy
resource "aws_backup_plan" "rds" {
  name = "${var.project_name}-rds-backup"

  rule {
    rule_name         = "rds-daily-backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 2 * * ? *)"

    lifecycle {
      delete_after = 35
    }
  }
}

resource "aws_backup_vault" "main" {
  name = "${var.project_name}-backup-vault"
}