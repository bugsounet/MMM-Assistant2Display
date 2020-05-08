#!/bin/bash
# +--------------------------------+
# | A2D updater                    |
# | Rev 1.0.1                      |
# +--------------------------------+
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
Installer_info "Welcome to A2D updater !"
echo

cd ~/MagicMirror/modules/MMM-Assistant2Display
# deleting package.json because npm install add/update package
rm -rf package.json package-lock.json node_modules
Installer_info "Updating..."
git pull
#fresh package.json
git checkout package.json
Installer_info "Installing..."
# launch installer
npm install
