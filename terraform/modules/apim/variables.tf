variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "apim_name" { type = string }
variable "publisher_name" { type = string }
variable "publisher_email" { type = string }

variable "env" {
  description = "The environment (dev, qa, prod)"
  type        = string
}

# NEW VARIABLE: The Public IP of your AKS Ingress
variable "ingress_ip" {
  description = "The Public IP of the AKS Ingress Controller"
  type        = string
}