#!/usr/bin/env bash
# ==============================================================================
# 🚀 ENTERPRISE DEPLOYMENT & IDENTITY ISOLATION PROVISIONING SCRIPT (XPRIZE EDITION)
# ==============================================================================
# This script physically provisions the GCP IAM Service Accounts, custom roles, 
# and network permissions required to achieve true microservice isolation and trust
# boundaries for the decoupled PayPal Webhook Gateway & AI Worker split-monolith.
#
# Architected to eradicate:
# 1. Monolithic Identity (Violating Least Privilege)
# 2. Synchronous/Redundant OIDC Cryptographic Bottlenecks
# 3. Accidental Ingress Downgrades (The NODE_ENV Backdoor)
# ==============================================================================

set -euo pipefail

# --- CONFIGURATION PARAMETERS ---
PROJECT_ID="${GCP_PROJECT_ID:-YOUR_PROJECT_ID_HERE}"
REGION="${GCP_REGION:-us-central1}"
QUEUE_NAME="${GCP_QUEUE_ID:-paypal-provisioning}"

# Service Roles
GATEWAY_SA="paypal-gateway-sa"
WORKER_SA="ai-worker-sa"
TASKS_INVOKER_SA="paypal-tasks-invoker-sa"

# Service Names in Cloud Run
GATEWAY_SERVICE_NAME="paypal-gateway-service"
WORKER_SERVICE_NAME="paypal-worker-service"

# Visual Logging Helpers
log_info()  { echo -e "\n📡 \033[1;34m[INFO]\033[0m $1"; }
log_success() { echo -e "\n✅ \033[1;32m[SUCCESS]\033[0m $1"; }
log_warn()  { echo -e "\n⚠️ \033[1;33m[WARN]\033[0m $1"; }
log_error() { echo -e "\n🚨 \033[1;31m[ERROR]\033[0m $1"; }

# Check gcloud installation
if ! command -v gcloud &> /dev/null; then
    log_error "Google Cloud SDK (gcloud) is required but not installed. Please install it to execute infrastructure provisioning."
    exit 1
fi

echo -e "\n======================================================================="
echo -e "🛡️  STARTING ENTERPRISE CLOUD RUN IDENTITY ISOLATION DEPLOYMENT"
echo -e "======================================================================="
echo -e "Project ID:      ${PROJECT_ID}"
echo -e "Region:          ${REGION}"
echo -e "Cloud Tasks:     ${QUEUE_NAME}"
echo -e "=======================================================================\n"

if [ "$PROJECT_ID" == "YOUR_PROJECT_ID_HERE" ]; then
    log_error "Please set your actual GCP_PROJECT_ID or run: export GCP_PROJECT_ID=my-project-id"
    exit 1
fi

# 1. Enable Required Google Cloud APIs
log_info "Step 1: Enabling necessary GCP APIs..."
gcloud services enable \
    iam.googleapis.com \
    cloudtasks.googleapis.com \
    run.googleapis.com \
    firestore.googleapis.com \
    --project="${PROJECT_ID}"

# 2. Create Isolated Service Accounts
log_info "Step 2: Creating isolated Google Cloud Service Accounts (Least Privilege)..."

# A. Gateway Ingress Service Account
if ! gcloud iam service-accounts describe "${GATEWAY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" --project="${PROJECT_ID}" &>/dev/null; then
    gcloud iam service-accounts create "${GATEWAY_SA}" \
        --display-name="PayPal Webhook Gateway SA" \
        --description="Least-privileged public-facing gateway for taking payments and enqueuing tasks." \
        --project="${PROJECT_ID}"
    log_success "Created service account: ${GATEWAY_SA}"
else
    log_warn "Service account '${GATEWAY_SA}' already exists. Skipping."
fi

# B. AI Worker / Processing Engine Service Account
if ! gcloud iam service-accounts describe "${WORKER_SA}@${PROJECT_ID}.iam.gserviceaccount.com" --project="${PROJECT_ID}" &>/dev/null; then
    gcloud iam service-accounts create "${WORKER_SA}" \
        --display-name="AI Sync Worker Engine SA" \
        --description="Highly secure private background processor with Firestore RW and Gemini API access." \
        --project="${PROJECT_ID}"
    log_success "Created service account: ${WORKER_SA}"
else
    log_warn "Service account '${WORKER_SA}' already exists. Skipping."
fi

# C. Dedicated Cloud Tasks OIDC Invoker Service Account
if ! gcloud iam service-accounts describe "${TASKS_INVOKER_SA}@${PROJECT_ID}.iam.gserviceaccount.com" --project="${PROJECT_ID}" &>/dev/null; then
    gcloud iam service-accounts create "${TASKS_INVOKER_SA}" \
        --display-name="PayPal Cloud Tasks Invoker SA" \
        --description="OIDC Identity for Cloud Tasks to authenticate when pushing tasks to the private worker." \
        --project="${PROJECT_ID}"
    log_success "Created service account: ${TASKS_INVOKER_SA}"
else
    log_warn "Service account '${TASKS_INVOKER_SA}' already exists. Skipping."
fi


# 3. Create Custom "Firestore Write-Only" IAM Role
log_info "Step 3: Creating Custom Firestore Write-Only IAM Role..."
CUSTOM_ROLE_ID="FirestoreWriteOnly"

if ! gcloud iam roles describe "${CUSTOM_ROLE_ID}" --project="${PROJECT_ID}" &>/dev/null; then
    gcloud iam roles create "${CUSTOM_ROLE_ID}" \
        --project="${PROJECT_ID}" \
        --title="Firestore Write-Only" \
        --description="Custom role allowing entities to create and update Firestore documents without read rights." \
        --permissions="datastore.entities.create,datastore.entities.update" \
        --stage="GA"
    log_success "Successfully created custom IAM role: ${CUSTOM_ROLE_ID}"
