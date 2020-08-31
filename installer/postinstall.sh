#!/bin/bash
# +-----------------+
# | npm postinstall |
# | @bugsounet      |
# +-----------------+

# with or without prompt ?
prompt=true
if [ -e no-prompt ]; then
  prompt=false
fi

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

if $prompt; then
  Installer_info "Copy recipe 'with-radio_fr.js' to MMM-GoogleAssistant recipe directory"
  cp -f ../components/with-radio_fr.js ../../MMM-GoogleAssistant/recipes && Installer_success "Done"
  Installer_info "Copy recipe 'with-radio_it.js' to MMM-GoogleAssistant recipe directory"
  cp -f ../components/with-radio_it.js ../../MMM-GoogleAssistant/recipes && Installer_success "Done"
  Installer_info "Copy recipe 'with-A2DSpotify.js' to MMM-GoogleAssistant recipe direcetory"
  cp -f ../components/with-A2DSpotify.js ../../MMM-GoogleAssistant/recipes && Installer_success "Done"
else
  cp -f ../components/with-radio_fr.js ../../MMM-GoogleAssistant/recipes
  cp -f ../components/with-radio_it.js ../../MMM-GoogleAssistant/recipes
  cp -f ../components/with-A2DSpotify.js ../../MMM-GoogleAssistant/recipes
fi

if $prompt; then
  Installer_exit "$Installer_module is now installed !"
fi

cd ~/MagicMirror/modules/MMM-Assistant2Display
rm -rf no-prompt
