#!/usr/bin/env bash
# Captures the raw App Store screens on one simulator into
# store/screenshots/raw/<set>/, signed in as the local screenshot learner.
#
#   store/capture/capture.sh <set: iphone|ipad|duo> <simulator udid> [dark-shots…]
#
# Needs the API running against a local database with that learner, the app
# prebuilt (ios/) with EXPO_PUBLIC_GRAPHQL_URL pointing at it, and SHOTS_EMAIL
# and SHOTS_PASSWORD in the environment. Names after the udid (e.g. "passed")
# are retaken in dark mode. SHOTS_ONLY="testLesson testPractice" retakes some.
set -euo pipefail
cd "$(dirname "$0")/../.."

SET=${1:?set: iphone, ipad or duo}
UDID=${2:?simulator udid}
shift 2
DARK=("$@")
: "${SHOTS_EMAIL:?Set SHOTS_EMAIL}"
: "${SHOTS_PASSWORD:?Set SHOTS_PASSWORD}"
OUT="$PWD/store/screenshots/raw/$SET"
mkdir -p "$OUT" build

export LANG=en_US.UTF-8
GEM_HOME="$(brew --prefix cocoapods)/libexec" ruby store/capture/add-ui-tests.rb

xcrun simctl bootstatus "$UDID" -b >/dev/null
xcrun simctl status_bar "$UDID" override --time "9:41" --dataNetwork wifi --wifiMode active --wifiBars 3 \
  --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100

run() {
  TEST_RUNNER_SHOTS_DIR="$OUT" TEST_RUNNER_SHOTS_EMAIL="$SHOTS_EMAIL" TEST_RUNNER_SHOTS_PASSWORD="$SHOTS_PASSWORD" \
  TEST_RUNNER_SHOTS_LESSON="${SHOTS_LESSON:-Stacks}" \
  xcodebuild test -workspace ios/DSAinTypeScript.xcworkspace -scheme ShotsUITests -configuration Release \
    -destination "id=$UDID" -derivedDataPath build/dd CODE_SIGN_IDENTITY=- CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM= "$@" > "build/capture-$SET.log" 2>&1 \
    || { tail -40 "build/capture-$SET.log"; exit 1; }
}

xcrun simctl ui "$UDID" appearance light
test_name() { echo "ShotsUITests/ShotsUITests/test$(echo "${1:0:1}" | tr a-z A-Z)${1:1}"; }
# The light run skips the dark shots, so a pass taken in the dark run cannot
# change the screens before it.
only=()
for t in ${SHOTS_ONLY:-}; do only+=("-only-testing:ShotsUITests/ShotsUITests/$t"); done
for name in ${DARK[@]+"${DARK[@]}"}; do only+=("-skip-testing:$(test_name "$name")"); done
run ${only[@]+"${only[@]}"}
if [ ${#DARK[@]} -gt 0 ]; then
  xcrun simctl ui "$UDID" appearance dark
  only=()
  for name in "${DARK[@]}"; do only+=("-only-testing:$(test_name "$name")"); done
  run "${only[@]}"
  xcrun simctl ui "$UDID" appearance light
fi
ls -1 "$OUT"
