#!/bin/bash
# +--------------------------------+
# | npm postinstall                |
# | @bugsounet                     |
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

# module name
Installer_module="Assistant2Display addons"

# use beep request questions ?
Installer_beep=false

# check version in package.json file
Installer_version="$(cat ../package.json | grep version | cut -c14-30 2>/dev/null)"

# Let's start !
Installer_info "Welcome to $Installer_module $Installer_version"

echo

# Check not run as root
if [ "$EUID" -eq 0 ]; then
  Installer_error "npm install must not be used as root"
  exit 1
fi

# Check platform compatibility
Installer_info "Checking OS..."
Installer_checkOS
if  [ "$platform" == "osx" ]; then
  Installer_error "OS Detected: $OSTYPE ($os_name $os_version $arch)"
  Installer_error "You need to read documents/install.md for Manual Install"
  exit 0
else
  Installer_success "OS Detected: $OSTYPE ($os_name $os_version $arch)"
fi

echo

Installer_info "Installing all library..."
echo
