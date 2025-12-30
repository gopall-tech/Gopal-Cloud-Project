variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "apim_name" { type = string }
variable "publisher_name" { type = string }
variable "publisher_email" { type = string }
variable "env" {
  type = string
}
variable "frontend_url" {
  description = "The URL of the frontend allowed to call this API"
  type        = string
}