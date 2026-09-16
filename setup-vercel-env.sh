#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# উদ্ভিদ গোয়েন্দা (Plant Detective) — Vercel Environment Setup
# ─────────────────────────────────────────────────────────────
# This script adds all required environment variables to Vercel.
#
# Prerequisites:
#   1. Install Vercel CLI:  npm i -g vercel
#   2. Login:                vercel login
#   3. Link project:         vercel link  (run from project root)
#
# Usage:
#   chmod +x setup-vercel-env.sh
#   ./setup-vercel-env.sh
#
# The script will prompt you for each API key value.
# All keys are set for Production, Preview, and Development environments.
# ─────────────────────────────────────────────────────────────

set -e

# Colors for readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  উদ্ভিদ গোয়েন্দা (Plant Detective) — Vercel Env Setup${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI not found.${NC}"
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Check if project is linked
if [ ! -d ".vercel" ]; then
    echo -e "${YELLOW}Project not linked to Vercel. Linking now...${NC}"
    vercel link --yes
    echo ""
fi

# Helper: Add env var to all 3 environments
add_env_var() {
    local name="$1"
    local description="$2"
    local required="$3"

    echo -e "${CYAN}━━━ ${name} ━━━${NC}"
    echo -e "  ${description}"

    if [ "$required" = "required" ]; then
        echo -e "  ${RED}(Required)${NC}"
    else
        echo -e "  ${YELLOW}(Optional)${NC}"
    fi

    echo -n "  Enter value (or press Enter to skip): "
    read -r value

    if [ -z "$value" ]; then
        if [ "$required" = "required" ]; then
            echo -e "  ${RED}Skipped required var — you'll need to set it later!${NC}"
        else
            echo -e "  ${YELLOW}Skipped.${NC}"
        fi
        echo ""
        return
    fi

    # Add to Production, Preview, and Development
    echo "$value" | vercel env add "$name" production
    echo "$value" | vercel env add "$name" preview
    echo "$value" | vercel env add "$name" development
    echo -e "  ${GREEN}✓ Added to all environments${NC}"
    echo ""
}

# ═══ AI Provider Keys ═══
echo -e "${GREEN}═══ AI Provider Keys ═══${NC}"
echo -e "At least ONE is required for diagnosis to work."
echo ""

add_env_var "GEMINI_API_KEY" "Google Gemini API Key — https://aistudio.google.com/apikey" "required"
add_env_var "GROQ_API_KEY" "Groq API Key — https://console.groq.com/keys" "required"
add_env_var "OPENROUTER_API_KEY" "OpenRouter API Key — https://openrouter.ai/keys" "required"

# ═══ Free-tier AI safety policy ═══
echo -e "${GREEN}═══ Free-tier AI safety policy ═══${NC}"
add_env_var "AI_MAX_ATTEMPTS" "Maximum provider attempts per diagnosis (default 5)" "optional"
add_env_var "AI_MAX_REQUESTS_PER_DAY" "Maximum diagnosis requests per day (default 250)" "optional"
add_env_var "AI_MAX_VISION_REQUESTS_PER_DAY" "Maximum image diagnosis requests per day (default 100)" "optional"
add_env_var "AI_MAX_OUTPUT_TOKENS" "Maximum model output tokens (default 2200)" "optional"
add_env_var "AI_MAX_IMAGE_BYTES" "Maximum image payload bytes (default 6000000)" "optional"
add_env_var "AI_REQUEST_TIMEOUT_MS" "Maximum provider deadline in milliseconds (default 25000)" "optional"

# ═══ Turso Database ═══
echo -e "${GREEN}═══ Turso Database ═══${NC}"
echo -e "Required for persistent analytics, feedback, and presence tracking."
echo -e "Free tier: 9GB storage, 1B reads/month, 25M writes/month."
echo -e "Sign up at: https://turso.tech"
echo -e "Quick setup: turso db create cabi-diagnosis && turso db tokens create cabi-diagnosis"
echo ""

add_env_var "TURSO_DATABASE_URL" "Turso DB URL (e.g. libsql://cabi-diagnosis-your-org.turso.io)" "required"
add_env_var "TURSO_AUTH_TOKEN" "Turso auth token" "required"

# ═══ Auto-Configured ═══
echo -e "${GREEN}═══ Auto-Configured Security ═══${NC}"
echo -e "${YELLOW}Request signing and admin secret are AUTO-DERIVED from your Turso credentials.${NC}"
echo -e "${YELLOW}No separate secrets needed — zero manual configuration.${NC}"
echo ""

# ═══ Summary ═══
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Setup Complete!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Required env vars (5):"
echo -e "  ${GREEN}✓${NC} GEMINI_API_KEY"
echo -e "  ${GREEN}✓${NC} GROQ_API_KEY"
echo -e "  ${GREEN}✓${NC} OPENROUTER_API_KEY"
echo -e "  ${GREEN}✓${NC} TURSO_DATABASE_URL"
echo -e "  ${GREEN}✓${NC} TURSO_AUTH_TOKEN"
echo ""
echo -e "Auto-configured (0):"
echo -e "  ${YELLOW}→${NC} API_SIGNING_SECRET (auto-derived from Turso)"
echo -e "  ${YELLOW}→${NC} ADMIN_SECRET (auto-derived from Turso)"
echo ""
echo -e "No more Supabase! Turso free tier has no project pausing or strict quotas."
echo ""
echo -e "Next steps:"
echo -e "  1. Run: ${CYAN}vercel --prod${NC} to deploy"
echo -e "  2. Or push to GitHub — Vercel auto-deploys"
echo ""