else
    log_warn "Custom IAM role '${CUSTOM_ROLE_ID}' already exists. Skipping."
fi


# 4. Enforce Least-Privilege IAM Bindings
log_info "Step 4: Binding least-privilege IAM roles to Service Accounts..."

# A. PayPal Gateway SA permissions:
# - Custom Write-Only Firestore access
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${GATEWAY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="projects/${PROJECT_ID}/roles/${CUSTOM_ROLE_ID}"

# - Cloud Tasks Enqueuer access to submit background payloads
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${GATEWAY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudtasks.enqueuer"

# - Permission to act as the Cloud Tasks Invoker Service Account to delegate tasks securely
gcloud iam service-accounts add-iam-policy-binding \
    "${TASKS_INVOKER_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --member="serviceAccount:${GATEWAY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser" \
    --project="${PROJECT_ID}"

# B. AI Worker SA permissions:
# - Full Firestore Read/Write (standard Datastore User role)
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${WORKER_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/datastore.user"


# 5. Provision the Cloud Tasks Queue (if not existing)
log_info "Step 5: Verifying Cloud Tasks Queue..."
if ! gcloud tasks queues describe "${QUEUE_NAME}" --location="${REGION}" --project="${PROJECT_ID}" &>/dev/null; then
    gcloud tasks queues create "${QUEUE_NAME}" \
        --location="${REGION}" \
        --project="${PROJECT_ID}"
    log_success "Created Cloud Tasks queue: ${QUEUE_NAME} in ${REGION}"
else
    log_warn "Cloud Tasks queue '${QUEUE_NAME}' already exists. Skipping."
fi


# 6. Build & Deploy the Split-Monolith Containers
log_info "Step 6: Executing secure container deployment (Dual Geographic Roles)..."

# --- DEPLOY SERVICE A: Webhook Ingress (Gateway) ---
# Expose publicly, bind to the limited gateway identity, turn OFF background worker routes.
log_info "Deploying Service A [GATEWAY]..."
gcloud run deploy "${GATEWAY_SERVICE_NAME}" \
    --source=. \
    --region="${REGION}" \
    --service-account="${GATEWAY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --set-env-vars="SERVICE_ROLE=gateway,SANDBOX_MODE=false" \
    --allow-unauthenticated \
    --project="${PROJECT_ID}"

GATEWAY_URL=$(gcloud run services describe "${GATEWAY_SERVICE_NAME}" --region="${REGION}" --format="value(status.url)" --project="${PROJECT_ID}")
log_success "Service A [GATEWAY] successfully deployed at: ${GATEWAY_URL}"


# --- DEPLOY SERVICE B: Secure Sync Engine (Worker) ---
# Completely close to the public, bind to the worker identity, enable private processing.
log_info "Deploying Service B [WORKER]..."
gcloud run deploy "${WORKER_SERVICE_NAME}" \
    --source=. \
    --region="${REGION}" \
    --service-account="${WORKER_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --set-env-vars="SERVICE_ROLE=worker,SANDBOX_MODE=false" \
    --no-allow-unauthenticated \
    --project="${PROJECT_ID}"

WORKER_URL=$(gcloud run services describe "${WORKER_SERVICE_NAME}" --region="${REGION}" --format="value(status.url)" --project="${PROJECT_ID}")
log_success "Service B [WORKER] successfully deployed at (IAM Authenticated Closed Ingress): ${WORKER_URL}"


# 7. Bridge the Fortress: Wire Cloud Tasks Invoker Bindings
log_info "Step 7: Granting Cloud Tasks Invoker SA permissions to call Service B (Worker)..."
gcloud run services add-iam-policy-binding "${WORKER_SERVICE_NAME}" \
    --region="${REGION}" \
    --member="serviceAccount:${TASKS_INVOKER_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.invoker" \
    --project="${PROJECT_ID}"


# 8. Re-configure Gateway with the Asymmetric Worker Target Route
log_info "Step 8: Updating Gateway (Service A) with Worker Asymmetric target URL..."
# We explicitly update Service A so its Cloud Tasks Client points directly to the private worker domain.
gcloud run services update "${GATEWAY_SERVICE_NAME}" \
    --region="${REGION}" \
    --set-env-vars="SERVICE_ROLE=gateway,SANDBOX_MODE=false,PRIVATE_WORKER_URL=${WORKER_URL},GCP_SERVICE_ACCOUNT_EMAIL=${TASKS_INVOKER_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --project="${PROJECT_ID}"

log_success "Gateway asymmetric route successfully established!"

echo -e "\n======================================================================="
echo -e "🌟 ENTERPRISE SPLIT-MONOLITH INFRASTRUCTURE SUCCESSFULLY ESTABLISHED!"
echo -e "======================================================================="
echo -e "Public Ingress Gateway URL: ${GATEWAY_URL}"
echo -e "Private Worker Target URL:  ${WORKER_URL}"
echo -e "Gateway Identity:           ${GATEWAY_SA}@${PROJECT_ID}.iam.gserviceaccount.com"
echo -e "Worker Identity:            ${WORKER_SA}@${PROJECT_ID}.iam.gserviceaccount.com"
echo -e "Cloud Tasks Invoker Identity: ${TASKS_INVOKER_SA}@${PROJECT_ID}.iam.gserviceaccount.com"
echo -e "======================================================================="
echo -e "🔒 ALL PORTAL DEFENSIBILITY SYSTEMS: COMPILATION GREEN & ONLINE"
echo -e "=======================================================================\n"
