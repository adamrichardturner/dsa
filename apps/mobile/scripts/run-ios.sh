#!/bin/sh
set -eu

device_hub="/Applications/Xcode.app/Contents/Applications/DeviceHub.app/Contents/MacOS/DeviceHub"

simulator_count() {
  osascript -e 'tell app "System Events" to count processes whose name is "Simulator" or name is "DeviceHub"'
}

if [ -x "$device_hub" ]; then
  count="$(simulator_count)"
  if [ "$count" = "0" ]; then
    nohup "$device_hub" >/dev/null 2>&1 &
    attempts=0
    while [ "$attempts" -lt 20 ]; do
      count="$(simulator_count)"
      if [ "$count" != "0" ]; then
        break
      fi
      attempts=$((attempts + 1))
      sleep 1
    done
  fi
fi

exec expo run:ios "$@"
