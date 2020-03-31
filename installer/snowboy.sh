#!/bin/bash
# +--------------------------------+
# | npm pre install                |
# | Snowboy Installer by Bugsounet |
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
source snowboyUtils.sh

# del last log
rm installer.log 2>/dev/null

# logs in installer.log file
Installer_log

# Let's start !
Installer_info "Welcome to Snowboy addon for A2D"
Installer_info "Installer script v$Installer_vinstaller"

echo

# Check not run as root
if [ "$EUID" -eq 0 ]; then
  Installer_error "Install must not be used as root"
  exit 1
fi

# Check platform compatibility
Installer_info "Checking OS..."
Installer_checkOS
if  [ "$platform" == "osx" ]; then
  Installer_error "OS Detected: $OSTYPE ($os_name $os_version $arch)"
  Installer_error "You need to do Manual Install"
  exit 0
else
  Installer_success "OS Detected: $OSTYPE ($os_name $os_version $arch)"
fi

echo

# check dependencies
dependencies=(libmagic-dev libatlas-base-dev sox libsox-fmt-all build-essential)
Installer_info "Checking all dependencies..."
Installer_check_dependencies
Installer_success "All Dependencies needed are installed !"

# install snowboy
echo
Installer_info "Snowboy"
Hotword_CloneSB
Hotword_InstSB

echo
# all is ok than electron-rebuild
Installer_info "Electron Rebuild"
Hotword_Electron
Installer_success "Electron Rebuild Complete!"

#check installation
Hotword_CheckSB

cd ~/MagicMirror/modules/MMM-AssistantMk2/
echo
