resource "azurerm_api_management" "apim" {
  name                = var.apim_name
  location            = var.location
  resource_group_name = var.resource_group_name
  publisher_name      = var.publisher_name
  publisher_email     = var.publisher_email
  sku_name            = "Consumption_0"
}

# 1. Define the API
resource "azurerm_api_management_api" "backend_api" {
  name                  = "gopal-backend-api"
  resource_group_name   = var.resource_group_name
  api_management_name   = azurerm_api_management.apim.name
  revision              = "1"
  display_name          = "Gopal Backend API"
  path                  = "v1"
  protocols             = ["http", "https"]
  service_url           = "http://REPLACE_ME_INGRESS_IP"
  subscription_required = false
}

# 2. Define Operations
resource "azurerm_api_management_api_operation" "get_a" {
  operation_id        = "get-backend-a"
  api_name            = azurerm_api_management_api.backend_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = var.resource_group_name
  display_name        = "Get Backend A"
  method              = "GET"
  url_template        = "/api/a"
}

resource "azurerm_api_management_api_operation" "get_b" {
  operation_id        = "get-backend-b"
  api_name            = azurerm_api_management_api.backend_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = var.resource_group_name
  display_name        = "Get Backend B"
  method              = "GET"
  url_template        = "/api/b"
}

resource "azurerm_api_management_api_operation" "upload_a" {
  operation_id        = "upload-backend-a"
  api_name            = azurerm_api_management_api.backend_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = var.resource_group_name
  display_name        = "Upload Backend A"
  method              = "POST"
  url_template        = "/api/a/upload"
}

resource "azurerm_api_management_api_operation" "upload_b" {
  operation_id        = "upload-backend-b"
  api_name            = azurerm_api_management_api.backend_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = var.resource_group_name
  display_name        = "Upload Backend B"
  method              = "POST"
  url_template        = "/api/b/upload"
}

# 3. GLOBAL POLICY (Corrected)
# terraform/modules/apim/main.tf

resource "azurerm_api_management_policy" "global_policy" {
  api_management_id = azurerm_api_management.apim.id
  xml_content       = <<XML
<policies>
    <inbound>
        <cors allow-credentials="true">
            <allowed-origins>
                <origin>https://gopal-web-${var.env}-centralus.azurewebsites.net</origin>
                <origin>http://localhost:3000</origin>
            </allowed-origins>
            <allowed-methods>
                <method>GET</method>
                <method>POST</method>
                <method>OPTIONS</method>
                <method>PUT</method>
                <method>DELETE</method>
            </allowed-methods>
            <allowed-headers>
                <header>Content-Type</header>
                <header>Authorization</header>
                <header>Accept</header>
                <header>Origin</header>
                <header>X-Requested-With</header>
            </allowed-headers>
        </cors>
    </inbound>
    <backend>
        <forward-request />
    </backend>
    <outbound />
    <on-error />
</policies>
XML
}