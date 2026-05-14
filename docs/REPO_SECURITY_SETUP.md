# Repo Security Setup

One-time configuration for the GitHub repo. Run via `gh` CLI (already authenticated as repo owner) or via GitHub UI under Settings → Branches.

## 1. Enable branch protection on `main`

### Via `gh` CLI (recommended)

```bash
gh api -X PUT \
  "repos/Kreativepardha/TSGOV-AccountabiltiyTracker/branches/main/protection" \
  -F "required_status_checks[strict]=true" \
  -F "required_status_checks[contexts][]=Vercel" \
  -F "enforce_admins=false" \
  -F "required_pull_request_reviews[required_approving_review_count]=1" \
  -F "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -F "required_pull_request_reviews[require_code_owner_reviews]=true" \
  -F "restrictions=" \
  -F "allow_force_pushes=false" \
  -F "allow_deletions=false" \
  -F "block_creations=false" \
  -F "required_conversation_resolution=true" \
  -F "lock_branch=false" \
  -F "allow_fork_syncing=true"
```

### Via GitHub UI

Settings → Branches → Add branch ruleset → name `main-protection`:

- **Branch name pattern:** `main`
- **Enforcement status:** Active
- ✅ Restrict deletions
- ✅ Restrict force pushes
- ✅ Require a pull request before merging
  - Required approvals: 1
  - ✅ Dismiss stale reviews on push
  - ✅ Require review from Code Owners
  - ✅ Require conversation resolution before merging
- ✅ Require status checks to pass
  - Required: `Vercel` (will appear after first Vercel deploy)
- ✅ Block force pushes
- ✅ Require linear history (optional, prevents merge commits)
- ⬜ Require signed commits (optional — strongest, but blocks web commits)

## 2. Enable security features

```bash
# Enable Dependabot, secret scanning, code scanning
gh api -X PATCH \
  "repos/Kreativepardha/TSGOV-AccountabiltiyTracker" \
  -F "security_and_analysis[secret_scanning][status]=enabled" \
  -F "security_and_analysis[secret_scanning_push_protection][status]=enabled" \
  -F "security_and_analysis[dependabot_security_updates][status]=enabled"
```

Or UI: Settings → Code security and analysis → enable everything offered (all free for public repos).

## 3. Disable public push (already default — verify)

Settings → General → check:
- "Limit how interactions with this repo" → unset (allow all)
- "Wikis" → off (use Discussions instead)
- "Issues" → on
- "Discussions" → on (enables Q&A surface for contributors)
- "Allow forking" → on (encourages contribution)

## 4. Configure Dependabot

Already done — `dependabot.yml` ships in `.github/`. Auto-PRs for npm + GitHub Actions updates weekly.

## 5. Secret scanning push protection

When enabled, GitHub blocks pushes that contain detected secrets (API keys, tokens). One-time enable above. After that, any commit that contains `NVIDIA_API_KEY`, `DATABASE_URL` etc. will be rejected pre-push.

## 6. CODEOWNERS

`/CODEOWNERS` exists. With "Require review from Code Owners" enabled, the listed owners are auto-requested as reviewers for relevant paths.

## 7. Vercel integration

Vercel automatically appears as a required status check after the first preview deploy. To make it required:

- Open a test PR
- Vercel posts a deploy preview → status check appears named `Vercel`
- Add `Vercel` to required checks in branch protection

## 8. Verify

```bash
gh api "repos/Kreativepardha/TSGOV-AccountabiltiyTracker/branches/main/protection" | jq
```

Should show:
- `required_pull_request_reviews.required_approving_review_count: 1`
- `required_status_checks.contexts: ["Vercel"]`
- `allow_force_pushes.enabled: false`
- `allow_deletions.enabled: false`

## What contributors see

After setup, any non-owner trying to push directly to `main` gets:

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Required status check "Vercel" is expected.
```

They must:
1. Fork → branch → PR
2. Wait for Vercel preview build to pass
3. Wait for 1 review from a CODEOWNER
4. Resolve any review comments
5. Then `Merge` button unlocks

This blocks accidental main pushes, blocks rogue commits, and ensures every change is build-tested.
