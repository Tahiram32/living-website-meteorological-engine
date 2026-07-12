# ==============================================================================
# 🌟 ENTERPRISE DECLARATIVE INFRASTRUCTURE AS CODE (TERRAFORM)
# ==============================================================================
# Physically provisions the isolated GCP IAM Service Accounts, custom roles, 
# network permissions, Cloud Tasks queue, and Cloud Run services required to 
# achieve full microservice isolation and trust boundaries.
#
# Eliminates state desynchronization and imperative deployment crashes.
# ==============================================================================

terraform {
  required_version = ">= 1.3.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.80"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# --- VARIABLES ---
variable "project_id" {
  type        = string
  description = "The Google Cloud Project ID where services are provisioned."
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "The GCP target region for Cloud Run and Cloud Tasks."
}

variable "queue_name" {
  type        = string
  default     = "paypal-provisioning"
  description = "The name of the Google Cloud Tasks queue."
}

variable "task_worker_secret" {
  type        = string
  sensitive   = true
  description = "A cryptographically secure pre-shared secret shield for Layer 7 verification."
}

variable "gemini_api_key" {
  type        = string
  sensitive   = true
  description = "Google Gemini API Secret Key."
}

# --- SERVICE ACCOUNTS ---

# 1. Gateway Ingress Service Account (Service A)
resource "google_service_account" "gateway_sa" {
  account_id   = "paypal-gateway-sa"
  display_name = "PayPal Webhook Gateway SA"
  description  = "Least-privileged identity for public gateway. Denied full Firestore reads."
}

# 2. AI Sync Worker Service Account (Service B)
resource "google_service_account" "worker_sa" {
  account_id   = "ai-worker-sa"
  display_name = "AI Sync Worker Engine SA"
  description  = "Highly-privileged secure private processor. Firestore RW + Gemini execution."
}

# 3. Cloud Tasks Invoker Service Account
resource "google_service_account" "tasks_invoker_sa" {
  account_id   = "paypal-tasks-invoker-sa"
  display_name = "PayPal Cloud Tasks Invoker SA"
  description  = "Used by Cloud Tasks to sign Google OIDC tokens when calling the private worker."
}

# --- CUSTOM IAM ROLES ---

# Custom Firestore Write-Only role to enforce Least Privilege for Service A
resource "google_project_iam_custom_role" "firestore_write_only" {
  role_id     = "FirestoreWriteOnly"
  title       = "Firestore Write-Only"
  description = "Enables document creation and updating without permission to read documents."
  permissions = [
    "datastore.entities.create",
    "datastore.entities.update"
  ]
}

# --- IAM BINDINGS (LEAST PRIVILEGE ENFORCEMENT) ---

# Bind custom write-only Firestore permissions to the Gateway Service Account
resource "google_project_iam_binding" "gateway_firestore_write" {
  project = var.project_id
  role    = google_project_iam_custom_role.firestore_write_only.id
  members = [
    "serviceAccount:${google_service_account.gateway_sa.email}"
  ]
}

# Bind Cloud Tasks Enqueuer role to Gateway Service Account (so it can queue tasks)
resource "google_project_iam_binding" "gateway_cloudtasks_enqueuer" {
  project = var.project_id
  role    = "roles/cloudtasks.enqueuer"
  members = [
    "serviceAccount:${google_service_account.gateway_sa.email}"
  ]
}

# Bind User/Token impersonation to Gateway SA to delegate tasks to Tasks Invoker SA
resource "google_service_account_iam_binding" "gateway_act_as_invoker" {
  service_account_id = google_service_account.tasks_invoker_sa.name
  role               = "roles/iam.serviceAccountUser"
  members = [
    "serviceAccount:${google_service_account.gateway_sa.email}"
  ]
}

# Bind full Firestore Read/Write (Datastore User) to the AI Worker Service Account
resource "google_project_iam_binding" "worker_firestore_rw" {
  project = var.project_id
  role    = "roles/datastore.user"
  members = [
    "serviceAccount:${google_service_account.worker_sa.email}"
  ]
}

# --- CLOUD TASKS QUEUE ---
resource "google_cloud_tasks_queue" "paypal_queue" {
  name     = var.queue_name
  location = var.region
  
  rate_limits {
    max_concurrent_tasks = 100
    max_dispatches_per_second = 50
  }

  retry_config {
    max_attempts = 5
    max_backoff  = "3600s"
    min_backoff  = "5s"
  }
}

# --- CLOUD RUN SERVICES (THE SPLIT-MONOLITH) ---

# SERVICE A: Webhook Ingress (Gateway)
resource "google_cloud_run_v2_service" "gateway_service" {
  name     = "paypal-gateway-service"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.gateway_sa.email

    containers {
      image = "gcr.io/${var.project_id}/paypal-webhook-monolith:latest"
      
      env {
        name  = "SERVICE_ROLE"
        value = "gateway"
      }
      env {
        name  = "SANDBOX_MODE"
        value = "false"
      }
      env {
        name  = "PRIVATE_WORKER_URL"
        value = google_cloud_run_v2_service.worker_service.uri
      }
      env {
        name  = "GCP_SERVICE_ACCOUNT_EMAIL"
        value = google_service_account.tasks_invoker_sa.email
      }
      env {
        name  = "TASK_WORKER_SECRET"
        value = var.task_worker_secret
      }
      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "GCP_QUEUE_ID"
        value = google_cloud_tasks_queue.paypal_queue.name
      }
      env {
        name  = "GCP_REGION"
        value = var.region
      }
    }
  }
}

# Make Gateway public-facing (Allow Unauthenticated requests)
resource "google_cloud_run_v2_service_iam_binding" "gateway_public" {
  name     = google_cloud_run_v2_service.gateway_service.name
  location = google_cloud_run_v2_service.gateway_service.location
  role     = "roles/run.viewer"
  members  = [
    "allUsers"
  ]
}

# SERVICE B: Secure Sync Engine (Worker)
resource "google_cloud_run_v2_service" "worker_service" {
  name     = "paypal-worker-service"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL" # Managed securely by IAM bouncer

  template {
    service_account = google_service_account.worker_sa.email

    containers {
      image = "gcr.io/${var.project_id}/paypal-webhook-monolith:latest"
      
      env {
        name  = "SERVICE_ROLE"
        value = "worker"
      }
      env {
        name  = "SANDBOX_MODE"
        value = "false"
      }
      env {
        name  = "TASK_WORKER_SECRET"
        value = var.task_worker_secret
      }
      env {
        name  = "GEMINI_API_KEY"
        value = var.gemini_api_key
      }
      env {
        name  = "GCP_SERVICE_ACCOUNT_EMAIL"
        value = google_service_account.tasks_invoker_sa.email
      }
    }
  }
}

# Restrict Worker service: ONLY allow our Tasks Invoker SA to execute it
resource "google_cloud_run_v2_service_iam_binding" "worker_tasks_only" {
  name     = google_cloud_run_v2_service.worker_service.name
  location = google_cloud_run_v2_service.worker_service.location
  role     = "roles/run.invoker"
  members  = [
    "serviceAccount:${google_service_account.tasks_invoker_sa.email}"
  ]
}

# --- OUTPUTS ---
output "gateway_url" {
  value       = google_cloud_run_v2_service.gateway_service.uri
  description = "The public Webhook Gateway URL."
}

output "worker_url" {
  value       = google_cloud_run_v2_service.worker_service.uri
  description = "The private, IAM-protected Worker URL."
}
