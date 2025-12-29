output "server_name" { value = azurerm_postgresql_flexible_server.psql.name }
output "db_name" { value = azurerm_postgresql_flexible_server_database.db.name }
output "key_vault_name" { value = azurerm_key_vault.kv.name }
output "key_vault_id" { value = azurerm_key_vault.kv.id }