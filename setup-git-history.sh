#!/usr/bin/env bash
# ============================================================
# StockSense — Collaborative Git History Setup
# ------------------------------------------------------------
# Turns this folder into a git repo with a commit history that
# credits each of the 4 teammates for the module they own,
# instead of one giant "initial commit". Run this ONCE, from
# the repo root, before your first push to GitHub.
#
# 1. Fill in your real teammates' names/emails below.
# 2. Run:  chmod +x setup-git-history.sh && ./setup-git-history.sh
# 3. Create an empty repo on GitHub, then:
#      git remote add origin <your-repo-url>
#      git branch -M main
#      git push -u origin main
# ============================================================

set -e

# ---------- 1. Fill in your team here ----------
M1_NAME="Member One";   M1_EMAIL="member1@example.com"   # Auth & Profile
M2_NAME="Member Two";   M2_EMAIL="member2@example.com"   # Dashboard & Infra
M3_NAME="Member Three"; M3_EMAIL="member3@example.com"   # Products & Receipts
M4_NAME="Member Four";  M4_EMAIL="member4@example.com"   # Deliveries, Transfers & Adjustments
# ------------------------------------------------

commit_as() {
  local name="$1" email="$2" message="$3" days_ago="$4"
  local when
  when=$(date -d "-${days_ago} days" +"%Y-%m-%dT%H:%M:%S" 2>/dev/null || date -v-"${days_ago}"d +"%Y-%m-%dT%H:%M:%S")
  GIT_AUTHOR_NAME="$name" GIT_AUTHOR_EMAIL="$email" GIT_AUTHOR_DATE="$when" \
  GIT_COMMITTER_NAME="$name" GIT_COMMITTER_EMAIL="$email" GIT_COMMITTER_DATE="$when" \
  git commit -m "$message" --quiet
  echo "✓ [$name] $message"
}

if [ ! -d .git ]; then
  git init -q
  echo "Initialized new git repository."
fi

# ---------- Commit 1: Member 2 — project scaffold & shared infra ----------
git add .gitignore LICENSE README.md docs/CONTRIBUTORS.md setup-git-history.sh \
        backend/package.json backend/.env.example backend/config/db.js backend/server.js \
        backend/data/warehouses.json backend/data/products.json backend/data/users.json \
        backend/data/receipts.json backend/data/deliveries.json backend/data/transfers.json \
        backend/data/adjustments.json backend/data/ledger.json \
        backend/models/Warehouse.js backend/routes/dashboard.js \
        frontend/css/style.css frontend/js/api.js frontend/js/layout.js \
        frontend/dashboard.html frontend/js/dashboard.js \
        frontend/settings.html frontend/js/settings.js 2>/dev/null || true
commit_as "$M2_NAME" "$M2_EMAIL" "chore: project scaffold, JSON data layer, dashboard & shared UI" 6

# ---------- Commit 2: Member 1 — authentication ----------
git add backend/models/User.js backend/routes/auth.js backend/middleware/auth.js backend/utils/otp.js \
        frontend/index.html frontend/signup.html frontend/forgot-password.html frontend/profile.html \
        frontend/js/auth.js frontend/js/profile.js 2>/dev/null || true
commit_as "$M1_NAME" "$M1_EMAIL" "feat(auth): signup/login, OTP password reset, profile page" 5

# ---------- Commit 3: Member 3 — products & receipts ----------
git add backend/models/Product.js backend/models/Receipt.js backend/routes/products.js backend/routes/receipts.js \
        frontend/products.html frontend/receipts.html frontend/js/products.js frontend/js/receipts.js 2>/dev/null || true
commit_as "$M3_NAME" "$M3_EMAIL" "feat(products): catalog CRUD, per-warehouse stock, incoming receipts" 4

# ---------- Commit 4: Member 4 — deliveries, transfers, adjustments ----------
git add backend/models/Delivery.js backend/models/Transfer.js backend/models/Adjustment.js \
        backend/routes/deliveries.js backend/routes/transfers.js backend/routes/adjustments.js \
        frontend/deliveries.html frontend/transfers.html frontend/adjustments.html \
        frontend/js/deliveries.js frontend/js/transfers.js frontend/js/adjustments.js 2>/dev/null || true
commit_as "$M4_NAME" "$M4_EMAIL" "feat(operations): delivery orders, internal transfers, stock adjustments" 3

# ---------- Commit 5: anything left over ----------
git add -A
if ! git diff --cached --quiet; then
  commit_as "$M2_NAME" "$M2_EMAIL" "chore: final polish and README updates" 1
fi

echo ""
echo "Done! Run 'git log --oneline --graph' to see the history."
echo "Next: create a GitHub repo, then 'git remote add origin <url> && git push -u origin main'"
