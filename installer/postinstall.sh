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
Installer_module="Assistant2Display"

Installer_yesno "Do you want to install snowboy detector" && (
  cd ~/MagicMirror/modules/MMM-Assistant2Display/installer/
  ./snowboy.sh
)

Installer_yesno "Do you want to install PIR Sensor" && (
  cd ~/MagicMirror/modules/MMM-Assistant2Display/installer/
  ./pir.sh
)

Installer_exit "$Installer_module is now installed !"
