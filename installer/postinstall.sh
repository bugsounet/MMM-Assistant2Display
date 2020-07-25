#!/bin/bash
# +-----------------+
# | npm postinstall |
# | @bugsounet      |
# +-----------------+

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

sudo usermod -a -G gpio pi || echo "Error command: sudo usermod -a -G gpio pi"

Installer_info "Copy recipe 'with-radio_fr.js' to MMM-GoogleAssistant recipe directory"
cp -f ../components/with-radio_fr.js ../../MMM-GoogleAssistant/recipes && Installer_success "Done"

Installer_info "Copy recipe 'with-radio_it.js' to MMM-GoogleAssistant recipe directory"
cp -f ../components/with-radio_it.js ../../MMM-GoogleAssistant/recipes && Installer_success "Done"

Installer_info "Copy recipe 'with-A2DSpotify.js' to MMM-GoogleAssistant recipe direcetory"
cp -f ../components/with-A2DSpotify.js ../../MMM-GoogleAssistant/recipes && Installer_success "Done"

Installer_exit "$Installer_module is now installed !"
