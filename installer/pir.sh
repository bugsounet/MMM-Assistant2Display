#!/bin/bash
# +-----------------------------------+
# | addon A2D Installer by Bugsounet |
# +-----------------------------------+

# get the installer directory
Installer_get_current_dir () {
  SOURCE="${BASH_SOURCE[0]}"
  while [ -h "$SOURCE" ]; do
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

Installer_dir="$(Installer_get_current_dir)"

# move to installler directory
cd "$Installer_dir"

source utils.sh

# del last log
rm installer.log 2>/dev/null

# logs in installer.log file
Installer_log

# Let's start !
Installer_info "Welcome to PIR addon for A2D"
Installer_info "Installer script v$Installer_vinstaller"

echo

# Check not run as root
if [ "$EUID" -eq 0 ]; then
  Installer_error "Install must not be used as root"
  exit 1
fi

Installer_info "Installing dependencies..."
cd ~/MagicMirror/modules/MMM-Assistant2Display/
npm install onoff electron-rebuild
./node_modules/.bin/electron-rebuild
sudo usermod -a -G gpio pi || echo "Error command: sudo usermod -a -G gpio pi"

cd ~/MagicMirror/modules/MMM-Assistant2Display/
echo
