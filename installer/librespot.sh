#!/bin/bash
# +---------------------+
# | librespot installer |
# | @bugsounet          |
# +---------------------+

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
Installer_info "Welcome to Librespot for A2D installer !"
echo
cd ../components
Installer_info "Cloning repository..."
git clone https://github.com/librespot-org/librespot.git
Installer_success "Done."
echo
Installer_info "Installing Rust..."
#Issue : change RUSTUP_UNPACK_RAM to 100M
curl https://sh.rustup.rs -sSf | RUSTUP_UNPACK_RAM=100000000 sh -s -- --profile default -y
source $HOME/.cargo/env
Installer_success "Done."
echo
Installer_info "Installing Librespot..."
Installer_warning "Open the fridge and take a beer..."
Installer_warning "It could takes ~30 minutes."
cd librespot
cargo build --release --no-default-features --features alsa-backend
Installer_success "Done."
echo
Installer_exit "Librespot for A2D is now installed !"
